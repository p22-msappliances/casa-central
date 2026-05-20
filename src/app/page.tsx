import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MoveRight, ArrowRight, Star, ShieldCheck, Truck, HeadphonesIcon } from 'lucide-react';

const IMG = {
  hero: 'https://images.pexels.com/photos/36777543/pexels-photo-36777543.jpeg',
  hero2: 'https://images.pexels.com/photos/5741975/pexels-photo-5741975.jpeg',
  fridge: 'https://images.squarespace-cdn.com/content/v1/5c1ae925d274cba0ba0ccbab/8418be97-4a73-48b9-a796-c8481ca619c2/zline--french--door--black--stainless--steel--standard--depth--refrigerator--RSMZ-W-36-BS-CB--lifestyle--front.jpg',
  washing: 'https://www.lg.com/content/dam/channel/wcms/za/images/washing-machines/f10c3ndp5_alsqesa_efsa_za_c/gallery/Zoom-WM_v2.jpg?w=800',
  ac: 'https://www.brittany.com.ph/wp-content/uploads/2022/10/Which-High-Tech-Air-Conditioners-Should-I-Get-For-My-Luxury-Home.png',
  tv: 'https://cdn.mos.cms.futurecdn.net/26dTTmnfYaVWedxfxn8pUb.jpg',
  audio: 'https://upscaleaudio.com/cdn/shop/files/DSC05180-2_edit.jpg?v=1707847191&width=3840',
  kitchen: 'https://www.pico-sa.com/wp-content/uploads/2018/06/pico-muebles-projects-luxury-kitchens-georgia-1.jpg',
  story1: 'https://www.mechcool.co.uk/wp-content/uploads/2024/09/wall-mounted-air-con-unit.jpg',
  story2: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80',
  story3: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
};

const StorytellingSection = ({ title, description, imageUrl, direction }: {
  title: string; description: string; imageUrl: string; direction: 'left' | 'right';
}) => (
  <section className="py-20 px-4 md:px-8 container mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
    <div className={`order-1 md:order-${direction === 'left' ? 2 : 1} md:col-span-1`}>
      <div className="rounded-2xl overflow-hidden shadow-lg border border-border/40">
        <img src={imageUrl} alt={title} className="w-full aspect-[4/3] object-cover" />
      </div>
    </div>
    <div className={`order-1 md:order-${direction === 'left' ? 1 : 2} md:col-span-1 space-y-6 text-center md:text-left`}>
      <h2 className="text-4xl md:text-5xl font-bold text-primary font-heading leading-tight">{title}</h2>
      <p className="text-lg text-muted-foreground leading-relaxed">{description}</p>
      <Link href="/products" className="inline-flex items-center gap-2 text-lg font-semibold text-accent hover:text-brand-gold-hover transition-colors">
        Explore <ArrowRight className="h-5 w-5" />
      </Link>
    </div>
  </section>
);

const FeaturedCategoryCard = ({ name, imageUrl }: { name: string; imageUrl: string; href: string }) => (
  <Link href="/products" className="group block">
    <div className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 bg-white">
      <div className="aspect-[4/3] overflow-hidden">
        <img src={imageUrl} alt={name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 via-brand-navy/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="text-xl font-bold text-white group-hover:text-brand-gold transition-colors duration-300">{name}</h3>
      </div>
    </div>
  </Link>
);

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* HERO — Split Layout: Left Text + Right Lifestyle Imagery */}
      <section className="relative bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[90vh] items-center gap-12 py-12 lg:py-0">
            {/* Left: Content */}
            <div className="space-y-8 lg:pr-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-brand-gold" />
                Premium Appliances &amp; Audio Excellence
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-brand-navy font-heading leading-tight tracking-tight">
                Premium Appliances for Modern Living
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                Discover premium appliances and audio systems designed for modern New York living.
                Elegance, innovation, and smart technology — beautifully integrated into your home.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button size="lg" className="text-lg px-10 py-6 rounded-full shadow-lg bg-brand-navy hover:bg-brand-navy/90 text-white font-semibold transition-all duration-300">
                    Shop Appliances <MoveRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline" className="text-lg px-10 py-6 rounded-full border-brand-navy/30 text-brand-navy hover:border-brand-gold hover:text-brand-gold transition-all duration-300">
                    Our Story
                  </Button>
                </Link>
              </div>
              {/* Trust Row */}
              <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-brand-gold" />
                  <span>Free Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-brand-gold" />
                  <span>Official Warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <HeadphonesIcon className="h-4 w-4 text-brand-gold" />
                  <span>Expert Support</span>
                </div>
              </div>
            </div>

            {/* Right: Lifestyle Imagery */}
            <div className="relative lg:h-[90vh] flex items-center">
              <div className="relative w-full aspect-[4/5] lg:aspect-auto lg:h-[80vh] rounded-3xl overflow-hidden shadow-2xl">
                <img src={IMG.hero} alt="Luxury kitchen with premium appliances" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/10 to-transparent" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 lg:bottom-8 lg:left-[-40px] bg-white rounded-2xl shadow-xl p-5 border border-border/50 max-w-[200px]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center">
                    <Star className="h-6 w-6 text-brand-gold" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-brand-navy">500+</p>
                    <p className="text-xs text-muted-foreground">Premium Products</p>
                  </div>
                </div>
              </div>
              {/* Second image overlapping */}
              <div className="absolute top-8 right-[-20px] lg:top-[15%] lg:right-[-40px] w-[180px] lg:w-[220px] rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                <img src={IMG.hero2} alt="Modern kitchen interior" className="w-full aspect-square object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 px-4 md:px-8 bg-brand-cream">
        <div className="container mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="text-sm font-semibold text-brand-gold uppercase tracking-[0.2em]">Collections</span>
            <h2 className="text-4xl md:text-5xl font-bold text-brand-navy font-heading">Featured Categories</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">Explore our curated selection of premium appliances for every room.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeaturedCategoryCard name="Refrigerators" imageUrl={IMG.fridge} href="/products/refrigerators" />
            <FeaturedCategoryCard name="Washing Machines" imageUrl={IMG.washing} href="/products/washing-machines" />
            <FeaturedCategoryCard name="Air Conditioners" imageUrl={IMG.ac} href="/products/air-conditioners" />
            <FeaturedCategoryCard name="TVs &amp; Displays" imageUrl={IMG.tv} href="/products/tvs" />
            <FeaturedCategoryCard name="Audio Systems" imageUrl={IMG.audio} href="/products/audio" />
            <FeaturedCategoryCard name="Kitchen Appliances" imageUrl={IMG.kitchen} href="/products/kitchen" />
          </div>
        </div>
      </section>

      {/* Storytelling */}
      <section className="py-16 bg-white">
        <StorytellingSection
          title="Elevate Your Comfort"
          description="Experience unparalleled climate control with our premium air conditioning and smart home solutions. Designed for the modern Filipino home."
          imageUrl={IMG.story1}
          direction="right"
        />
      </section>
      <section className="py-16 bg-brand-cream">
        <StorytellingSection
          title="Innovation in Every Detail"
          description="From intuitive controls to energy-efficient designs, our products bring the latest technology seamlessly into your home."
          imageUrl={IMG.story2}
          direction="left"
        />
      </section>
      <section className="py-16 bg-white">
        <StorytellingSection
          title="Smart Living, Simplified"
          description="Connect your home, streamline your routines, and enjoy a more intelligent lifestyle with our integrated smart living solutions."
          imageUrl={IMG.story3}
          direction="right"
        />
      </section>

      {/* Promotions */}
      <section className="py-24 px-4 md:px-8 bg-brand-navy">
        <div className="container mx-auto text-center space-y-6">
          <span className="text-sm font-semibold text-brand-gold uppercase tracking-[0.2em]">Limited Time</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white font-heading">Exclusive Offers</h2>
          <p className="text-xl text-white/70 max-w-xl mx-auto">Get up to 20% off on select home appliances. Shop now and elevate your space.</p>
          <Link href="/promotions">
            <Button size="lg" className="px-12 py-6 rounded-full shadow-2xl bg-brand-gold hover:bg-brand-gold-hover text-brand-navy text-lg font-semibold">
              View Promotions <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-4 md:px-8 bg-white">
        <div className="container mx-auto text-center">
          <div className="mb-16 space-y-4">
            <span className="text-sm font-semibold text-brand-gold uppercase tracking-[0.2em]">Best Sellers</span>
            <h2 className="text-4xl md:text-5xl font-bold text-brand-navy font-heading">Featured Products</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">Our most popular appliances, handpicked for your home.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'Smart Refrigerator', price: '$65,000', img: IMG.fridge, badge: 'Energy A+++' },
              { name: 'Premium Washer', price: '$40,000', img: IMG.washing, badge: 'Smart Ready' },
              { name: 'Hi-Fi Soundbar', price: '$25,000', img: IMG.audio, badge: 'Best Seller' },
            ].map((p) => (
              <div key={p.name} className="group p-0 rounded-2xl bg-white border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden text-left">
                <div className="aspect-square overflow-hidden bg-muted/20 relative">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-brand-gold text-brand-navy text-xs font-semibold shadow-sm">
                    {p.badge}
                  </span>
                </div>
                <div className="p-6 space-y-3">
                  <p className="text-lg font-bold text-brand-navy group-hover:text-brand-gold transition-colors">{p.name}</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-brand-gold text-brand-gold" />
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-2xl font-bold text-brand-navy">{p.price}</span>
                    <Button size="sm" className="rounded-full bg-brand-navy hover:bg-brand-navy/90 text-white text-xs px-5">
                      Quick View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 md:px-8 bg-brand-cream">
        <div className="container mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="text-sm font-semibold text-brand-gold uppercase tracking-[0.2em]">Testimonials</span>
            <h2 className="text-4xl md:text-5xl font-bold text-brand-navy font-heading">What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { quote: 'Casa Central completely transformed my kitchen. The appliances are not only beautiful but incredibly functional!', author: 'Maria Santos', role: 'Homeowner' },
              { quote: 'The audio system has brought cinema-quality sound into my living room. Truly immersive!', author: 'Jose Reyes', role: 'Audiophile' },
              { quote: 'From selection to delivery, the service was top-notch. Highly recommended!', author: 'Anna Cruz', role: '' },
            ].map((t, i) => (
              <div key={i} className="p-8 rounded-2xl bg-white border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, si) => (
                    <Star key={si} className="h-4 w-4 fill-brand-gold text-brand-gold" />
                  ))}
                </div>
                <p className="text-foreground/80 text-lg italic leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center text-white font-bold text-sm">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-brand-navy text-sm">{t.author}</p>
                    {t.role && <p className="text-xs text-muted-foreground">{t.role}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 px-4 md:px-8 bg-brand-navy">
        <div className="container mx-auto text-center max-w-2xl space-y-6">
          <h2 className="text-4xl font-bold text-white font-heading">Stay Inspired</h2>
          <p className="text-lg text-white/70">Subscribe to receive exclusive offers, new arrivals, and design inspiration.</p>
          <div className="flex items-center gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-5 py-3.5 rounded-full border border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold transition-all backdrop-blur-sm"
            />
            <Button className="rounded-full px-8 py-3.5 bg-brand-gold hover:bg-brand-gold-hover text-brand-navy font-semibold shrink-0 shadow-lg">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
