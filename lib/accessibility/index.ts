/**
 * Accessibility utilities for WCAG 2.1 AA compliance
 */

// Keyboard navigation utilities
export const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]'
].join(', ')

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS))
}

export function trapFocus(container: HTMLElement, event: KeyboardEvent): void {
  if (event.key !== 'Tab') return

  const focusableElements = getFocusableElements(container)
  if (focusableElements.length === 0) return

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}

// ARIA live region announcer
let announcer: HTMLDivElement | null = null

function getAnnouncer(): HTMLDivElement {
  if (!announcer) {
    announcer = document.createElement('div')
    announcer.setAttribute('aria-live', 'polite')
    announcer.setAttribute('aria-atomic', 'true')
    announcer.setAttribute('role', 'status')
    announcer.className = 'sr-only'
    announcer.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `
    document.body.appendChild(announcer)
  }
  return announcer
}

export function announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const el = getAnnouncer()
  el.setAttribute('aria-live', priority)

  // Clear and set message (ensures screen readers announce even if same message)
  el.textContent = ''
  setTimeout(() => {
    el.textContent = message
  }, 100)
}

// High contrast mode detection
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-contrast: more)').matches
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Focus visible utility
export function setupFocusVisible(): void {
  if (typeof document === 'undefined') return

  let hadKeyboardEvent = false

  document.addEventListener('keydown', () => {
    hadKeyboardEvent = true
  })

  document.addEventListener('mousedown', () => {
    hadKeyboardEvent = false
  })

  document.addEventListener('focusin', (event) => {
    const target = event.target as HTMLElement
    if (hadKeyboardEvent) {
      target.setAttribute('data-focus-visible', 'true')
    }
  })

  document.addEventListener('focusout', (event) => {
    const target = event.target as HTMLElement
    target.removeAttribute('data-focus-visible')
  })
}

// Skip link target management
export function scrollToMainContent(): void {
  const main = document.querySelector('main') || document.getElementById('main-content')
  if (main) {
    main.setAttribute('tabindex', '-1')
    main.focus()
    main.scrollIntoView({ behavior: 'smooth' })
  }
}

// Minimum touch target size check (44x44 pixels for WCAG)
export const MIN_TOUCH_TARGET = 44

export function checkTouchTargetSize(element: HTMLElement): { width: number; height: number; compliant: boolean } {
  const rect = element.getBoundingClientRect()
  return {
    width: rect.width,
    height: rect.height,
    compliant: rect.width >= MIN_TOUCH_TARGET && rect.height >= MIN_TOUCH_TARGET
  }
}

// Color contrast utilities
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null
}

export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  if (!rgb1 || !rgb2) return 0

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

// WCAG AA requires 4.5:1 for normal text, 3:1 for large text
export function meetsContrastRequirement(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background)
  return isLargeText ? ratio >= 3 : ratio >= 4.5
}

// Accessible name computation helper
export function getAccessibleName(element: HTMLElement): string {
  // Check aria-labelledby first
  const labelledBy = element.getAttribute('aria-labelledby')
  if (labelledBy) {
    const labels = labelledBy.split(' ').map((id) => {
      const el = document.getElementById(id)
      return el?.textContent || ''
    })
    if (labels.some(l => l)) return labels.join(' ').trim()
  }

  // Check aria-label
  const ariaLabel = element.getAttribute('aria-label')
  if (ariaLabel) return ariaLabel

  // Check for associated label element
  const id = element.id
  if (id) {
    const label = document.querySelector<HTMLLabelElement>(`label[for="${id}"]`)
    if (label?.textContent) return label.textContent.trim()
  }

  // Check title attribute
  const title = element.getAttribute('title')
  if (title) return title

  // Check text content
  return element.textContent?.trim() || ''
}
