'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authService } from '@/lib/services';
import { qk } from '@/lib/queryKeys';

export function useMe() {
  return useQuery({
    queryKey: qk.me,
    queryFn: authService.me,
    select: (r) => r.data.user,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authService.login,
    onSuccess: (res) => qc.setQueryData(qk.me, { data: { user: res.data.user } }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      qc.clear();
      router.replace('/login');
      router.refresh();
      toast.success('Signed out');
    },
  });
}
