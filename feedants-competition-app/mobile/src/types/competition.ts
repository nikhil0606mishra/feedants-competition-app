// Mirrors the backend response of GET /api/competitions/:id (dates arrive as ISO strings).

export interface Judge {
  name: string;
  title: string;
  experienceYears: number;
  avatarUrl?: string;
  videoUrl?: string;
  videoThumbnailUrl?: string;
}

export interface PreviousWinner { name: string; avatarUrl?: string; rankLabel: string; videoUrl?: string }
export interface Reward { rank: number; label: string; amount: number }
export interface JudgingParameter { title: string; description: string; weightage: number }

export interface Competition {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  categories: string[];
  bannerUrls: string[];
  perks: string[];
  previousWinners: PreviousWinner[];
  disclaimer?: string;
  payoutVideoUrl?: string;
  judge: Judge;
  entryFee: number;
  currency: 'INR';
  prizePool: number;
  rewards: Reward[];
  totalSpots: number;
  spotsFilled: number;
  spotsRemaining: number;
  isFull: boolean;
  registrationDeadline: string;
  submissionStart: string;
  submissionEnd: string;
  resultDate: string;
  content: {
    about: string;
    judgingParameters: JudgingParameter[];
    rules: string[];
    eligibility: string[];
  };
  status: 'draft' | 'published' | 'cancelled';
}

export type SubmissionWindow = 'not_started' | 'open' | 'closed';

export interface ServerState {
  serverTime: string;
  isFull: boolean;
  registrationOpen: boolean;
  submissionWindow: SubmissionWindow;
  resultsDeclared: boolean;
}

export interface Viewer {
  userId: string;
  isRegistered: boolean;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | null;
  registeredAt: string | null;
  submissionStatus: 'not_submitted' | 'submitted' | null;
  canSubmit: boolean;
}

export interface CompetitionDetails {
  competition: Competition;
  state: ServerState;
  viewer: Viewer | null;
}
