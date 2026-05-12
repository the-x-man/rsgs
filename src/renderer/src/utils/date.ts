import {
  format,
  formatDistanceToNow,
  isAfter,
  isBefore,
  isToday,
  isTomorrow,
  parseISO,
  differenceInDays,
  addDays,
  startOfDay,
} from 'date-fns'

export function formatDate(date: string | Date | null, fmt = 'MMM d, yyyy'): string {
  if (!date) return '—'
  return format(typeof date === 'string' ? parseISO(date) : date, fmt)
}

export function formatDateShort(date: string | Date | null): string {
  return formatDate(date, 'MMM d')
}

export function formatDateTime(date: string | Date | null): string {
  return formatDate(date, 'MMM d, yyyy h:mm a')
}

export function fromNow(date: string | Date | null): string {
  if (!date) return ''
  return formatDistanceToNow(typeof date === 'string' ? parseISO(date) : date, { addSuffix: true })
}

export function isOverdue(date: string | null): boolean {
  if (!date) return false
  return isBefore(startOfDay(parseISO(date)), startOfDay(new Date()))
}

export function isDueToday(date: string | null): boolean {
  if (!date) return false
  return isToday(parseISO(date))
}

export function isDueTomorrow(date: string | null): boolean {
  if (!date) return false
  return isTomorrow(parseISO(date))
}

export function isDueSoon(date: string | null, days = 3): boolean {
  if (!date) return false
  const d = parseISO(date)
  return isAfter(d, new Date()) && differenceInDays(d, new Date()) <= days
}

export function isDateInPast(date: string): boolean {
  return isBefore(parseISO(date), startOfDay(new Date()))
}

export function todayIso(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function futureDateOnly(date: string | null): string | null {
  if (!date) return null
  return isDateInPast(date) ? null : date
}

export function nextNDays(n: number): Date {
  return addDays(new Date(), n)
}
