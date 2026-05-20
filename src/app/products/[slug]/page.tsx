import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/app/actions/catalog';
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

  return <ProductDetailClient product={result.data} />;
}
