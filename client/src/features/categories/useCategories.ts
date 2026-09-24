import { useQuery } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchAPI('/categories').then(res => res.data || [])
  });
}
