import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  let cleaned = digits

  if (cleaned.length === 11 && cleaned.startsWith('1')) cleaned = cleaned.slice(1)
  else if (cleaned.length === 11 && cleaned.startsWith('0')) cleaned = cleaned.slice(1)
  else if (cleaned.length === 12 && cleaned.startsWith('63')) cleaned = cleaned.slice(2)

  if (cleaned.length !== 10) return digits

  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
}

export function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 0) return ''
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`
}
