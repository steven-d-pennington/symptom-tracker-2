import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Polyfill structuredClone for fake-indexeddb (Node 16 compatibility)
if (typeof structuredClone === 'undefined') {
  global.structuredClone = (obj: unknown) => JSON.parse(JSON.stringify(obj))
}

// Mock IndexedDB for Dexie
import 'fake-indexeddb/auto'

// Add TextEncoder/TextDecoder to global scope
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as typeof global.TextDecoder

// Mock crypto for encryption tests
Object.defineProperty(globalThis, 'crypto', {
  value: {
    subtle: {
      generateKey: jest.fn().mockResolvedValue({
        type: 'secret',
      }),
      encrypt: jest.fn().mockImplementation(async (algorithm, key, data) => {
        // Simple mock encryption - just return the data as ArrayBuffer
        return data
      }),
      decrypt: jest.fn().mockImplementation(async (algorithm, key, data) => {
        // Simple mock decryption - just return the data
        return data
      }),
      exportKey: jest.fn().mockResolvedValue(new ArrayBuffer(32)),
      importKey: jest.fn().mockResolvedValue({
        type: 'secret',
      }),
      digest: jest.fn().mockImplementation(async (algorithm, data) => {
        // Return a mock hash (32 bytes for SHA-256)
        return new ArrayBuffer(32)
      }),
    },
    getRandomValues: jest.fn().mockImplementation((array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256)
      }
      return array
    }),
    randomUUID: jest.fn().mockImplementation(() => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.floor(Math.random() * 16)
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
    }),
  },
})

// Mock requestIdleCallback
global.requestIdleCallback = jest.fn().mockImplementation((cb) => {
  return setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 50 }), 0)
})

global.cancelIdleCallback = jest.fn().mockImplementation((id) => {
  clearTimeout(id)
})

// Suppress console errors in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
