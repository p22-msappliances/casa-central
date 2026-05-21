"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CartDrawer } from '@/components/ui/CartDrawer';
import { Button, buttonVariants } from '@/components/ui/button';
import { User, Search, LogOut, LayoutDashboard } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/client';
import { signOut } from '@/app/actions/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = React.useMemo(() => createClient(), []);

  useEffect(() => {
    const getUserAndRole = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (user) {
          setUser(user);
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          setRole(profile?.role || null);
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (err) {
        console.error('Error fetching user/role:', err);
      } finally {
        setLoading(false);
      }
    };

    getUserAndRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: any, session: any) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single();
          setRole(profile?.role || null);
        } else {
          setRole(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Shop' },
    { href: '/promotions', label: 'Promotions' },
    { href: '/about', label: 'About' },
  ];

  const handleSignOut = async () => {
    setUser(null);
    setRole(null);
    await signOut();
    router.push('/');
    router.refresh();
  };

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
          
          {!loading && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <button type="button" className={cn(buttonVariants({ variant: 'ghost', size: 'icon', className: 'rounded-full hover:bg-brand-gold/10' }))}>
                  <User className="h-5 w-5 text-brand-gold" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <Link href="/account/settings" className="flex flex-col space-y-1 hover:text-brand-gold transition-colors">
                      <p className="text-sm font-medium leading-none">{user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        Account Settings
                      </p>
                    </Link>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/account/profile')} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/account/orders')} className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    My Orders
                  </DropdownMenuItem>
                  
                  {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
                    <DropdownMenuItem onClick={() => router.push('/admin')} className="cursor-pointer text-brand-gold font-semibold">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/sign-in">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-brand-gold/10">
                <User className="h-5 w-5 text-muted-foreground hover:text-brand-gold transition-colors" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
