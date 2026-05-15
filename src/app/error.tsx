"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto px-4 py-32 text-center space-y-8">
      <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-primary font-heading">Something Went Wrong</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          An unexpected error occurred. Please try again or contact support if the problem persists.
        </p>
      </div>
      <Button onClick={reset} className="rounded-full px-8 py-6 flex items-center gap-2 mx-auto">
        <RefreshCw className="h-5 w-5" /> Try Again
      </Button>
    </div>
  );
}
