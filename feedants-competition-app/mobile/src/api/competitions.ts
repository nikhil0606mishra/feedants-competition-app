import { api, ApiSuccess } from './client';
import { CompetitionDetails } from '../types/competition';

export async function fetchCompetition(id: string, userId?: string): Promise<CompetitionDetails> {
  const res = await api.get<ApiSuccess<CompetitionDetails>>(`/api/competitions/${id}`, {
    params: userId ? { userId } : undefined,
  });
  return res.data.data;
}

export async function registerForCompetition(id: string, userId: string) {
  const res = await api.post<ApiSuccess<unknown>>(`/api/competitions/${id}/register`, { userId });
  return res.data.data;
}

export interface SubmitPayload { title: string; description?: string; fileUrl: string }

export async function submitEntry(id: string, userId: string, payload: SubmitPayload) {
  const res = await api.post<ApiSuccess<unknown>>(`/api/competitions/${id}/submit`, { userId, ...payload });
  return res.data.data;
}
