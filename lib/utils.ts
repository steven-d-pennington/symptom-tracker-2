/**
 * Generate a unique GUID using cryptographically secure random values
 */
export function generateGUID(): string {
  // Use crypto.randomUUID() if available (modern browsers and Node 19+)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // Secure fallback using crypto.getRandomValues()
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)

  // Set version (4) and variant (10) bits per RFC 4122
  bytes[6] = (bytes[6] & 0x0f) | 0x40 // Version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80 // Variant 10

  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
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
 * Format date to ISO string (YYYY-MM-DD)
 * Alias for formatDate for semantic clarity
 */
export function formatDateISO(date: Date): string {
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
