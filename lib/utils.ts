import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date, isShort: boolean = false, isOnlyNumber: boolean = false) {
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: isShort ? 'short' : 'long',
    year: isOnlyNumber ? undefined : 'numeric'
  });
}

export function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(amount);
}