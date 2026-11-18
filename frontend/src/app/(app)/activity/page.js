import { Suspense } from 'react';
import { ActivityView } from '@/components/activity/ActivityView';

export const metadata = { title: 'Activity log' };

export default function ActivityPage() {
  return (
    <Suspense>
      <ActivityView />
    </Suspense>
  );
}
