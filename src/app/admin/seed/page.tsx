"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Database, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { seedDatabase } from '@/app/actions/seed';

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSeed = async () => {
    if (!window.confirm('This will add demo data if tables are empty. Proceed?')) return;
    setLoading(true);
    setResult(null);
    const res = await seedDatabase();
    setResult(res);
    setLoading(false);
    if (res.success) {
      toast.success('Seed completed!');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary font-heading">Seed Database</h1>
        <p className="text-muted-foreground mt-1">Populate the database with demo products, categories, brands, and variants.</p>
      </div>

      <div className="p-6 rounded-xl bg-card border border-secondary/30 max-w-lg">
        <p className="text-sm text-muted-foreground mb-4">
          This action will check for existing data and only insert records for empty tables.
          It is safe to run multiple times.
        </p>
        <Button onClick={handleSeed} disabled={loading} className="w-full rounded-full py-6 text-lg">
          {loading ? (
            <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Seeding...</>
          ) : (
            <><Database className="h-5 w-5 mr-2" /> Seed Database</>
          )}
        </Button>
        {result && (
          <div className={`mt-4 p-3 rounded-md flex items-center gap-2 ${result.success ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
            {result.success ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            <span className="text-sm">{result.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
