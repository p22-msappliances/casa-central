"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Bell, Shield, Globe, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    promotions: true,
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    toast.success('Settings updated');
    setSaving(false);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-primary font-heading flex items-center gap-2">
        <Globe className="h-6 w-6" /> Account Settings
      </h2>

      <form onSubmit={handleSave} className="space-y-8 max-w-xl">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-primary font-heading flex items-center gap-2">
            <Bell className="h-5 w-5" /> Notification Preferences
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20 border border-secondary/30 cursor-pointer">
              <input type="checkbox" checked={notifications.email} onChange={e => setNotifications({ ...notifications, email: e.target.checked })} className="h-4 w-4" />
              <div><p className="font-medium text-primary text-sm">Email Notifications</p><p className="text-xs text-muted-foreground">Receive order updates and receipts via email</p></div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20 border border-secondary/30 cursor-pointer">
              <input type="checkbox" checked={notifications.sms} onChange={e => setNotifications({ ...notifications, sms: e.target.checked })} className="h-4 w-4" />
              <div><p className="font-medium text-primary text-sm">SMS Notifications</p><p className="text-xs text-muted-foreground">Receive shipping updates via SMS</p></div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20 border border-secondary/30 cursor-pointer">
              <input type="checkbox" checked={notifications.promotions} onChange={e => setNotifications({ ...notifications, promotions: e.target.checked })} className="h-4 w-4" />
              <div><p className="font-medium text-primary text-sm">Promotions & Offers</p><p className="text-xs text-muted-foreground">Receive updates about sales and new products</p></div>
            </label>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-primary font-heading flex items-center gap-2">
            <Shield className="h-5 w-5" /> Privacy
          </h3>
          <label className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20 border border-secondary/30 cursor-pointer">
            <input type="checkbox" defaultChecked className="h-4 w-4" />
            <div><p className="font-medium text-primary text-sm">Profile Visibility</p><p className="text-xs text-muted-foreground">Allow others to see my reviews and activity</p></div>
          </label>
        </div>

        <Button type="submit" className="rounded-full px-8" disabled={saving}>
          {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : <><Save className="h-4 w-4 mr-2" /> Save Settings</>}
        </Button>
      </form>
    </div>
  );
}
