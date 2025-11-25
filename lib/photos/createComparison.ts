import { db, PhotoComparison, PhotoAttachment } from '../db'
import { generateGUID, getCurrentTimestamp } from '../utils'

export interface CreateComparisonInput {
  beforePhotoId: string
  afterPhotoId: string
  title: string
  notes?: string
}

/**
 * Create a new photo comparison
 */
export async function createComparison(input: CreateComparisonInput): Promise<PhotoComparison> {
  // Validate photos exist
  const beforePhoto = await db.photoAttachments.where('guid').equals(input.beforePhotoId).first()
  if (!beforePhoto) {
    throw new Error('Before photo not found')
  }

  const afterPhoto = await db.photoAttachments.where('guid').equals(input.afterPhotoId).first()
  if (!afterPhoto) {
    throw new Error('After photo not found')
  }

  if (!input.title.trim()) {
    throw new Error('Title is required')
  }

  const comparison: PhotoComparison = {
    guid: generateGUID(),
    beforePhotoId: input.beforePhotoId,
    afterPhotoId: input.afterPhotoId,
    title: input.title.trim(),
    notes: input.notes?.trim(),
    createdAt: getCurrentTimestamp(),
  }

  await db.photoComparisons.add(comparison)
  return comparison
}

/**
 * Get all comparisons
 */
export async function getAllComparisons(): Promise<PhotoComparison[]> {
  return await db.photoComparisons.orderBy('createdAt').reverse().toArray()
}

/**
 * Get a comparison by ID
 */
export async function getComparisonById(guid: string): Promise<PhotoComparison | undefined> {
  return await db.photoComparisons.where('guid').equals(guid).first()
}

/**
 * Get comparison with photos
 */
export async function getComparisonWithPhotos(guid: string): Promise<{
  comparison: PhotoComparison
  beforePhoto: PhotoAttachment
  afterPhoto: PhotoAttachment
} | null> {
  const comparison = await getComparisonById(guid)
  if (!comparison) return null

  const beforePhoto = await db.photoAttachments.where('guid').equals(comparison.beforePhotoId).first()
  const afterPhoto = await db.photoAttachments.where('guid').equals(comparison.afterPhotoId).first()

  if (!beforePhoto || !afterPhoto) return null

  return { comparison, beforePhoto, afterPhoto }
}

/**
 * Update a comparison
 */
export async function updateComparison(
  guid: string,
  updates: { title?: string; notes?: string }
): Promise<PhotoComparison> {
  const comparison = await getComparisonById(guid)
  if (!comparison) {
    throw new Error('Comparison not found')
  }

  await db.photoComparisons.where('guid').equals(guid).modify({
    title: updates.title?.trim() ?? comparison.title,
    notes: updates.notes?.trim() ?? comparison.notes,
  })

  return (await getComparisonById(guid))!
}

/**
 * Delete a comparison
 */
export async function deleteComparison(guid: string): Promise<void> {
  await db.photoComparisons.where('guid').equals(guid).delete()
}

/**
 * Get comparisons for a specific photo
 */
export async function getComparisonsForPhoto(photoGuid: string): Promise<PhotoComparison[]> {
  return await db.photoComparisons
    .filter((c) => c.beforePhotoId === photoGuid || c.afterPhotoId === photoGuid)
    .toArray()
}
