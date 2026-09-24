/**
 * Proves the no-overbooking guarantee: 30 users race for 5 spots.
 * Run: npm run test:concurrency   (needs a running MongoDB)
 */
import mongoose from 'mongoose';
import { env } from '../config/env';
import { Competition, Registration, User } from '../models';
import { registerForCompetition } from '../services/registration.service';

const SPOTS = 5;
const USERS = 30;

async function main() {
  await mongoose.connect(env.MONGODB_URI);
  await Registration.syncIndexes();

  const stamp = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const comp = await Competition.create({
    title: 'Concurrency Test', slug: `concurrency-test-${stamp}`, categories: [],
    judge: { name: 'Test Judge', title: 'Tester', experienceYears: 1 },
    entryFee: 10, prizePool: 100, rewards: [{ rank: 1, label: 'Winner', amount: 100 }],
    totalSpots: SPOTS, spotsFilled: 0,
    registrationDeadline: new Date(stamp + day), submissionStart: new Date(stamp + 2 * day),
    submissionEnd: new Date(stamp + 3 * day), resultDate: new Date(stamp + 4 * day),
    content: { about: 'test' },
  });
  const users = await User.create(
    Array.from({ length: USERS }, (_, i) => ({ name: `Racer ${i}`, email: `racer${i}-${stamp}@example.com` }))
  );

  const results = await Promise.allSettled(users.map((u) => registerForCompetition(comp.id, u.id)));
  const ok = results.filter((r) => r.status === 'fulfilled').length;
  const full = results.filter((r) => r.status === 'rejected' && (r.reason as { code?: string }).code === 'COMPETITION_FULL').length;

  const [finalComp, regCount] = await Promise.all([
    Competition.findById(comp.id).lean(),
    Registration.countDocuments({ competitionId: comp._id }),
  ]);

  console.log({ succeeded: ok, rejectedFull: full, spotsFilled: finalComp?.spotsFilled, registrations: regCount });
  const pass = ok === SPOTS && finalComp?.spotsFilled === SPOTS && regCount === SPOTS;
  console.log(pass ? 'PASS: no overbooking' : 'FAIL: invariant violated');

  await Promise.all([
    Competition.deleteOne({ _id: comp._id }),
    Registration.deleteMany({ competitionId: comp._id }),
    User.deleteMany({ _id: { $in: users.map((u) => u._id) } }),
  ]);
  await mongoose.disconnect();
  process.exit(pass ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
