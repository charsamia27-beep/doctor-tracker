'use client';
import { useEffect } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { patientService } from '@/lib/services';
import { qk } from '@/lib/queryKeys';

export function usePatients(params) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: qk.patients.list(params),
    queryFn: ({ signal }) => patientService.list(params, signal),
    placeholderData: keepPreviousData,
  });

  const totalPages = query.data?.pagination?.totalPages;
  useEffect(() => {
    if (totalPages && params.page < totalPages) {
      const next = { ...params, page: params.page + 1 };
      qc.prefetchQuery({ queryKey: qk.patients.list(next), queryFn: () => patientService.list(next) });
    }
  }, [qc, params, totalPages]);

  return query;
}

function useInvalidateAll() {
  const qc = useQueryClient();
  return () =>
    Promise.all([qk.patients.all, qk.doctors.all, ['stats'], ['audit']].map((queryKey) => qc.invalidateQueries({ queryKey })));
}

export function useSavePatient() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: ({ id, ...body }) => (id ? patientService.update(id, body) : patientService.create(body)),
    onSuccess: (_r, vars) => {
      toast.success(vars.id ? 'Patient updated' : 'Patient added');
      return invalidate();
    },
  });
}

export function useDeletePatient(params) {
  const qc = useQueryClient();
  const invalidate = useInvalidateAll();
  const key = qk.patients.list(params);
  return useMutation({
    mutationFn: patientService.remove,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData(key);
      qc.setQueryData(key, (old) =>
        old ? { ...old, data: old.data.filter((p) => p._id !== id), pagination: { ...old.pagination, total: old.pagination.total - 1 } } : old
      );
      return { previous };
    },
    onError: (e, _id, ctx) => {
      qc.setQueryData(key, ctx?.previous);
      toast.error(e.message);
    },
    onSuccess: () => toast.success('Patient deleted'),
    onSettled: invalidate,
  });
}
