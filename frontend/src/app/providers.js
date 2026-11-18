'use client';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';

export function Providers({ children }) {
  // One client per browser session (not per render).
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 20 * 1000,
            refetchOnWindowFocus: false,
            retry: (count, err) => err?.status >= 500 && count < 2, // never retry 4xx
          },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster position="top-right" richColors closeButton toastOptions={{ className: 'font-sans' }} />
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools buttonPosition="bottom-left" />}
    </QueryClientProvider>
  );
}
