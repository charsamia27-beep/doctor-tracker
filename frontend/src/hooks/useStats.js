'use client';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { statsService } from '@/lib/services';
import { qk } from '@/lib/queryKeys';

export const useStats = (range) =>
  useQuery({
    queryKey: qk.stats(range),
    queryFn: () => statsService.overview(range),
    select: (r) => r.data,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
