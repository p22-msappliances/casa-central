"use client";

import React, { useState } from 'react';
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
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
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

function SidebarContent() {
  const pathname = usePathname();

  return (
    <>
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
              <Icon className="h-5 w-5 shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1 pt-4 border-t border-border/40">
        <Link href="/">
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-primary">
            <ChevronLeft className="h-4 w-4 mr-2 shrink-0" /> Back to Store
          </Button>
        </Link>
        <form action={signOut}>
          <Button type="submit" variant="ghost" size="sm" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
            <LogOut className="h-4 w-4 mr-2 shrink-0" /> Sign Out
          </Button>
        </form>
      </div>
    </>
  );
}

export const AdminSidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="hidden md:flex w-64 min-h-screen bg-white border-r border-brand-soft-gray/60 p-4 flex-col">
        <SidebarContent />
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex h-14 items-center gap-2 border-b border-brand-soft-gray/60 bg-white px-4">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
        <img src="/logo.png" alt="CASA CENTRAL" className="h-7 w-auto" />
        <span className="text-[10px] font-semibold bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded-full ml-auto">Admin</span>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 sm:max-w-xs p-4 flex flex-col" showCloseButton={false}>
          <div className="flex items-center justify-end mb-2">
            <Button variant="ghost" size="icon-sm" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 flex flex-col" onClick={() => setOpen(false)}>
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
