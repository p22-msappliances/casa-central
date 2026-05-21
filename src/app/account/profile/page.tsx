/* eslint-disable @typescript-eslint/no-explicit-any */
import { getUserProfile } from '@/app/actions/profiles';
import { ProfileClient } from './ProfileClient';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const result = await getUserProfile();
  const profile = result.success ? result.data : null;

  return <ProfileClient initialProfile={profile} />;
}
