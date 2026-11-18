import { Suspense } from 'react';
import { PatientsView } from '@/components/patients/PatientsView';

export const metadata = { title: 'Patients' };

export default function PatientsPage() {
  return (
    <Suspense>
      <PatientsView />
    </Suspense>
  );
}
