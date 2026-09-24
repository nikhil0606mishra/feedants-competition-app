import { ICompetition } from '../models';

export type SubmissionWindow = 'not_started' | 'open' | 'closed';

type StateInput = Pick<
  ICompetition,
  'status' | 'totalSpots' | 'spotsFilled' | 'registrationDeadline' | 'submissionStart' | 'submissionEnd' | 'resultDate'
>;

/**
 * Pure function: everything time-dependent is derived here from dates + `now`.
 * Reused by GET (to describe state), register and submit (to enforce rules), so the
 * UI's idea of "open/closed" can never disagree with the server's.
 */
export function getCompetitionState(c: StateInput, now: Date = new Date()) {
  const isFull = c.spotsFilled >= c.totalSpots;
  const registrationOpen = c.status === 'published' && !isFull && now < c.registrationDeadline;

  const submissionWindow: SubmissionWindow =
    now < c.submissionStart ? 'not_started' : now <= c.submissionEnd ? 'open' : 'closed';

  return {
    serverTime: now.toISOString(), // client uses this to correct clock skew in countdowns
    isFull,
    registrationOpen,
    submissionWindow,
    resultsDeclared: now >= c.resultDate,
  };
}
