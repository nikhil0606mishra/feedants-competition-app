import { Schema, model, Types, HydratedDocument } from 'mongoose';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type SubmissionStatus = 'not_submitted' | 'submitted';

export interface IRegistration {
  competitionId: Types.ObjectId;
  userId: Types.ObjectId;

  paymentStatus: PaymentStatus;
  paymentReference?: string; // gateway order/payment id (mocked for the assignment)
  amountPaid: number;        // snapshot of the fee at registration time

  submission: {
    status: SubmissionStatus;
    title?: string;
    description?: string;
    fileUrl?: string;
    submittedAt?: Date;
  };

  createdAt: Date; // = registration timestamp
  updatedAt: Date;
}

export type RegistrationDoc = HydratedDocument<IRegistration>;

const RegistrationSchema = new Schema<IRegistration>(
  {
    competitionId: { type: Schema.Types.ObjectId, ref: 'Competition', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentReference: { type: String, trim: true },
    amountPaid: { type: Number, required: true, min: 0 },

    submission: {
      status: { type: String, enum: ['not_submitted', 'submitted'], default: 'not_submitted' },
      title: { type: String, trim: true, maxlength: 150 },
      description: { type: String, trim: true, maxlength: 1000 },
      fileUrl: { type: String, trim: true },
      submittedAt: { type: Date },
    },
  },
  { timestamps: true }
);

/* ----------------------------- Indexes ---------------------------- */
// 1. Uniqueness: one registration per user per competition. This is the DB-level
//    guard against double-registration (double taps, retries, races).
//    Also serves the hot query GET /competitions/:id?userId=... (equality on both keys).
RegistrationSchema.index({ competitionId: 1, userId: 1 }, { unique: true });

// 2. "My competitions" screen, newest first.
RegistrationSchema.index({ userId: 1, createdAt: -1 });

export const Registration = model<IRegistration>('Registration', RegistrationSchema);
