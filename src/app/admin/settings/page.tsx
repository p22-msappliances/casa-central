import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Save } from 'lucide-react';
import { saveAdminSettings } from '@/app/actions/misc';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-primary font-heading">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage store settings.</p>
      </div>
      <form action={saveAdminSettings as unknown as (fd: FormData) => void} className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-primary font-heading mb-4">Store Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Store Name</Label>
              <Input name="store_name" defaultValue="CASA CENTRAL" />
            </div>
            <div>
              <Label>Email</Label>
              <Input name="email" type="email" defaultValue="hello@casacentral.com" />
            </div>
            <div className="sm:col-span-2">
              <Label>Address</Label>
              <Input name="address" defaultValue="123 Rizal Ave., Quezon City, Metro Manila" />
            </div>
          </div>
        </div>
        <Separator />
        <div>
          <h3 className="text-lg font-bold text-primary font-heading mb-4">Shipping Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Free Shipping Threshold ($)</Label>
              <Input name="free_shipping_threshold" defaultValue="5000" type="number" />
            </div>
            <div>
              <Label>Standard Shipping Fee ($)</Label>
              <Input name="standard_shipping_fee" defaultValue="150" type="number" />
            </div>
          </div>
        </div>
        <Separator />
        <div>
          <h3 className="text-lg font-bold text-primary font-heading mb-4">Tax Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Tax Rate (%)</Label>
              <Input name="tax_rate" defaultValue="12" type="number" />
            </div>
          </div>
        </div>
        <Button type="submit" className="rounded-full px-8">
          <Save className="h-4 w-4 mr-2" /> Save Settings
        </Button>
      </form>
    </div>
  );
}
