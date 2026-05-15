import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl prose prose-invert">
      <h1 className="text-4xl font-bold text-primary font-heading mb-8">Privacy Policy</h1>
      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <p>Last updated: May 15, 2026</p>
        <h2 className="text-xl font-bold text-primary mt-8">Information We Collect</h2>
        <p>We collect information you provide when creating an account, placing an order, or contacting us — including your name, email address, shipping address, and payment details.</p>
        <h2 className="text-xl font-bold text-primary mt-8">How We Use Your Information</h2>
        <p>Your information is used to process orders, provide customer support, improve our services, and send promotional offers (with your consent).</p>
        <h2 className="text-xl font-bold text-primary mt-8">Data Protection</h2>
        <p>We implement industry-standard security measures to protect your personal data. Payment information is encrypted and never stored on our servers.</p>
        <h2 className="text-xl font-bold text-primary mt-8">Your Rights</h2>
        <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us.</p>
        <h2 className="text-xl font-bold text-primary mt-8">Contact</h2>
        <p>For privacy-related inquiries, email us at privacy@casacentral.com.</p>
      </div>
    </div>
  );
}
