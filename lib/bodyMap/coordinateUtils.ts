/**
 * Coordinate utilities for body map
 * Handles normalization and denormalization of coordinates
 */

/**
 * Normalize screen coordinates to 0-1 range
 * Accounts for zoom level and region bounds
 */
export function normalizeCoordinates(
  clickX: number,
  clickY: number,
  svgElement: SVGSVGElement,
  zoom: number = 1
): { x: number; y: number } {
  const rect = svgElement.getBoundingClientRect()
  const viewBox = svgElement.viewBox.baseVal

  // Convert client coordinates to SVG coordinates
  const svgPoint = svgElement.createSVGPoint()
  svgPoint.x = clickX
  svgPoint.y = clickY

  // Get transformation matrix
  const matrix = svgElement.getScreenCTM()?.inverse()
  if (!matrix) {
    return { x: 0, y: 0 }
  }

  const transformed = svgPoint.matrixTransform(matrix)

  // Normalize to 0-1 range based on viewBox
  const normalizedX = (transformed.x - viewBox.x) / viewBox.width
  const normalizedY = (transformed.y - viewBox.y) / viewBox.height

  return {
    x: Math.max(0, Math.min(1, normalizedX)),
    y: Math.max(0, Math.min(1, normalizedY)),
  }
}

/**
 * Denormalize coordinates from 0-1 range back to SVG coordinates
 */
export function denormalizeCoordinates(
  normalizedX: number,
  normalizedY: number,
  viewBoxWidth: number,
  viewBoxHeight: number
): { x: number; y: number } {
  return {
    x: normalizedX * viewBoxWidth,
    y: normalizedY * viewBoxHeight,
  }
}

/**
 * Get severity color based on value (1-10)
 */
export function getSeverityColor(severity: number): string {
  if (severity >= 8) return '#ef4444' // red-500
  if (severity >= 5) return '#f59e0b' // amber-500
  if (severity >= 3) return '#eab308' // yellow-500
  return '#84cc16' // lime-500
}

/**
 * Calculate distance between two normalized coordinates
 */
export function calculateDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}
