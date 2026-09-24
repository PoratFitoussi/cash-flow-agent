import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';

export function useBudget(period: string) {
  return useQuery({
    queryKey: ['budget', period],
    queryFn: () => fetchAPI(`/budget/${period}`).then(res => res.data || {})
  });
}

export function useAllBudgets(period: string) {
  return useQuery({
    queryKey: ['budget', 'all', period],
    queryFn: () => fetchAPI(`/budget/${period}/all`).then(res => res.data || [])
  });
}
