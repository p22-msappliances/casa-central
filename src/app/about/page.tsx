import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShieldCheck, HeadphonesIcon, Wrench, Award } from 'lucide-react';

const values = [
  { icon: Award, title: 'Premium Quality', desc: 'We curate only the finest appliances and audio systems from trusted global brands.' },
  { icon: HeadphonesIcon, title: 'Expert Support', desc: 'Our team of specialists ensures you find the perfect solution for your home.' },
  { icon: ShieldCheck, title: 'Trusted Service', desc: 'Official warranties, secure payments, and reliable after-sales support.' },
  { icon: Wrench, title: 'Professional Installation', desc: 'Certified technicians handle delivery and installation with care.' },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 space-y-24">
      <section className="text-center space-y-6 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold text-primary font-heading leading-tight">
          Transforming Filipino Homes
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          CASA CENTRAL brings premium appliances and audio to modern Filipino households.
        </p>
      </section>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-primary font-heading">Our Story</h2>
          <p className="text-muted-foreground leading-relaxed">
            Founded with a vision to elevate the modern Filipino home, CASA CENTRAL started as a passion for beautiful technology.
          </p>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-lg border border-border/40 relative aspect-[4/3]">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"
            alt="Luxury kitchen with premium appliances"
            fill
            className="object-cover"
          />
        </div>
      </section>
      <section className="space-y-12">
        <h2 className="text-4xl font-bold text-primary font-heading text-center">What We Stand For</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.title} className="p-6 rounded-xl bg-card border border-secondary/30 space-y-4 text-center hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-primary">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
      <section className="text-center space-y-6 py-16 bg-secondary/20 rounded-3xl">
        <h2 className="text-4xl font-bold text-primary font-heading">Ready to Transform Your Home?</h2>
        <p className="text-lg text-muted-foreground">Explore our collection and discover the perfect appliances for your lifestyle.</p>
        <Link href="/products">
          <Button size="lg" className="rounded-full px-10 py-6 text-lg">Shop Now</Button>
        </Link>
      </section>
    </div>
  );
}
