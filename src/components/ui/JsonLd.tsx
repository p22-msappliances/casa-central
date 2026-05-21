import React from 'react';

export const JsonLd = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'CASA CENTRAL',
    description: 'Premium appliances and audio systems for modern homes.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/logo.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Rizal Avenue',
      addressLocality: 'Quezon City',
      addressRegion: 'Metro Manila',
      postalCode: '1100',
      addressCountry: 'PH',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+63-2-8123-4567',
      contactType: 'customer service',
    },
    sameAs: [
      'https://facebook.com/casacentral',
      'https://instagram.com/casacentral',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      suppressHydrationWarning
    />
  );
};
