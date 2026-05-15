import React from 'react';

interface ProductSpecificationsProps {
  specs: Record<string, string | number | boolean>;
}

export const ProductSpecifications = ({ specs }: ProductSpecificationsProps) => {
  if (!specs || Object.keys(specs).length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-primary font-heading mb-6">Technical Specifications</h3>
      <div className="grid grid-cols-1 gap-x-8 gap-y-4 border-t border-secondary/30 pt-6">
        {Object.entries(specs).map(([key, value]) => (
          <div key={key} className="flex justify-between py-3 border-b border-secondary/10">
            <span className="text-muted-foreground font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
            <span className="text-accent-foreground font-semibold">{String(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
