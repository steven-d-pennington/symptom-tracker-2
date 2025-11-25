import { db, PhotoAttachment } from '../db'
import { generateGUID, getCurrentTimestamp } from '../utils'
import {
  encryptPhoto,
  encryptThumbnail,
  decryptPhoto,
  getPhotoMetadata,
} from '../photoEncryption'

export interface UploadPhotoInput {
  file: File
  bodyRegion?: string
  symptomId?: string
  dailyEntryId?: string
  tags?: string[]
  notes?: string
}

export interface PhotoWithUrl extends PhotoAttachment {
  thumbnailUrl?: string
  fullImageUrl?: string
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/**
 * Validate file before upload
 */
function validateFile(file: File): void {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Please upload JPEG, PNG, or WebP images.')
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large. Maximum size is 10MB.')
  }
}

/**
 * Upload and encrypt a photo
 */
export async function uploadPhoto(input: UploadPhotoInput): Promise<PhotoAttachment> {
  validateFile(input.file)

  const now = getCurrentTimestamp()

  // Get metadata
  const metadata = await getPhotoMetadata(input.file)

  // Encrypt the photo
  const encryptedPhoto = await encryptPhoto(input.file)

  // Encrypt the thumbnail
  const encryptedThumbnail = await encryptThumbnail(input.file)

  const photo: PhotoAttachment = {
    guid: generateGUID(),
    dailyEntryId: input.dailyEntryId,
    symptomId: input.symptomId,
    bodyRegion: input.bodyRegion,
    fileName: `photo_${now}.${input.file.type.split('/')[1]}`,
    originalFileName: input.file.name,
    mimeType: input.file.type,
    sizeBytes: metadata.sizeBytes,
    width: metadata.width,
    height: metadata.height,
    encryptedData: encryptedPhoto.encryptedData,
    thumbnailData: encryptedThumbnail.encryptedData,
    encryptionIV: encryptedPhoto.iv,
    thumbnailIV: encryptedThumbnail.iv,
    encryptionKey: encryptedPhoto.encryptionKey,
    captureTimestamp: now,
    tags: input.tags || [],
    notes: input.notes,
    createdAt: now,
  }

  await db.photoAttachments.add(photo)
  return photo
}

/**
 * Get all photos
 */
export async function getAllPhotos(): Promise<PhotoAttachment[]> {
  return await db.photoAttachments.orderBy('captureTimestamp').reverse().toArray()
}

/**
 * Get photos with filters
 */
export async function getPhotos(options?: {
  bodyRegion?: string
  symptomId?: string
  dailyEntryId?: string
  tags?: string[]
  startDate?: number
  endDate?: number
  limit?: number
}): Promise<PhotoAttachment[]> {
  let photos = await db.photoAttachments.toArray()

  if (options?.bodyRegion) {
    photos = photos.filter((p) => p.bodyRegion === options.bodyRegion)
  }

  if (options?.symptomId) {
    photos = photos.filter((p) => p.symptomId === options.symptomId)
  }

  if (options?.dailyEntryId) {
    photos = photos.filter((p) => p.dailyEntryId === options.dailyEntryId)
  }

  if (options?.tags && options.tags.length > 0) {
    photos = photos.filter((p) => options.tags!.some((tag) => p.tags.includes(tag)))
  }

  if (options?.startDate) {
    photos = photos.filter((p) => p.captureTimestamp >= options.startDate!)
  }

  if (options?.endDate) {
    photos = photos.filter((p) => p.captureTimestamp <= options.endDate!)
  }

  // Sort by capture timestamp descending
  photos.sort((a, b) => b.captureTimestamp - a.captureTimestamp)

  if (options?.limit) {
    photos = photos.slice(0, options.limit)
  }

  return photos
}

/**
 * Get a photo by ID
 */
export async function getPhotoById(guid: string): Promise<PhotoAttachment | undefined> {
  return await db.photoAttachments.where('guid').equals(guid).first()
}

/**
 * Delete a photo
 */
export async function deletePhoto(guid: string): Promise<void> {
  await db.photoAttachments.where('guid').equals(guid).delete()

  // Also delete any comparisons that include this photo
  const comparisons = await db.photoComparisons
    .filter((c) => c.beforePhotoId === guid || c.afterPhotoId === guid)
    .toArray()

  for (const comparison of comparisons) {
    await db.photoComparisons.where('guid').equals(comparison.guid).delete()
  }
}

/**
 * Update photo metadata
 */
export async function updatePhoto(
  guid: string,
  updates: {
    tags?: string[]
    notes?: string
    bodyRegion?: string
    symptomId?: string
    annotations?: string
  }
): Promise<PhotoAttachment> {
  const photo = await getPhotoById(guid)
  if (!photo) {
    throw new Error('Photo not found')
  }

  await db.photoAttachments.where('guid').equals(guid).modify({
    tags: updates.tags ?? photo.tags,
    notes: updates.notes ?? photo.notes,
    bodyRegion: updates.bodyRegion ?? photo.bodyRegion,
    symptomId: updates.symptomId ?? photo.symptomId,
    annotations: updates.annotations ?? photo.annotations,
  })

  return (await getPhotoById(guid))!
}

/**
 * Decrypt thumbnail and return as blob URL
 */
export async function getThumbnailUrl(photo: PhotoAttachment): Promise<string | null> {
  if (!photo.thumbnailData || !photo.thumbnailIV) {
    return null
  }

  try {
    const blob = await decryptPhoto(
      photo.thumbnailData,
      photo.encryptionKey,
      photo.thumbnailIV
    )
    return URL.createObjectURL(blob)
  } catch (error) {
    console.error('Error decrypting thumbnail:', error)
    return null
  }
}

/**
 * Decrypt full image and return as blob URL
 */
export async function getFullImageUrl(photo: PhotoAttachment): Promise<string | null> {
  try {
    const blob = await decryptPhoto(
      photo.encryptedData,
      photo.encryptionKey,
      photo.encryptionIV
    )
    return URL.createObjectURL(blob)
  } catch (error) {
    console.error('Error decrypting photo:', error)
    return null
  }
}

/**
 * Get photo with decrypted URLs
 */
export async function getPhotoWithUrls(photo: PhotoAttachment): Promise<PhotoWithUrl> {
  const thumbnailUrl = await getThumbnailUrl(photo)
  const fullImageUrl = await getFullImageUrl(photo)

  return {
    ...photo,
    thumbnailUrl: thumbnailUrl || undefined,
    fullImageUrl: fullImageUrl || undefined,
  }
}

/**
 * Get all unique tags from photos
 */
export async function getAllPhotoTags(): Promise<string[]> {
  const photos = await getAllPhotos()
  const tagSet = new Set<string>()

  photos.forEach((photo) => {
    photo.tags.forEach((tag) => tagSet.add(tag))
  })

  return Array.from(tagSet).sort()
}

/**
 * Get photos grouped by body region
 */
export async function getPhotosByBodyRegion(): Promise<Record<string, PhotoAttachment[]>> {
  const photos = await getAllPhotos()

  return photos.reduce(
    (acc, photo) => {
      const region = photo.bodyRegion || 'unassigned'
      if (!acc[region]) {
        acc[region] = []
      }
      acc[region].push(photo)
      return acc
    },
    {} as Record<string, PhotoAttachment[]>
  )
}
