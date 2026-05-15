"use client";

import React, { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="container mx-auto px-4 py-16 space-y-16">
      <section className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-primary font-heading">Get in Touch</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Have questions? We'd love to hear from you.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <MapPin className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-bold text-primary">Address</h3>
                <p className="text-muted-foreground">123 Rizal Avenue, Quezon City, Metro Manila</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Phone className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-bold text-primary">Phone</h3>
                <p className="text-muted-foreground">+63 (2) 8123 4567</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Mail className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-bold text-primary">Email</h3>
                <p className="text-muted-foreground">hello@casacentral.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Clock className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-bold text-primary">Store Hours</h3>
                <p className="text-muted-foreground">Monday – Saturday: 9:00 AM – 7:00 PM</p>
                <p className="text-muted-foreground">Sunday: 10:00 AM – 5:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-2xl bg-card border border-secondary/30">
          {submitted ? (
            <div className="text-center space-y-4 py-12">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Send className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-primary">Message Sent!</h3>
              <p className="text-muted-foreground">Thank you for reaching out. We'll get back to you within 24 hours.</p>
              <Button variant="outline" className="rounded-full" onClick={() => setSubmitted(false)}>Send Another Message</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required />
                </div>
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" required />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" rows={5} required className="resize-none" />
              </div>
              <Button type="submit" className="w-full rounded-full py-6 text-lg flex items-center gap-2">
                <Send className="h-5 w-5" /> Send Message
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="text-center py-24 text-muted-foreground">Loading...</div>}>
      <ContactForm />
    </Suspense>
  );
}
