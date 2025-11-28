/**
 * Lesion management operations
 */

// Create
export {
  createLesion,
  createDefaultSymptoms,
  createDefaultDrainage,
  getActiveLesions,
  getAllLesions,
  getLesionsByRegion,
  getActiveLesionsByRegion,
  getLesionByGuid,
  countActiveLesionsByType,
} from './createLesion'
export type { CreateLesionInput, CreateLesionResult } from './createLesion'

// Update
export {
  updateLesion,
  changeLesionType,
  updateLesionStatus,
  markLesionHealing,
  markLesionWorsening,
} from './updateLesion'
export type { UpdateLesionInput } from './updateLesion'

// Heal
export {
  healLesion,
  getHealedLesions,
  getHealedLesionsByRegion,
  calculateHealingDuration,
  getAverageHealingTime,
  reopenLesionAsRecurrence,
} from './healLesion'
export type { HealLesionInput } from './healLesion'

// Observe
export {
  observeLesion,
  getObservationsForLesion,
  getLatestObservation,
  getObservationsForDate,
  getObservationsForEntry,
  hasObservationToday,
  getPainTrend,
  getSizeProgression,
  getAveragePain,
  getWorstSymptoms,
  deleteObservation,
} from './observeLesion'
export type { ObserveLesionInput } from './observeLesion'

// Delete
export { deleteLesion, deleteLesionWithObservations } from './deleteLesion'
