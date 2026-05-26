/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Percent, Clock, Tag } from 'lucide-react';
import { createAnonClient } from '@/lib/server';

export const dynamic = 'force-dynamic';

export default async function PromotionsPage() {
  const supabase = await createAnonClient();
  const { data: promotions } = await supabase
    .from('promotions')
    .select('*')
    .order('active', { ascending: false })
    .order('name');

  const items = promotions || [];

  return (
    <div className="container mx-auto px-4 py-16 space-y-12">
      <section className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-primary font-heading">Promotions</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Take advantage of our latest offers and save on premium appliances.
        </p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {items.length === 0 ? (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            <Percent className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p>No promotions available at the moment. Check back soon!</p>
          </div>
        ) : items.map((promo: any) => (
          <Card key={promo.id} className={`bg-card border ${promo.active ? 'border-primary/30' : 'border-secondary/30 opacity-60'} hover:shadow-xl transition-all`}>
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Percent className="h-6 w-6 text-primary" />
                <Badge variant={promo.active ? 'default' : 'secondary'} className="text-xs">
                  {promo.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <CardTitle className="text-2xl font-bold text-primary">
                {promo.discount_type === 'PERCENT' ? `${promo.discount_value}% OFF` : `$${promo.discount_value} OFF`}
              </CardTitle>
              <CardDescription className="text-lg font-semibold text-accent-foreground">{promo.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {promo.code && (
                <div className="flex items-center gap-2 text-sm font-mono bg-secondary/50 px-3 py-2 rounded-lg">
                  <Tag className="h-4 w-4 text-primary" />
                  <span className="font-bold text-primary">{promo.code}</span>
                </div>
              )}
              {promo.start_date && promo.end_date && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(promo.start_date).toLocaleDateString()} — {new Date(promo.end_date).toLocaleDateString()}</span>
                </div>
              )}
              <Link href="/products">
                <Button className="w-full rounded-full" variant={promo.active ? 'default' : 'outline'} disabled={!promo.active}>Shop Now</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
