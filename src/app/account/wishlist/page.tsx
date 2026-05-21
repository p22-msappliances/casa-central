/* eslint-disable @typescript-eslint/no-explicit-any */
import { getUserWishlist } from '@/app/actions/wishlist';
import { WishlistClient } from './WishlistClient';

export const dynamic = 'force-dynamic';

export default async function WishlistPage() {
  const result = await getUserWishlist();
  const wishlist = result.success ? (result.data || []) : [];

  return <WishlistClient initialWishlist={wishlist} />;
}
