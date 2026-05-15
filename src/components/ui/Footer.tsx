import React from 'react';
import Link from 'next/link';

export const Footer = () => {
  const footerLinks = [
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ];

  const socialLinks = [
    { href: '#', label: 'Facebook', id: 'facebook' },
    { href: '#', label: 'Instagram', id: 'instagram' },
    { href: '#', label: 'Twitter', id: 'twitter' },
  ];

  return (
    <footer className="bg-brand-navy text-white/70 py-16 px-4 md:px-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-1 space-y-4">
            <img
              src="/logo.png"
              alt="CASA CENTRAL"
              className="h-8 w-auto object-contain brightness-0 invert"
            />
            <p className="text-sm text-white/60 leading-relaxed">
              Transforming modern homes through premium appliances and beautiful technology.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-brand-gold transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Connect</h4>
            <ul className="space-y-3">
              {socialLinks.map((link) => (
                <li key={link.id}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-brand-gold transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li>hello@casacentral.com</li>
              <li>+63 (2) 8123 4567</li>
              <li>Quezon City, Metro Manila</li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 text-center text-xs text-white/40">
          &copy; {new Date().getFullYear()} CASA CENTRAL. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
