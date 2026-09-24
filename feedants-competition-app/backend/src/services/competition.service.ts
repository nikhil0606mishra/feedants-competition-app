import { Competition, Registration } from '../models';
import { AppError } from '../utils/AppError';
import { getCompetitionState } from '../utils/competitionState';

export async function getCompetitionDetails(id: string, userId?: string) {
  // The two reads are independent -> run them in parallel.
  // Registration lookup is served by the unique {competitionId, userId} index.
  const [competition, registration] = await Promise.all([
    Competition.findOne({ _id: id, status: 'published' }),
    userId ? Registration.findOne({ competitionId: id, userId }).lean() : Promise.resolve(null),
  ]);

  if (!competition) throw new AppError(404, 'COMPETITION_NOT_FOUND', 'Competition not found');

  const state = getCompetitionState(competition);

  const viewer = userId
    ? {
        userId,
        isRegistered: !!registration,
        paymentStatus: registration?.paymentStatus ?? null,
        registeredAt: registration?.createdAt ?? null,
        submissionStatus: registration?.submission.status ?? null,
        canSubmit:
          !!registration &&
          registration.paymentStatus === 'paid' &&
          registration.submission.status === 'not_submitted' &&
          state.submissionWindow === 'open',
      }
    : null;

  return { competition: competition.toJSON(), state, viewer };
}
