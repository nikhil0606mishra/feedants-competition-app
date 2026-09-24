import crypto from 'crypto';
import { Competition, Registration, User } from '../models';
import { AppError } from '../utils/AppError';

/**
 * Register a user for a competition without ever overbooking.
 *
 * 1. Cheap pre-checks (user exists, not already registered) -> friendly errors, no spot touched.
 * 2. ATOMIC CLAIM: one findOneAndUpdate whose filter contains every rule (published, deadline not
 *    passed, spotsFilled < totalSpots) and whose update is $inc. MongoDB executes it as a single
 *    atomic operation on the document, so N concurrent requests for the last spot -> exactly one
 *    matches the filter; the rest get null.
 * 3. Insert the Registration. The unique {competitionId, userId} index is the final guard against
 *    duplicate requests racing past step 1.
 * 4. If step 3 fails, release the spot (compensating $inc: -1).
 *
 * Failure mode: if the process crashes between 2 and 3 a spot leaks (under-booking). We deliberately
 * choose this direction over the reverse; it is self-healing via a reconcile job (see README).
 */
export async function registerForCompetition(competitionId: string, userId: string) {
  const now = new Date();

  const [userExists, alreadyRegistered] = await Promise.all([
    User.exists({ _id: userId }),
    Registration.exists({ competitionId, userId }),
  ]);
  if (!userExists) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  if (alreadyRegistered) {
    throw new AppError(409, 'ALREADY_REGISTERED', 'You are already registered for this competition');
  }

  // --- Step 2: atomic spot claim ---
  const competition = await Competition.findOneAndUpdate(
    {
      _id: competitionId,
      status: 'published',
      registrationDeadline: { $gt: now },
      $expr: { $lt: ['$spotsFilled', '$totalSpots'] },
    },
    { $inc: { spotsFilled: 1 } },
    { new: true }
  );

  if (!competition) throw await explainClaimFailure(competitionId, now);

  // --- Step 3: create registration (payment is mocked as instantly successful) ---
  try {
    const registration = await Registration.create({
      competitionId,
      userId,
      paymentStatus: 'paid',
      paymentReference: `MOCK_${crypto.randomBytes(6).toString('hex')}`,
      amountPaid: competition.entryFee,
    });
    return { registration, competition };
  } catch (err) {
    // --- Step 4: release the spot we claimed ---
    await Competition.updateOne(
      { _id: competitionId, spotsFilled: { $gt: 0 } },
      { $inc: { spotsFilled: -1 } }
    ).catch((e) => console.error('CRITICAL: failed to release spot', { competitionId, e }));

    if ((err as { code?: number })?.code === 11000) {
      throw new AppError(409, 'ALREADY_REGISTERED', 'You are already registered for this competition');
    }
    throw err;
  }
}

// The claim only returns null; work out WHY so the client gets an actionable error.
async function explainClaimFailure(competitionId: string, now: Date): Promise<AppError> {
  const c = await Competition.findById(competitionId).lean();
  if (!c || c.status !== 'published') {
    return new AppError(404, 'COMPETITION_NOT_FOUND', 'Competition not found');
  }
  if (now >= c.registrationDeadline) {
    return new AppError(409, 'REGISTRATION_CLOSED', 'Registration has closed for this competition');
  }
  if (c.spotsFilled >= c.totalSpots) {
    return new AppError(409, 'COMPETITION_FULL', 'All spots have been taken');
  }
  // A spot was released between the claim and this read; safe for the client to retry.
  return new AppError(409, 'REGISTRATION_UNAVAILABLE', 'Could not reserve a spot, please retry');
}
