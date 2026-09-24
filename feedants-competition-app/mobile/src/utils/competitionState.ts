import { Competition, SubmissionWindow } from '../types/competition';

export interface DerivedState {
  isFull: boolean;
  registrationOpen: boolean;
  submissionWindow: SubmissionWindow;
  resultsDeclared: boolean;
}

/**
 * Client-side twin of the backend's getCompetitionState(), evaluated against the ticking
 * server-corrected `now`. This is what makes the UI flip by itself (e.g. State C -> State B the
 * second the submission window opens) without waiting for a refetch. The server still enforces
 * every rule, so a wrong guess here can only ever produce a friendly error, never bad data.
 */
export function deriveState(c: Competition, now: Date): DerivedState {
  const t = now.getTime();
  const isFull = c.spotsFilled >= c.totalSpots;
  return {
    isFull,
    registrationOpen: c.status === 'published' && !isFull && t < new Date(c.registrationDeadline).getTime(),
    submissionWindow:
      t < new Date(c.submissionStart).getTime()
        ? 'not_started'
        : t <= new Date(c.submissionEnd).getTime()
        ? 'open'
        : 'closed',
    resultsDeclared: t >= new Date(c.resultDate).getTime(),
  };
}

export interface ActiveCountdown { label: string; target: string }

/** Which timer the hero countdown should show right now. */
export function getActiveCountdown(c: Competition, s: DerivedState): ActiveCountdown | null {
  if (s.registrationOpen) return { label: 'Registration closes in', target: c.registrationDeadline };
  if (s.submissionWindow === 'not_started') return { label: 'Submission starts in', target: c.submissionStart };
  if (s.submissionWindow === 'open') return { label: 'Submission ends in', target: c.submissionEnd };
  if (!s.resultsDeclared) return { label: 'Results in', target: c.resultDate };
  return null;
}
