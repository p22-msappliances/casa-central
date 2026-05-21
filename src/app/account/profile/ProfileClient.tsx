/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Camera, Loader2 } from 'lucide-react';
import { updateUserProfile } from '@/app/actions/profiles';

export function ProfileClient({ initialProfile }: { initialProfile: any }) {
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    first_name: initialProfile?.first_name || '',
    last_name: initialProfile?.last_name || '',
    email: initialProfile?.email || '',
    phone_number: initialProfile?.phone_number || '',
    address: initialProfile?.address || '',
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateUserProfile({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone_number: profile.phone_number,
        address: profile.address,
      });

      if (result.success) {
        alert('Profile updated successfully!');
      } else {
        alert(`Error updating profile: ${result.error}`);
      }
    } catch {
      alert('An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-primary font-heading flex items-center gap-2">
        <User className="h-6 w-6" /> Profile
      </h2>
      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
          <User className="h-12 w-12 text-muted-foreground" />
          <button className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Camera className="h-6 w-6 text-white" />
          </button>
        </div>
        <div>
          <p className="text-lg font-bold text-primary">
            {profile.first_name} {profile.last_name}
          </p>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={profile.first_name}
            onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={profile.last_name}
            onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={profile.email} disabled className="mt-1 bg-secondary/30" />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={profile.phone_number}
            onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
            className="mt-1"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="address">Default Address</Label>
          <Input
            id="address"
            value={profile.address}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>
      <Button onClick={handleSave} disabled={saving} className="rounded-full px-8">
        {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Save Changes
      </Button>
    </div>
  );
}
