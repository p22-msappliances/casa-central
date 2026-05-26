import React from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MailCheck } from 'lucide-react';

export default function CheckEmailPage() {
  return (
    <AuthLayout
      title="Check your email"
      description="We've sent a confirmation link to your email address. Please click the link to activate your account."
    >
      <div className="flex flex-col items-center justify-center space-y-6 py-8">
        <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center">
          <MailCheck className="h-8 w-8 text-brand-gold" />
        </div>
        <p className="text-center text-muted-foreground">
          If you don&apos;t see the email, please check your spam folder.
        </p>
        <Link href="/sign-in" className="w-full">
          <Button variant="outline" className="w-full rounded-full">
            Back to Sign In
          </Button>
        </Link>
      </div>
    </AuthLayout>
  );
}
