'use client';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { auditService } from '@/lib/services';
import { qk } from '@/lib/queryKeys';

export const useAuditLogs = (params) =>
  useQuery({
    queryKey: qk.audit(params),
    queryFn: ({ signal }) => auditService.list(params, signal),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
