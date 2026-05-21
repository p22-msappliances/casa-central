/* eslint-disable @typescript-eslint/no-explicit-any */
import { getPromotions } from '@/app/actions/promotions';
import { PromotionsClient } from './PromotionsClient';

export default async function AdminPromotionsPage() {
  const result = await getPromotions();
  const promotions = result.success ? (result.data || []) : [];

  return <PromotionsClient initialPromotions={promotions} />;
}
