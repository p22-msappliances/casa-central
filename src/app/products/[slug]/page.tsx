import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/app/actions/catalog';
import { getProductReviews } from '@/app/actions/reviews';
import ProductDetailClient from './ProductDetailClient';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const result = await getProductBySlug(slug);
  
  if (!result.success || !result.data) {
    notFound();
  }

  const reviewsResult = await getProductReviews(result.data.id);
  const reviews = reviewsResult.success ? (reviewsResult.data || []) : [];

  return <ProductDetailClient product={result.data} initialReviews={reviews} />;
}
