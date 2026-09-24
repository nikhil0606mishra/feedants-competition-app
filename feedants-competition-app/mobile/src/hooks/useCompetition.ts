import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '../api/client';
import { fetchCompetition, registerForCompetition } from '../api/competitions';
import { CompetitionDetails } from '../types/competition';

export const competitionKey = (id: string, userId?: string) => ['competition', id, userId ?? 'anon'] as const;

export function useCompetitionDetails(id: string, userId?: string) {
  return useQuery<CompetitionDetails, ApiError>({
    queryKey: competitionKey(id, userId),
    queryFn: () => fetchCompetition(id, userId),
    enabled: !!id,
    staleTime: 30_000, // spots change often; short freshness window
    retry: (count, err) => err.code === 'NETWORK_ERROR' && count < 2, // never retry 4xx
  });
}

// What the UI should look like the instant the user taps "Register", before the server answers.
function applyOptimisticRegistration(d: CompetitionDetails, userId: string): CompetitionDetails {
  const c = d.competition;
  const spotsFilled = c.spotsFilled + 1;
  return {
    ...d,
    competition: {
      ...c,
      spotsFilled,
      spotsRemaining: Math.max(c.totalSpots - spotsFilled, 0),
      isFull: spotsFilled >= c.totalSpots,
    },
    viewer: {
      userId,
      isRegistered: true,
      paymentStatus: 'paid',
      registeredAt: new Date().toISOString(),
      submissionStatus: 'not_submitted',
      canSubmit: false,
    },
  };
}

export function useRegister(competitionId: string, userId: string) {
  const qc = useQueryClient();
  const key = competitionKey(competitionId, userId);

  return useMutation<unknown, ApiError, void, { previous?: CompetitionDetails }>({
    mutationFn: () => registerForCompetition(competitionId, userId),

    onMutate: async () => {
      await qc.cancelQueries({ queryKey: key }); // stop in-flight refetches overwriting our optimistic value
      const previous = qc.getQueryData<CompetitionDetails>(key);
      if (previous) qc.setQueryData(key, applyOptimisticRegistration(previous, userId));
      return { previous };
    },

    // Roll back on failure (full, closed, network...). Screen shows the error message.
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
    },

    // Success OR failure: re-sync with the server's truth (real spot count, real registration).
    onSettled: () => qc.invalidateQueries({ queryKey: ['competition', competitionId] }),
  });
}
