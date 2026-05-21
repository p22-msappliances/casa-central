import React, { Suspense } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

type LayoutProps = {
  children: React.ReactNode;
};

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={<div className="h-16 bg-background" />}>
        <Navbar />
      </Suspense>
      <main className="grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};
