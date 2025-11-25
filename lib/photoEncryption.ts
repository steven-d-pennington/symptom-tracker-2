/**
 * Photo Encryption Service
 * Uses AES-256-GCM encryption via Web Crypto API
 * Each photo has a unique encryption key
 * EXIF metadata is stripped automatically
 */

export interface EncryptionResult {
  encryptedData: ArrayBuffer
  encryptionKey: string
  iv: string
}

export interface PhotoMetadata {
  width: number
  height: number
  mimeType: string
  sizeBytes: number
}

/**
 * Generate a random encryption key
 */
async function generateEncryptionKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  )
}

/**
 * Generate a random initialization vector
 */
function generateIV(): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(12))
}

/**
 * Export a CryptoKey to base64 string
 */
async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('raw', key)
  return arrayBufferToBase64(exported)
}

/**
 * Import a base64 string to CryptoKey
 */
async function importKey(keyStr: string): Promise<CryptoKey> {
  const keyData = base64ToArrayBuffer(keyStr)
  return await window.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt']
  )
}

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Convert base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

/**
 * Strip EXIF metadata from image file
 */
async function stripEXIF(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height

      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      // Draw image to canvas (this strips EXIF data)
      ctx.drawImage(img, 0, 0)

      // Convert back to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Could not create blob from canvas'))
          }
        },
        file.type,
        0.95
      )
    }

    img.onerror = () => {
      reject(new Error('Could not load image'))
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Get photo metadata
 */
async function getPhotoMetadata(file: File): Promise<PhotoMetadata> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        mimeType: file.type,
        sizeBytes: file.size,
      })
      URL.revokeObjectURL(img.src)
    }

    img.onerror = () => {
      reject(new Error('Could not load image for metadata extraction'))
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Create thumbnail from image file
 */
async function createThumbnail(
  file: File,
  maxSize: number = 200
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.onload = () => {
      // Calculate thumbnail dimensions
      let width = img.width
      let height = img.height

      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }
      }

      canvas.width = width
      canvas.height = height

      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Could not create thumbnail blob'))
          }
        },
        'image/jpeg',
        0.8
      )
    }

    img.onerror = () => {
      reject(new Error('Could not load image for thumbnail'))
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Encrypt photo file
 */
export async function encryptPhoto(file: File): Promise<EncryptionResult> {
  try {
    // Strip EXIF data
    const strippedBlob = await stripEXIF(file)
    const arrayBuffer = await strippedBlob.arrayBuffer()

    // Generate encryption key and IV
    const key = await generateEncryptionKey()
    const iv = generateIV()

    // Encrypt the data
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource,
      },
      key,
      arrayBuffer
    )

    // Export key to string
    const keyStr = await exportKey(key)
    const ivStr = arrayBufferToBase64(iv.buffer as ArrayBuffer)

    return {
      encryptedData,
      encryptionKey: keyStr,
      iv: ivStr,
    }
  } catch (error) {
    console.error('Error encrypting photo:', error)
    throw new Error('Failed to encrypt photo')
  }
}

/**
 * Decrypt photo data
 */
export async function decryptPhoto(
  encryptedData: ArrayBuffer,
  keyStr: string,
  ivStr: string
): Promise<Blob> {
  try {
    // Import key and IV
    const key = await importKey(keyStr)
    const iv = new Uint8Array(base64ToArrayBuffer(ivStr))

    // Decrypt the data
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource,
      },
      key,
      encryptedData
    )

    // Convert to blob
    return new Blob([decryptedData], { type: 'image/jpeg' })
  } catch (error) {
    console.error('Error decrypting photo:', error)
    throw new Error('Failed to decrypt photo')
  }
}

/**
 * Encrypt thumbnail
 */
export async function encryptThumbnail(file: File): Promise<EncryptionResult> {
  try {
    const thumbnailBlob = await createThumbnail(file)
    const arrayBuffer = await thumbnailBlob.arrayBuffer()

    // Generate encryption key and IV
    const key = await generateEncryptionKey()
    const iv = generateIV()

    // Encrypt the data
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource,
      },
      key,
      arrayBuffer
    )

    // Export key to string
    const keyStr = await exportKey(key)
    const ivStr = arrayBufferToBase64(iv.buffer as ArrayBuffer)

    return {
      encryptedData,
      encryptionKey: keyStr,
      iv: ivStr,
    }
  } catch (error) {
    console.error('Error encrypting thumbnail:', error)
    throw new Error('Failed to encrypt thumbnail')
  }
}

/**
 * Get photo metadata (without encryption)
 */
export { getPhotoMetadata }
