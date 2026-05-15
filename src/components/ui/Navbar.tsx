"use client";

import React from 'react';
import Link from 'next/link';
import { CartDrawer } from '@/components/ui/CartDrawer';
import { Button } from '@/components/ui/button';
import { User, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export const Navbar = () => {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Shop' },
    { href: '/promotions', label: 'Promotions' },
    { href: '/about', label: 'About' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-brand-soft-gray/60 bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center">
          <img
            src="/logo.png"
            alt="CASA CENTRAL"
            className="h-9 w-auto"
            style={{ objectFit: 'contain' }}
          />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors duration-200",
                pathname === link.href
                  ? "text-brand-gold"
                  : "text-muted-foreground hover:text-brand-navy"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/search">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-brand-gold/10">
              <Search className="h-5 w-5 text-muted-foreground hover:text-brand-gold transition-colors" />
            </Button>
          </Link>
          <CartDrawer />
          <Link href="/sign-in">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-brand-gold/10">
              <User className="h-5 w-5 text-muted-foreground hover:text-brand-gold transition-colors" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
