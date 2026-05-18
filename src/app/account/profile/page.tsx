"use client";

import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Camera, Loader2 } from 'lucide-react';
import { getUserProfile, updateUserProfile } from '@/app/actions/profiles';
import { toast } from 'sonner'; // Assuming sonner is used or available, otherwise I'll use a simple state

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const result = await getUserProfile();
        if (result.success && result.data) {
          setProfile({
            first_name: result.data.first_name || '',
            last_name: result.data.last_name || '',
            email: result.data.email || '',
            phone_number: result.data.phone_number || '',
            address: result.data.address || '',
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

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
    } catch (error) {
      console.error('Unexpected error updating profile:', error);
      alert('An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
            onChange={(e) => setProfile(p => ({ ...p, first_name: e.target.value }))} 
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input 
            id="lastName" 
            value={profile.last_name} 
            onChange={(e) => setProfile(p => ({ ...p, last_name: e.target.value }))} 
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={profile.email} readOnly className="bg-muted" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input 
            id="phone" 
            type="tel" 
            value={profile.phone_number} 
            onChange={(e) => setProfile(p => ({ ...p, phone_number: e.target.value }))} 
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input 
            id="address" 
            value={profile.address} 
            onChange={(e) => setProfile(p => ({ ...p, address: e.target.value }))} 
          />
        </div>
      </div>
      <Button 
        className="rounded-full px-8" 
        onClick={handleSave} 
        disabled={saving}
      >
        {saving ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
        ) : (
          'Save Changes'
        )}
      </Button>
    </div>
  );
}
