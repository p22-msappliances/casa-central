import React from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Forgot Password"
      description="Enter your email below and we'll send you a link to reset your password."
    >
      <form className="space-y-6">
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            required
            placeholder="your@email.com"
            className="mt-1"
          />
        </div>

        <div>
          <Button type="submit" className="w-full rounded-full px-6 py-3 text-lg">
            Send Reset Link
          </Button>
        </div>
      </form>
      <div className="mt-6 text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link href="/sign-in" className="font-medium text-accent-foreground hover:text-primary">
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
