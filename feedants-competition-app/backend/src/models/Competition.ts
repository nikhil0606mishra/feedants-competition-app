import { Schema, model, HydratedDocument } from 'mongoose';

/* ----------------------------- Types ----------------------------- */

export type CompetitionStatus = 'draft' | 'published' | 'cancelled';

export interface IJudge {
  name: string;
  title: string;
  experienceYears: number;
  avatarUrl?: string;
  videoUrl?: string;
  videoThumbnailUrl?: string;
}

export interface IPreviousWinner {
  name: string;
  avatarUrl?: string;
  rankLabel: string;  // "1st Winner"
  videoUrl?: string;
}

export interface IReward {
  rank: number;   // 1 = winner, 2 = first runner-up ...
  label: string;  // "Winner", "1st Runner Up", "Top 10 Finalists"
  amount: number; // INR, whole rupees
}

export interface IJudgingParameter {
  title: string;       // "Technique"
  description: string;
  weightage: number;   // percentage, all should sum to 100
}

export interface ICompetition {
  title: string;
  slug: string;
  shortDescription?: string;
  categories: string[];
  bannerUrls: string[];
  perks: string[];                  // e.g. "Winners get certificate"
  previousWinners: IPreviousWinner[];
  disclaimer?: string;
  payoutVideoUrl?: string;          // "How will you receive prize money?" explainer
  judge: IJudge;

  entryFee: number;
  currency: 'INR';
  prizePool: number;
  rewards: IReward[];

  totalSpots: number;
  spotsFilled: number;
  registrationDeadline: Date;
  submissionStart: Date;
  submissionEnd: Date;
  resultDate: Date;

  content: {
    about: string;
    judgingParameters: IJudgingParameter[];
    rules: string[];
    eligibility: string[];
  };

  status: CompetitionStatus;

  // virtuals
  spotsRemaining: number;
  isFull: boolean;
}

export type CompetitionDoc = HydratedDocument<ICompetition>;

/* --------------------------- Sub-schemas -------------------------- */
// { _id: false } on embedded docs: we never query them by id, saves space.

const JudgeSchema = new Schema<IJudge>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    experienceYears: { type: Number, required: true, min: 0, max: 80 },
    avatarUrl: { type: String, trim: true },
    videoUrl: { type: String, trim: true },
    videoThumbnailUrl: { type: String, trim: true },
  },
  { _id: false }
);

const PreviousWinnerSchema = new Schema<IPreviousWinner>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    avatarUrl: { type: String, trim: true },
    rankLabel: { type: String, required: true, trim: true, maxlength: 40 },
    videoUrl: { type: String, trim: true },
  },
  { _id: false }
);

const RewardSchema = new Schema<IReward>(
  {
    rank: { type: Number, required: true, min: 1 },
    label: { type: String, required: true, trim: true, maxlength: 60 },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const JudgingParameterSchema = new Schema<IJudgingParameter>(
  {
    title: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    weightage: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false }
);

/* ----------------------------- Schema ----------------------------- */

const CompetitionSchema = new Schema<ICompetition>(
  {
    // --- Metadata ---
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 150 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: { type: String, trim: true, maxlength: 300 },
    categories: {
      type: [{ type: String, trim: true, lowercase: true }],
      validate: [(v: string[]) => v.length <= 8, 'A competition can have at most 8 category tags'],
      default: [],
    },
    bannerUrls: { type: [String], default: [] },
    perks: { type: [{ type: String, trim: true, maxlength: 60 }], default: [] },
    previousWinners: { type: [PreviousWinnerSchema], default: [] },
    disclaimer: { type: String, trim: true, maxlength: 300 },
    payoutVideoUrl: { type: String, trim: true },
    judge: { type: JudgeSchema, required: true },

    // --- Financials (whole INR; integers avoid float rounding issues) ---
    entryFee: {
      type: Number, required: true, min: 0,
      validate: { validator: Number.isInteger, message: 'entryFee must be a whole number' },
    },
    currency: { type: String, enum: ['INR'], default: 'INR' },
    prizePool: {
      type: Number, required: true, min: 0,
      validate: { validator: Number.isInteger, message: 'prizePool must be a whole number' },
    },
    rewards: { type: [RewardSchema], default: [] },

    // --- Registration rules ---
    totalSpots: { type: Number, required: true, min: 1, validate: Number.isInteger },
    spotsFilled: {
      type: Number, default: 0, min: 0,
      // NOTE: runs on save()/create() only. The real guarantee against overbooking
      // is the atomic conditional update in Phase 2 (see index/notes).
      validate: {
        validator: function (this: ICompetition, v: number) { return v <= this.totalSpots; },
        message: 'spotsFilled cannot exceed totalSpots',
      },
    },
    registrationDeadline: { type: Date, required: true },
    submissionStart: { type: Date, required: true },
    submissionEnd: { type: Date, required: true },
    resultDate: { type: Date, required: true },

    // --- Tabbed content ---
    content: {
      about: { type: String, required: true, trim: true },
      judgingParameters: { type: [JudgingParameterSchema], default: [] },
      rules: { type: [String], default: [] },
      eligibility: { type: [String], default: [] },
    },

    // Admin-controlled lifecycle. Time-based phases (registration open,
    // submission open...) are DERIVED from dates at read time, never stored,
    // so they can't go stale.
    status: { type: String, enum: ['draft', 'published', 'cancelled'], default: 'published' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ---------------------------- Virtuals ---------------------------- */

CompetitionSchema.virtual('spotsRemaining').get(function (this: ICompetition) {
  return Math.max(this.totalSpots - this.spotsFilled, 0);
});

CompetitionSchema.virtual('isFull').get(function (this: ICompetition) {
  return this.spotsFilled >= this.totalSpots;
});

/* ------------------- Cross-field validation ---------------------- */

CompetitionSchema.pre('validate', function (next) {
  if (this.submissionStart >= this.submissionEnd) {
    return next(new Error('submissionStart must be before submissionEnd'));
  }
  if (this.registrationDeadline > this.submissionEnd) {
    return next(new Error('registrationDeadline cannot be after submissionEnd'));
  }
  if (this.resultDate < this.submissionEnd) {
    return next(new Error('resultDate cannot be before submissionEnd'));
  }
  const rewardTotal = this.rewards.reduce((sum, r) => sum + r.amount, 0);
  if (rewardTotal > this.prizePool) {
    return next(new Error('Sum of rewards cannot exceed prizePool'));
  }
  next();
});

/* ----------------------------- Indexes ---------------------------- */
// slug: unique index is declared inline above (public, SEO-friendly lookups).
// Listing screen: "published competitions, soonest deadline first".
CompetitionSchema.index({ status: 1, registrationDeadline: 1 });
// Filter by category chips.
CompetitionSchema.index({ categories: 1 });

export const Competition = model<ICompetition>('Competition', CompetitionSchema);
