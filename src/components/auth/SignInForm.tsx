"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout } from './AuthLayout';
import { createClient } from '@/lib/client';
import { useRouter } from 'next/navigation';

export const SignInForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
    } else {
      // Successful sign-in, redirect to dashboard or homepage
      // console.log('Sign in successful:', data.user);
      router.push('/'); // Redirect to homepage
    }
  };

  return (
    <AuthLayout
      title="Sign in to your account"
      description="Enter your email below to sign in to your account."
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
              Remember me
            </Label>
          </div>
          <div className="text-sm">
            <Link href="/forgot-password" className="font-medium text-accent-foreground hover:text-primary">
              Forgot your password?
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 p-3 rounded-md text-destructive text-sm">
            {error}
          </div>
        )}

        <div>
          <Button type="submit" className="w-full rounded-full px-6 py-3 text-lg">
            Sign in
          </Button>
        </div>
      </form>
      <div className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link href="/sign-up" className="font-medium text-accent-foreground hover:text-primary">
          Sign up
        </Link>
      </div>
    </AuthLayout>
  );
};
