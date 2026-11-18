'use client';
import { useEffect } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { doctorService } from '@/lib/services';
import { qk } from '@/lib/queryKeys';

export function useDoctors(params) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: qk.doctors.list(params),
    queryFn: ({ signal }) => doctorService.list(params, signal), // aborts stale requests
    placeholderData: keepPreviousData, // no table flash between pages/filters
  });

  // Prefetch the next page so "Next" feels instant.
  const totalPages = query.data?.pagination?.totalPages;
  useEffect(() => {
    if (totalPages && params.page < totalPages) {
      const next = { ...params, page: params.page + 1 };
      qc.prefetchQuery({ queryKey: qk.doctors.list(next), queryFn: () => doctorService.list(next) });
    }
  }, [qc, params, totalPages]);

  return query;
}

export const useDoctorMeta = () =>
  useQuery({ queryKey: qk.doctors.meta, queryFn: doctorService.meta, select: (r) => r.data, staleTime: 10 * 60 * 1000 });

export const useDoctorOptions = (enabled = true) =>
  useQuery({ queryKey: qk.doctors.options, queryFn: doctorService.options, select: (r) => r.data, staleTime: 5 * 60 * 1000, enabled });

export const useDoctor = (id) =>
  useQuery({ queryKey: qk.doctors.detail(id), queryFn: () => doctorService.get(id), select: (r) => r.data, enabled: !!id });

export function useDoctorPatients(id, params) {
  return useQuery({
    queryKey: qk.doctors.patients(id, params),
    queryFn: ({ signal }) => doctorService.patients(id, params, signal),
    placeholderData: keepPreviousData,
    enabled: !!id,
  });
}

/** Shared invalidation: anything that changes doctors/patients also changes dashboard stats. */
function useInvalidate() {
  const qc = useQueryClient();
  return (...keys) => Promise.all([...keys, ['stats'], ['audit']].map((queryKey) => qc.invalidateQueries({ queryKey })));
}

export function useSaveDoctor() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, ...body }) => (id ? doctorService.update(id, body) : doctorService.create(body)),
    onSuccess: (_r, vars) => {
      toast.success(vars.id ? 'Doctor updated' : 'Doctor added');
      return invalidate(qk.doctors.all);
    },
  });
}

export function useDeleteDoctor() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: doctorService.remove,
    onSuccess: (r) => {
      toast.success(r.message || 'Doctor deleted');
      return invalidate(qk.doctors.all, qk.patients.all);
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useAddPatientToDoctor(doctorId) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (body) => doctorService.addPatient(doctorId, body),
    onSuccess: () => {
      toast.success('Patient added');
      return invalidate(qk.doctors.all, qk.patients.all);
    },
  });
}

/** Optimistic removal: the row disappears immediately and is restored if the API fails. */
export function useRemovePatientFromDoctor(doctorId, params) {
  const qc = useQueryClient();
  const invalidate = useInvalidate();
  const key = qk.doctors.patients(doctorId, params);
  return useMutation({
    mutationFn: (patientId) => doctorService.removePatient(doctorId, patientId),
    onMutate: async (patientId) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData(key);
      qc.setQueryData(key, (old) =>
        old ? { ...old, data: old.data.filter((p) => p._id !== patientId), pagination: { ...old.pagination, total: old.pagination.total - 1 } } : old
      );
      return { previous };
    },
    onError: (e, _id, ctx) => {
      qc.setQueryData(key, ctx?.previous);
      toast.error(e.message);
    },
    onSuccess: () => toast.success('Patient removed'),
    onSettled: () => invalidate(qk.doctors.all, qk.patients.all),
  });
}
