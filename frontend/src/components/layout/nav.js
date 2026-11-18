import { Activity, LayoutDashboard, Stethoscope, Users } from 'lucide-react';

export const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/doctors', label: 'Doctors', icon: Stethoscope },
  { href: '/patients', label: 'Patients', icon: Users },
  { href: '/activity', label: 'Activity log', icon: Activity },
];

export const titleFor = (pathname) => {
  if (pathname.startsWith('/doctors/')) return ['Doctors', 'Profile'];
  const item = NAV.find((n) => pathname === n.href || pathname.startsWith(n.href + '/'));
  return [item?.label ?? 'Dashboard'];
};
