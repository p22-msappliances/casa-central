import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Percent, Clock, Tag } from 'lucide-react';

const promotions = [
  { name: 'Summer Sale', code: 'SUMMER20', discount: '20% OFF', desc: 'On all refrigerators and air conditioners.', valid: 'June 1–30, 2026', active: true },
  { name: 'New Customer', code: 'WELCOME10', discount: '10% OFF', desc: 'Your first purchase at CASA CENTRAL.', valid: 'Ongoing', active: true },
  { name: 'Audio Fest', code: 'AUDIO15', discount: '15% OFF', desc: 'On all audio systems and soundbars.', valid: 'July 1–15, 2026', active: true },
  { name: 'Free Shipping', code: 'FREESHIP', discount: 'Free Shipping', desc: 'On orders over $5,000.', valid: 'Limited time', active: false },
];

export default function PromotionsPage() {
  return (
    <div className="container mx-auto px-4 py-16 space-y-12">
      <section className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-primary font-heading">Promotions</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Take advantage of our latest offers and save on premium appliances.
        </p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {promotions.map((promo) => (
          <Card key={promo.code} className={`bg-card border ${promo.active ? 'border-primary/30' : 'border-secondary/30 opacity-60'} hover:shadow-xl transition-all`}>
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Percent className="h-6 w-6 text-primary" />
                <Badge variant={promo.active ? 'default' : 'secondary'} className="text-xs">
                  {promo.active ? 'Active' : 'Expired'}
                </Badge>
              </div>
              <CardTitle className="text-2xl font-bold text-primary">{promo.discount}</CardTitle>
              <CardDescription className="text-lg font-semibold text-accent-foreground">{promo.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{promo.desc}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{promo.valid}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-mono bg-secondary/50 px-3 py-2 rounded-lg">
                <Tag className="h-4 w-4 text-primary" />
                <span className="font-bold text-primary">{promo.code}</span>
              </div>
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
