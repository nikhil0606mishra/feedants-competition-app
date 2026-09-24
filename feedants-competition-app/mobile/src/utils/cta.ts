import { Competition, Viewer } from '../types/competition';
import { DerivedState } from './competitionState';
import { formatINR, formatShortDate } from './time';

export type CtaKind =
  | 'register'           // State A
  | 'upload'             // State B
  | 'registered_wait'    // State C
  | 'closed'             // State D
  | 'submitted'          // extra: entry already sent
  | 'submission_closed'; // extra: registered but missed the window

export interface Cta { kind: CtaKind; label: string; subLabel?: string; disabled: boolean }

/**
 * Pure function: (data, time) -> button. No hooks, no side effects, trivially unit-testable.
 * Registered users are resolved first because their state doesn't depend on spots/registration.
 */
export function getCtaState(c: Competition, viewer: Viewer | null, s: DerivedState): Cta {
  if (viewer?.isRegistered) {
    if (viewer.submissionStatus === 'submitted') {
      return { kind: 'submitted', label: 'Submitted ✓', disabled: true };
    }
    switch (s.submissionWindow) {
      case 'open':
        return { kind: 'upload', label: 'Upload Submission', subLabel: 'Registered', disabled: false };
      case 'not_started':
        return { kind: 'registered_wait', label: `Registered (Starts on ${formatShortDate(c.submissionStart)})`, disabled: true };
      case 'closed':
        return { kind: 'submission_closed', label: 'Submission Closed', disabled: true };
    }
  }

  if (s.registrationOpen) {
    const price = c.entryFee === 0 ? 'Free' : formatINR(c.entryFee);
    return { kind: 'register', label: `Register Now (${price})`, disabled: false };
  }

  return { kind: 'closed', label: 'Registration Closed', disabled: true };
}
