import { Suspense } from 'react';
import { DoctorsView } from '@/components/doctors/DoctorsView';

export const metadata = { title: 'Doctors' };

export default function DoctorsPage() {
  return (
    <Suspense>
      <DoctorsView />
    </Suspense>
  );
}
