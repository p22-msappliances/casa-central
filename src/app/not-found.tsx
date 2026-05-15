"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-32 text-center space-y-8">
      <h1 className="text-9xl font-bold text-primary/20 font-heading">404</h1>
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-primary font-heading">Page Not Found</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>
      <div className="flex items-center justify-center gap-4">
        <Link href="/">
          <Button className="rounded-full px-8 py-6 flex items-center gap-2">
            <Home className="h-5 w-5" /> Go Home
          </Button>
        </Link>
        <Button variant="outline" className="rounded-full px-8 py-6 flex items-center gap-2" onClick={() => window.history.back()}>
          <ArrowLeft className="h-5 w-5" /> Go Back
        </Button>
      </div>
    </div>
  );
}
