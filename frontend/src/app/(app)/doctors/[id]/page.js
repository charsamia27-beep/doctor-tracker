import { Suspense } from 'react';
import { DoctorDetailView } from '@/components/doctors/DoctorDetailView';

export const metadata = { title: 'Doctor' };

export default function DoctorDetailPage({ params }) {
  return (
    <Suspense>
      <DoctorDetailView id={params.id} />
    </Suspense>
  );
}
