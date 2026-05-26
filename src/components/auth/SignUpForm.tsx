"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout } from './AuthLayout';
import { createClient } from '@/lib/client';
import { useRouter } from 'next/navigation';
import { signUpSchema } from '@/lib/schemas';
import { Loader2 } from 'lucide-react';

export const SignUpForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const result = signUpSchema.safeParse({ firstName, lastName, email, password });
    if (!result.success) {
      setFieldErrors(result.error.flatten().fieldErrors as Record<string, string[]>);
      return;
    }

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        data: {
          firstName: result.data.firstName,
          lastName: result.data.lastName,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      router.push('/auth/check-email');
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setSocialLoading(provider);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setSocialLoading(null);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      description="Enter your details below to create a new account."
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="first-name">First name</Label>
            <Input
              id="first-name"
              type="text"
              required
              placeholder="Juan"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1"
            />
            {fieldErrors.firstName && (
              <p className="text-sm text-destructive mt-1">{fieldErrors.firstName[0]}</p>
            )}
          </div>
          <div>
            <Label htmlFor="last-name">Last name</Label>
            <Input
              id="last-name"
              type="text"
              required
              placeholder="Dela Cruz"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1"
            />
            {fieldErrors.lastName && (
              <p className="text-sm text-destructive mt-1">{fieldErrors.lastName[0]}</p>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            required
            placeholder="juan.delacruz@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
          />
          {fieldErrors.email && (
            <p className="text-sm text-destructive mt-1">{fieldErrors.email[0]}</p>
          )}
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
          {fieldErrors.password && (
            <p className="text-sm text-destructive mt-1">{fieldErrors.password[0]}</p>
          )}
        </div>

        {error && (
          <div className="bg-destructive/10 p-3 rounded-md text-destructive text-sm">
            {error}
          </div>
        )}

        <div>
          <Button type="submit" className="w-full rounded-full px-6 py-3 text-lg">
            Sign up
          </Button>
        </div>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or sign up with</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          variant="outline"
          className="w-full rounded-full py-5"
          onClick={() => handleSocialLogin('google')}
          disabled={socialLoading !== null}
        >
          {socialLoading === 'google' ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : (
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          Google
        </Button>
        <Button
          variant="outline"
          className="w-full rounded-full py-5"
          onClick={() => handleSocialLogin('facebook')}
          disabled={socialLoading !== null}
        >
          {socialLoading === 'facebook' ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          )}
          Facebook
        </Button>
      </div>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/sign-in" className="font-medium text-accent-foreground hover:text-primary">
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
};
