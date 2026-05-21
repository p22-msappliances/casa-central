/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAllCMSContent } from '@/app/actions/admin';
import { CMSClient } from './CMSClient';

export default async function AdminCMSPage() {
  const result = await getAllCMSContent();
  const content = result.success ? (result.data || []) : [];

  return <CMSClient initialContent={content} />;
}
