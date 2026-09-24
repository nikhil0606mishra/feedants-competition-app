import { Request, Response } from 'express';
import { z } from 'zod';
import { getCompetitionDetails } from '../services/competition.service';
import { registerForCompetition } from '../services/registration.service';
import { submitEntry } from '../services/submission.service';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Must be a valid ObjectId');
const idParams = z.object({ id: objectId });

/* ------------------------------ Schemas ------------------------------ */

export const getCompetitionSchemas = {
  params: idParams,
  query: z.object({ userId: objectId.optional() }),
};

export const registerSchemas = {
  params: idParams,
  body: z.object({ userId: objectId }),
};

export const submitSchemas = {
  params: idParams,
  body: z.object({
    userId: objectId,
    title: z.string().trim().min(1).max(150),
    description: z.string().trim().max(1000).optional(),
    // The app uploads the media to object storage first and sends us the resulting HTTPS URL.
    fileUrl: z.string().url().max(2048).refine((u) => u.startsWith('https://'), 'fileUrl must use https'),
  }),
};

/* ----------------------------- Handlers ------------------------------ */

export async function getCompetition(req: Request, res: Response) {
  const { userId } = req.query as { userId?: string };
  const data = await getCompetitionDetails(req.params.id, userId);
  res.json({ success: true, data });
}

export async function register(req: Request, res: Response) {
  const { userId } = req.body as z.infer<typeof registerSchemas.body>;
  const { registration, competition } = await registerForCompetition(req.params.id, userId);

  res.status(201).json({
    success: true,
    data: {
      registration,
      competition: {
        id: competition.id,
        totalSpots: competition.totalSpots,
        spotsFilled: competition.spotsFilled,
        spotsRemaining: competition.spotsRemaining,
        isFull: competition.isFull,
      },
    },
  });
}

export async function submit(req: Request, res: Response) {
  const { userId, ...input } = req.body as z.infer<typeof submitSchemas.body>;
  const registration = await submitEntry(req.params.id, userId, input);
  res.status(201).json({ success: true, data: { registration } });
}
