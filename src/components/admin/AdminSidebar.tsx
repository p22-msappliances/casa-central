"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  Store,
  ShoppingCart,
  Users,
  FileText,
  Percent,
  Settings,
  ChevronLeft,
  LogOut,
  FolderTree,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/app/actions/auth';

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/brands', label: 'Brands', icon: Tag },
  { href: '/admin/inventory', label: 'Inventory', icon: Store },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/cms', label: 'CMS', icon: FileText },
  { href: '/admin/promotions', label: 'Promotions', icon: Percent },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-brand-soft-gray/60 p-4 flex flex-col">
      <div className="mb-8 px-2">
        <Link href="/admin" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="CASA CENTRAL"
            className="h-7 w-auto object-contain"
          />
          <span className="text-[10px] font-semibold bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded-full">Admin</span>
        </Link>
      </div>
      <nav className="space-y-1 flex-1">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                pathname === link.href
                  ? "bg-brand-navy text-white"
                  : "text-muted-foreground hover:bg-brand-cream hover:text-brand-navy"
              )}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1 pt-4 border-t border-border/40">
        <Link href="/">
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-primary">
            <ChevronLeft className="h-4 w-4 mr-2" /> Back to Store
          </Button>
        </Link>
        <form action={signOut}>
          <Button type="submit" variant="ghost" size="sm" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </form>
      </div>
    </aside>
  );
};
