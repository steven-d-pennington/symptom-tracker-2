/**
 * Generate a unique GUID
 */
export function generateGUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Get current timestamp in milliseconds
 */
export function getCurrentTimestamp(): number {
  return Date.now()
}

/**
 * Get timezone offset in minutes
 */
export function getTimezoneOffset(): number {
  return new Date().getTimezoneOffset()
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Validate severity value (1-10 range)
 */
export function validateSeverity(severity: number): boolean {
  return Number.isInteger(severity) && severity >= 1 && severity <= 10
}

/**
 * Validate coordinates (0-1 range)
 */
export function validateCoordinate(coordinate: number): boolean {
  return coordinate >= 0 && coordinate <= 1
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHTML(html: string): string {
  const tempDiv = document.createElement('div')
  tempDiv.textContent = html
  return tempDiv.innerHTML
}

/**
 * Calculate days between two dates
 */
export function daysBetween(date1: number, date2: number): number {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.floor(Math.abs(date2 - date1) / msPerDay)
}
