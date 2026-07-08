import type { User } from '@/context/AuthContext';
import { ADMIN_EMAIL, LEGACY_ADMIN_EMAIL } from '@/constants/Brand';

export function isAdminUser(user: User | null | undefined): boolean {
  return user?.membershipType === 'admin' || user?.email === ADMIN_EMAIL || user?.email === LEGACY_ADMIN_EMAIL;
}
