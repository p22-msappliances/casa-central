/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { ProductGallery } from '@/components/ui/ProductGallery';
import { ProductSpecifications } from '@/components/ui/ProductSpecifications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ShieldCheck, Truck, RotateCcw, Minus, Plus, Star } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { toast } from 'sonner';
import { addReview, getProductReviews } from '@/app/actions/reviews';

interface ProductDetailClientProps {
  product: any;
  initialReviews: any[];
}

export default function ProductDetailClient({ product, initialReviews }: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(product.product_variants?.[0]);
  const [reviews, setReviews] = useState(initialReviews);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const addItem = useCartStore(state => state.addItem);

  const totalStock = selectedVariant?.inventory?.reduce((s: number, inv: any) => s + (inv.quantity || 0), 0) || 0;
  const isInStock = totalStock > 0;

  const handleAddToCart = () => {
    if (!selectedVariant || !isInStock) {
      toast.error('This product is currently out of stock');
      return;
    }

    const cartItem = useCartStore.getState().items.find(i => i.variantId === selectedVariant.id);
    const inCartQty = cartItem?.quantity || 0;
    const remaining = totalStock - inCartQty;

    if (remaining <= 0) {
      toast.error(`Only ${totalStock} available — already in cart`);
      return;
    }

    const effectiveQty = Math.min(quantity, remaining);

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      name: `${product.name} - ${selectedVariant.sku}`,
      price: selectedVariant.price,
      quantity: effectiveQty,
      imageUrl: selectedVariant.image_url || product.image_url,
      maxQuantity: totalStock,
    });

    const addedQty = effectiveQty;
    toast.success(addedQty < quantity ? `Added ${addedQty} of ${quantity} (only ${remaining} remaining)` : `${product.name} (${selectedVariant.sku}) added to cart`);
  };

  const handleIncrement = () => setQuantity(prev => Math.min(prev + 1, totalStock));
  const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData();
    fd.set('productId', product.id);
    fd.set('rating', reviewRating.toString());
    fd.set('comment', reviewComment);
    const result = await addReview(fd);
    setSubmitting(false);
    if (result.success) {
      toast.success('Review submitted');
      setReviewComment('');
      setReviewRating(5);
      const reviewsResult = await getProductReviews(product.id);
      if (reviewsResult.success && reviewsResult.data) setReviews(reviewsResult.data);
    } else {
      toast.error(result.error || 'Failed to submit review');
    }
  };

  const galleryImages = product.image_url ? [product.image_url] : [];

  const specifications: Record<string, string> = {};
  if (product.description) {
    specifications['Description'] = product.description;
  }
  if (product.base_price) {
    specifications['Base Price'] = `$${Number(product.base_price).toLocaleString()}`;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <ProductGallery images={galleryImages} />
        </div>

        <div className="flex flex-col space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-primary border-primary">
                {product.categories?.name || 'Premium'}
              </Badge>
              <Badge variant="outline" className="text-accent-foreground border-accent-foreground">
                {product.brands?.name || 'Certified'}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary font-heading leading-tight">
              {product.name}
            </h1>
             <p className="text-2xl font-semibold text-accent-foreground">
               {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(selectedVariant?.price || product.base_price || 0))}
             </p>
             <p className="text-lg text-muted-foreground leading-relaxed">
               {product.description}
             </p>
           </div>

           <div className="p-6 rounded-2xl bg-white border border-border/60 shadow-sm space-y-6">
             {product.product_variants && product.product_variants.length > 1 && (
               <div>
                 <label className="text-sm font-medium text-muted-foreground mb-2 block">Variant</label>
                 <select
                   className="w-full p-2 border border-input rounded-md"
                   value={selectedVariant?.id}
                   onChange={(e) => {
                     const variant = product.product_variants.find((v: any) => v.id === e.target.value);
                     setSelectedVariant(variant);
                     setQuantity(1);
                   }}
                 >
                   {product.product_variants.map((v: any) => (
                     <option key={v.id} value={v.id}>{v.sku}</option>
                   ))}
                 </select>
               </div>
             )}
             <div className="flex items-center justify-between">
               <span className="text-sm font-medium text-muted-foreground">Quantity</span>
               <div className="flex items-center gap-4">
                 <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-border/60" onClick={handleDecrement}>
                   <Minus className="h-4 w-4" />
                 </Button>
                 <span className="text-lg font-bold text-primary">{quantity}</span>
                 <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-border/60" onClick={handleIncrement} disabled={quantity >= totalStock}>
                   <Plus className="h-4 w-4" />
                 </Button>
               </div>
             </div>
             <p className="text-xs text-muted-foreground text-center">{totalStock} available in stock</p>

             <Button size="lg" className="w-full py-6 text-xl rounded-full shadow-lg transition-all duration-300 flex items-center justify-center gap-2" onClick={handleAddToCart} disabled={!isInStock}>
               <ShoppingCart className="h-6 w-6" /> {isInStock ? 'Add to Cart' : 'Out of Stock'}
             </Button>
           </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-muted/30 border border-border/40">
              <Truck className="h-6 w-6 text-accent mb-2" />
              <span className="text-xs font-semibold text-primary">Fast Delivery</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-muted/30 border border-border/40">
              <ShieldCheck className="h-6 w-6 text-accent mb-2" />
              <span className="text-xs font-semibold text-primary">Official Warranty</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-muted/30 border border-border/40">
              <RotateCcw className="h-6 w-6 text-accent mb-2" />
              <span className="text-xs font-semibold text-primary">Easy Returns</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-24 border-t border-secondary/30 pt-12">
        <ProductSpecifications specs={specifications} />
      </div>

      <div className="mt-24 border-t border-secondary/30 pt-12">
        <h2 className="text-3xl font-bold text-primary font-heading mb-8">Customer Reviews</h2>

        {reviews.length > 0 ? (
          <div className="space-y-6 mb-12">
            {reviews.map((review: any) => (
              <div key={review.id} className="p-6 rounded-2xl bg-white border border-border/60 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`h-4 w-4 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {review.profiles?.first_name || review.profiles?.last_name ? `${review.profiles.first_name || ''} ${review.profiles.last_name || ''}`.trim() : 'Anonymous'}
                  </span>
                  <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
                {review.comment && <p className="text-muted-foreground">{review.comment}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground mb-12">No reviews yet. Be the first to review this product!</p>
        )}

        <div className="max-w-xl">
          <h3 className="text-xl font-bold text-primary font-heading mb-4">Write a Review</h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} type="button" onClick={() => setReviewRating(s)}>
                    <Star className={`h-6 w-6 ${s <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Comment (optional)</label>
              <textarea
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Share your experience with this product..."
              />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
