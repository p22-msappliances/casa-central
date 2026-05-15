"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Pencil } from 'lucide-react';

const mockContent = [
  { id: '1', title: 'Homepage Hero Banner', type: 'Banner', status: 'Published', updated: '2026-05-10' },
  { id: '2', title: 'Summer Promo Section', type: 'Section', status: 'Draft', updated: '2026-05-08' },
  { id: '3', title: 'Buying Guide: Refrigerators', type: 'Blog', status: 'Published', updated: '2026-05-05' },
  { id: '4', title: 'About Us Page', type: 'Page', status: 'Published', updated: '2026-04-28' },
  { id: '5', title: 'FAQ Section', type: 'Section', status: 'Draft', updated: '2026-04-20' },
];

export default function AdminCMSPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary font-heading">Content Management</h1>
          <p className="text-muted-foreground mt-1">Manage banners, pages, and blog posts.</p>
        </div>
        <Button className="rounded-full">
          <Plus className="h-4 w-4 mr-2" /> New Content
        </Button>
      </div>
      <div className="rounded-xl bg-card border border-secondary/30 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-secondary/30 bg-secondary/20">
              <th className="p-4 font-medium">Title</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Last Updated</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockContent.map((item) => (
              <tr key={item.id} className="border-b border-secondary/10 hover:bg-secondary/10 transition-colors">
                <td className="p-4 font-medium text-primary">{item.title}</td>
                <td className="p-4">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-secondary text-muted-foreground">{item.type}</span>
                </td>
                <td className="p-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    item.status === 'Published' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                  }`}>{item.status}</span>
                </td>
                <td className="p-4 text-muted-foreground">{item.updated}</td>
                <td className="p-4">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
