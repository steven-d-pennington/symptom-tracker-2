/**
 * HS (Hidradenitis Suppurativa) tracking module
 *
 * Provides:
 * - IHS4 score calculation
 * - Lesion management (CRUD)
 * - Daily entry tracking
 * - Prodromal marker tracking
 * - Hurley staging
 */

// Types
export * from './types'

// IHS4 Calculation
export {
  calculateIHS4ForDate,
  calculateCurrentIHS4,
  getIHS4Severity,
  getIHS4History,
  getIHS4Change,
  getIHS4Average,
  getWorstIHS4InPeriod,
  calculateIHS4Impact,
  formatIHS4Score,
  getIHS4SeverityColor,
  getIHS4SeverityLabel,
  validateIHS4Score,
  createEmptyIHS4Result,
} from './ihs4'

// Lesion operations (will be implemented)
export * from './lesions'
