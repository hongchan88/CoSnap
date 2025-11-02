import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format number with thousands separator
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ko-KR').format(num)
}

// Format date in Korean format
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  }).format(dateObj)
}

// Format date with time
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj)
}

// Calculate percentage
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Generate color based on score
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 50) return 'text-blue-600'
  if (score >= 20) return 'text-yellow-600'
  return 'text-red-600'
}

// Get Focus tier label
export function getFocusTier(score: number): string {
  if (score >= 81) return 'Crystal'
  if (score >= 51) return 'Clear'
  if (score >= 21) return 'Focusing'
  return 'Blurry'
}
