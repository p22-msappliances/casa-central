"use client";

import React, { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Phone, Mail, Clock, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { submitContact } from '@/app/actions/misc';

function ContactForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await submitContact(formData);
    setLoading(false);
    if (result.success) {
      toast.success('Message sent! We will get back to you within 24 hours.');
      e.currentTarget.reset();
    } else {
      if (typeof result.error === 'string') {
        toast.error(result.error);
      } else if (result.error && typeof result.error === 'object') {
        const errorMessages = Object.values(result.error as Record<string, string[]>).flat().join(', ');
        toast.error(errorMessages || 'Failed to send message');
      } else {
        toast.error('Failed to send message');
      }
    }
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
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" name="subject" required />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" rows={5} required className="resize-none" />
            </div>
            <Button type="submit" className="w-full rounded-full py-6 text-lg flex items-center gap-2" disabled={loading}>
              {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Sending...</> : <><Send className="h-5 w-5" /> Send Message</>}
            </Button>
          </form>
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
