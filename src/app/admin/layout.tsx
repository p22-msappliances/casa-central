import React, { Suspense } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export const metadata = {
  title: {
    template: '%s | Admin | CASA CENTRAL',
    default: 'Admin Dashboard | CASA CENTRAL',
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Suspense fallback={<div className="w-64 min-h-screen bg-card border-r border-secondary/30" />}>
        <AdminSidebar />
      </Suspense>
      <main className="flex-1 p-4 md:p-8 pt-[3.5rem] md:pt-8 bg-background overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
