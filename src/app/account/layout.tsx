import React, { Suspense } from 'react';
import { AccountNav } from './AccountNav';

export const dynamic = 'force-dynamic';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary font-heading mb-8">My Account</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <Suspense fallback={<div className="space-y-2">{Array(5).fill(null).map((_, i) => <div key={i} className="h-10 bg-secondary/20 rounded-xl" />)}</div>}>
            <AccountNav />
          </Suspense>
        </div>
        <div className="md:col-span-3">{children}</div>
      </div>
    </div>
  );
}
