"use client";

import React, { useState } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push('/sign-in'), 2000);
  };

  if (done) {
    return (
      <AuthLayout title="Password Reset" description="Your password has been updated successfully.">
        <div className="text-center space-y-4 py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <p className="text-muted-foreground">Redirecting to sign in...</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset Password" description="Enter your new password below.">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="password">New Password</Label>
          <Input id="password" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="mt-1" placeholder="Min. 6 characters" />
        </div>
        <div>
          <Label htmlFor="confirm">Confirm New Password</Label>
          <Input id="confirm" type="password" required minLength={6} value={confirm} onChange={e => setConfirm(e.target.value)} className="mt-1" placeholder="Repeat your password" />
        </div>
        <Button type="submit" className="w-full rounded-full px-6 py-3 text-lg" disabled={loading}>
          {loading ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Resetting...</> : 'Reset Password'}
        </Button>
      </form>
    </AuthLayout>
  );
}
