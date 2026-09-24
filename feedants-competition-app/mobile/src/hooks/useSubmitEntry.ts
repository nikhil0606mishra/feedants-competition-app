import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '../api/client';
import { submitEntry, SubmitPayload } from '../api/competitions';

export function useSubmitEntry(competitionId: string, userId: string) {
  const qc = useQueryClient();
  return useMutation<unknown, ApiError, SubmitPayload>({
    mutationFn: (payload) => submitEntry(competitionId, userId, payload),
    // Refetch so the details screen flips to "Submitted ✓" using server truth.
    onSuccess: () => qc.invalidateQueries({ queryKey: ['competition', competitionId] }),
  });
}
