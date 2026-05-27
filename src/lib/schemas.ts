import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signUpSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;

export const checkoutItemSchema = z.object({
  variant_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  price_at_purchase: z.number().positive(),
});

export const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, 'At least one item is required'),
  shipping_address: z.string().min(5, 'Shipping address is required'),
  total_amount: z.number().positive('Total amount must be positive'),
  delivery_type: z.enum(['delivery', 'pickup']),
  payment_type: z.enum(['pay_on_pickup', 'pay_later']),
  scheduled_date: z.string().optional(),
  scheduled_time: z.string().optional(),
});

export type CheckoutItemInput = z.infer<typeof checkoutItemSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const leadInquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().optional(),
  product_id: z.string().uuid().optional(),
});

export type LeadInquiryInput = z.infer<typeof leadInquirySchema>;
