import React from 'react';

type AuthLayoutProps = {
  children: React.ReactNode;
  title: string;
  description: string;
};

export const AuthLayout = ({
  children,
  title,
  description,
}: AuthLayoutProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary font-heading tracking-tight">
            {title}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {description}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
};
