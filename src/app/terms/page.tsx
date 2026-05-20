import React from 'react';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-4xl font-bold text-primary font-heading mb-8">Terms of Service</h1>
      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <p>Last updated: May 15, 2026</p>
        <h2 className="text-xl font-bold text-primary mt-8">General</h2>
        <p>By using the CASA CENTRAL website, you agree to these terms. If you do not agree, please refrain from using our services.</p>
        <h2 className="text-xl font-bold text-primary mt-8">Orders & Payment</h2>
        <p>All prices are listed in US Dollars ($) and include applicable taxes. We reserve the right to modify prices at any time. Payment must be completed before order processing begins.</p>
        <h2 className="text-xl font-bold text-primary mt-8">Shipping & Delivery</h2>
        <p>Delivery times are estimates and not guaranteed. We are not liable for delays caused by third-party carriers or force majeure events.</p>
        <h2 className="text-xl font-bold text-primary mt-8">Returns & Refunds</h2>
        <p>Products may be returned within 30 days of delivery in original condition. Certain items may be subject to restocking fees.</p>
        <h2 className="text-xl font-bold text-primary mt-8">Limitation of Liability</h2>
        <p>CASA CENTRAL shall not be held liable for indirect, incidental, or consequential damages arising from the use of our products or services.</p>
      </div>
    </div>
  );
}
