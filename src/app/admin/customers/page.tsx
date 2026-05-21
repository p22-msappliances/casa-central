/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { readProfiles, updateUserRole } from '@/app/actions/profiles';

const ROLES = ['SUPER_ADMIN', 'ADMIN', 'INVENTORY_MANAGER', 'EDITOR', 'CUSTOMER_SUPPORT', 'CUSTOMER'] as const;

export default function AdminCustomersPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    readProfiles().then(result => {
      if (result.success && result.data) setProfiles(result.data);
      setLoading(false);
    });
  }, []);

  const handleRoleChange = async (userId: string, role: string) => {
    setUpdating(userId);
    const result = await updateUserRole(userId, role as any);
    if (result.success) {
      toast.success('Role updated');
      setProfiles(prev => prev.map(p => p.id === userId ? { ...p, role } : p));
    } else {
      toast.error(result.error || 'Failed to update role');
    }
    setUpdating(null);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary font-heading">User Management</h1>
          <p className="text-muted-foreground mt-1">View and manage system users and their roles.</p>
        </div>
      </div>
      <div className="rounded-xl bg-card border border-secondary/30 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-secondary/30 bg-secondary/20">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Last Updated</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">No users found.</td>
              </tr>
            ) : (
              profiles.map((p: any) => (
                <tr key={p.id} className="border-b border-secondary/10 hover:bg-secondary/10 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-primary">
                      {p.first_name && p.last_name ? `${p.first_name} ${p.last_name}` : p.first_name || p.last_name || p.email}
                    </div>
                    <div className="text-xs text-muted-foreground">{p.email}</div>
                  </td>
                  <td className="p-4">
                    <Badge variant={p.role === 'ADMIN' || p.role === 'SUPER_ADMIN' ? 'destructive' : p.role === 'INVENTORY_MANAGER' ? 'default' : 'secondary'}>
                      {p.role || 'CUSTOMER'}
                    </Badge>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {p.updated_at ? new Date(p.updated_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <select
                        className="text-xs px-2 py-1 rounded border border-input bg-background"
                        value={p.role || 'CUSTOMER'}
                        onChange={e => handleRoleChange(p.id, e.target.value)}
                        disabled={updating === p.id}
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      {updating === p.id && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
