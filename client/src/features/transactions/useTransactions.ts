import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';

export function useTransactions(params: Record<string, string> = {}) {
  const searchParams = new URLSearchParams(params).toString();
  return useQuery({
    queryKey: ['transactions', searchParams],
    queryFn: () => fetchAPI(`/transactions?${searchParams}`).then(res => res.data || [])
  });
}

export function useRunway() {
  return useQuery({
    queryKey: ['runway'],
    queryFn: () => fetchAPI('/stats/runway').then(res => res)
  });
}

export function useSync() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fetchAPI('/sync', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budget'] });
    }
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, merchant, cardOwner }: { id: string, merchant?: string, cardOwner?: string | null }) => {
      if (merchant !== undefined) {
        await fetchAPI(`/transactions/${id}/merchant`, { method: 'PATCH', body: JSON.stringify({ merchant }) });
      }
      if (cardOwner !== undefined) {
        await fetchAPI(`/transactions/${id}/owner`, { method: 'PATCH', body: JSON.stringify({ cardOwner }) });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] })
  });
}
