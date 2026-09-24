import { Competition, Registration } from '../models';
import { AppError } from '../utils/AppError';
import { getCompetitionState } from '../utils/competitionState';

interface SubmissionInput {
  title: string;
  description?: string;
  fileUrl: string;
}

export async function submitEntry(competitionId: string, userId: string, input: SubmissionInput) {
  const now = new Date();

  const competition = await Competition.findOne({ _id: competitionId, status: 'published' }).lean();
  if (!competition) throw new AppError(404, 'COMPETITION_NOT_FOUND', 'Competition not found');

  // Window is enforced with the same pure function the GET endpoint exposes to the UI.
  const { submissionWindow } = getCompetitionState(competition, now);
  if (submissionWindow === 'not_started') {
    throw new AppError(403, 'SUBMISSION_NOT_STARTED', 'Submissions have not opened yet', {
      submissionStart: competition.submissionStart,
    });
  }
  if (submissionWindow === 'closed') {
    throw new AppError(403, 'SUBMISSION_CLOSED', 'Submissions are closed for this competition');
  }

  // Atomic, conditional update: only a PAID, NOT-YET-SUBMITTED registration can transition.
  // A double tap / retry can therefore never overwrite or double-submit.
  const updated = await Registration.findOneAndUpdate(
    {
      competitionId,
      userId,
      paymentStatus: 'paid',
      'submission.status': 'not_submitted',
    },
    {
      $set: {
        'submission.status': 'submitted',
        'submission.title': input.title,
        'submission.description': input.description,
        'submission.fileUrl': input.fileUrl,
        'submission.submittedAt': now,
      },
    },
    { new: true }
  );

  if (updated) return updated;

  // Nothing matched -> tell the client why.
  const reg = await Registration.findOne({ competitionId, userId }).lean();
  if (!reg) throw new AppError(403, 'NOT_REGISTERED', 'You must register before submitting');
  if (reg.paymentStatus !== 'paid') {
    throw new AppError(402, 'PAYMENT_REQUIRED', 'Complete your payment before submitting');
  }
  throw new AppError(409, 'ALREADY_SUBMITTED', 'You have already submitted an entry');
}
