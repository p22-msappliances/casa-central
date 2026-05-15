"use client";

import React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Camera } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
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
          <p className="text-lg font-bold text-primary">Juan Dela Cruz</p>
          <p className="text-sm text-muted-foreground">juan.delacruz@email.com</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" defaultValue="Juan" />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" defaultValue="Dela Cruz" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" defaultValue="juan.delacruz@email.com" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" type="tel" defaultValue="+63 912 345 6789" />
        </div>
      </div>
      <Button className="rounded-full px-8">Save Changes</Button>
    </div>
  );
}
