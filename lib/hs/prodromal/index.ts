/**
 * Prodromal Marker Module
 *
 * Tracks pre-lesion warning symptoms and their conversion to full lesions
 */

export {
  // Create
  createProdromalMarker,
  // Read
  getActiveProdromalMarkers,
  getAllProdromalMarkers,
  getProdromalMarker,
  getProdromalMarkersForRegion,
  getActiveProdromalMarkersForRegion,
  // Update
  updateProdromalMarker,
  // Conversion
  convertProdromalToLesion,
  resolveProdromalMarker,
  // Delete
  deleteProdromalMarker,
  // Analytics
  getProdromalConversionStats,
  // Display helpers
  PRODROMAL_SYMPTOM_LABELS,
  getActiveSymptomLabels,
  hasAnySymptoms,
  createEmptySymptoms,
} from './operations'

export type {
  CreateProdromalMarkerInput,
  UpdateProdromalMarkerInput,
  ConvertToLesionInput,
  ProdromalConversionStats,
} from './operations'
