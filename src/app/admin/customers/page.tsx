import React from 'react';
import { readProfiles } from '@/app/actions/profiles';
import { Badge } from '@/components/ui/badge';

export default async function AdminCustomersPage() {
  const result = await readProfiles();
  const profiles = result.success && result.data ? result.data : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary font-heading">User Management</h1>
        <p className="text-muted-foreground mt-1">View and manage system users and their roles.</p>
      </div>
      <div className="rounded-xl bg-card border border-secondary/30 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-secondary/30 bg-secondary/20">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-muted-foreground">
                  No users found.
                </td>
              </tr>
            ) : (
              profiles.map((p) => (
                <tr key={p.id} className="border-b border-secondary/10 hover:bg-secondary/10 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-primary">
                      {p.first_name && p.last_name ? `${p.first_name} ${p.last_name}` : p.first_name || p.last_name || p.email}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">{p.id}</div>
                  </td>
                  <td className="p-4">
                    <Badge variant={p.role === 'ADMIN' || p.role === 'SUPER_ADMIN' ? 'destructive' : p.role === 'INVENTORY_MANAGER' ? 'default' : 'secondary'}>
                      {p.role || 'CUSTOMER'}
                    </Badge>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {p.updated_at ? new Date(p.updated_at).toLocaleDateString() : 'N/A'}
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
