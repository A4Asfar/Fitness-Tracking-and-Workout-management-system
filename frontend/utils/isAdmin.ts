import type { User } from '@/context/AuthContext';

export function isAdminUser(user: User | null | undefined): boolean {
  return user?.membershipType === 'admin' || user?.email === 'admin@peakpulse.ai';
}
