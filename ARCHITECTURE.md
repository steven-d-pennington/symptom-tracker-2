# Architecture Guide

This document provides technical architecture details for the Pocket Symptom Tracker application.

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Application Architecture](#application-architecture)
4. [Database Design](#database-design)
5. [Key Subsystems](#key-subsystems)
6. [Data Flow Patterns](#data-flow-patterns)
7. [Security & Privacy](#security--privacy)
8. [Performance Considerations](#performance-considerations)
9. [Testing Strategy](#testing-strategy)
10. [Coding Standards](#coding-standards)
11. [Common Patterns](#common-patterns)
12. [Troubleshooting](#troubleshooting)

---

## Overview

Pocket Symptom Tracker is a privacy-first, offline-capable Progressive Web App (PWA) designed for tracking chronic health conditions. The application runs entirely client-side with no backend server, storing all data locally in IndexedDB.

### Design Principles

1. **Privacy First** - All data stays on the user's device
2. **Offline First** - Full functionality without internet
3. **Local First** - No cloud dependencies
4. **Accessible** - WCAG 2.1 AA compliant
5. **Progressive Enhancement** - Works everywhere, better where supported

---

## Technology Stack

### Core Framework
```
Next.js 15.x (App Router)
├── React 19.x
├── TypeScript 5.x
└── Tailwind CSS 3.x
```

### Database
```
Dexie.js 4.x (IndexedDB wrapper)
└── dexie-react-hooks (React integration)
```

### Key Libraries
| Library | Purpose |
|---------|---------|
| `dexie` | IndexedDB ORM with transactions |
| `react-zoom-pan-pinch` | Body map zoom/pan functionality |
| `jest` | Testing framework |
| `@testing-library/react` | Component testing |
| `fake-indexeddb` | IndexedDB mocking for tests |

### Build Tools
- **Bundler**: Next.js (Webpack/Turbopack)
- **CSS**: PostCSS + Autoprefixer
- **Linting**: ESLint (Next.js config)
- **Type Checking**: TypeScript

---

## Application Architecture

### Directory Structure

```
symptom-tracker-2/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout with providers
│   ├── page.tsx              # Dashboard homepage
│   ├── providers.tsx         # Database & context providers
│   └── [feature]/            # Feature routes
│       ├── page.tsx          # Main page
│       └── [subpage]/page.tsx
│
├── components/               # React components
│   ├── [Feature]/            # Feature-specific components
│   │   ├── ComponentName.tsx
│   │   └── index.tsx         # Re-exports
│   └── ui/                   # Shared UI components
│
├── lib/                      # Core business logic
│   ├── db.ts                 # Database schema & instance
│   ├── initDB.ts             # Database initialization
│   ├── utils.ts              # Utility functions
│   └── [domain]/             # Domain-specific logic
│       ├── featureLogic.ts
│       └── index.ts
│
├── __tests__/                # Test files
│   ├── lib/                  # Unit tests
│   └── integration/          # Integration tests
│
└── docs/                     # Documentation
    ├── README.md             # Project board
    ├── features/             # Feature specs
    └── testing/              # Testing docs
```

### Rendering Strategy

The app uses **client-side rendering** for all interactive features:

```tsx
'use client'  // All interactive pages are client components

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'

export default function Page() {
  // Live query updates UI when database changes
  const data = useLiveQuery(() => db.table.toArray())

  return <Component data={data} />
}
```

### Provider Hierarchy

```tsx
// app/layout.tsx
<html>
  <body>
    <ErrorBoundary>
      <DatabaseProvider>
        <PWAProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </PWAProvider>
      </DatabaseProvider>
    </ErrorBoundary>
  </body>
</html>
```

---

## Database Design

### Schema Overview

The database uses **18 tables** organized into entity definitions and event logs:

```typescript
// Entity Definitions (mutable)
users          // User profile and settings
symptoms       // Symptom definitions
medications    // Medication definitions
triggers       // Trigger definitions
foods          // Food definitions
flares         // Active/resolved flares
photos         // Encrypted photo metadata
dailyEntries   // Daily health reflections
photoComparisons // Before/after comparisons

// Event Logs (append-only)
symptomInstances   // Symptom occurrences
medicationEvents   // Medication taken/skipped
triggerEvents      // Trigger exposures
foodEvents         // Food consumption
flareEvents        // Flare state changes
correlationResults // Cached analysis results
```

### Key Design Patterns

#### 1. GUID-Based References
All entities use GUIDs for cross-references instead of auto-increment IDs:

```typescript
interface Flare {
  id?: number        // Auto-increment (local only)
  guid: string       // UUID for references
  // ...
}

interface FlareEvent {
  flareId: string    // References Flare.guid
  // ...
}
```

#### 2. Append-Only Events
Historical data is never modified:

```typescript
// CORRECT: Add new event
await db.flareEvents.add({
  guid: generateGUID(),
  flareId: flare.guid,
  eventType: 'severity_update',
  severity: newSeverity,
  timestamp: Date.now(),
})

// WRONG: Don't modify historical events
await db.flareEvents.update(eventId, { severity: newSeverity })
```

#### 3. Soft Deletes
Entity definitions use `isActive` flag:

```typescript
// Deactivate instead of delete
await db.symptoms.update(id, { isActive: false })
```

#### 4. Transactions
All multi-table operations use transactions:

```typescript
await db.transaction('rw', [db.flares, db.flareEvents], async () => {
  await db.flares.add(flare)
  await db.flareEvents.add(event)
})
```

### Table Schemas

```typescript
// lib/db.ts
class SymptomTrackerDB extends Dexie {
  users!: Table<User>
  symptoms!: Table<Symptom>
  symptomInstances!: Table<SymptomInstance>
  medications!: Table<Medication>
  medicationEvents!: Table<MedicationEvent>
  triggers!: Table<Trigger>
  triggerEvents!: Table<TriggerEvent>
  foods!: Table<Food>
  foodEvents!: Table<FoodEvent>
  flares!: Table<Flare>
  flareEvents!: Table<FlareEvent>
  dailyEntries!: Table<DailyEntry>
  photos!: Table<Photo>
  photoComparisons!: Table<PhotoComparison>
  correlationResults!: Table<CorrelationResult>

  constructor() {
    super('SymptomTrackerDB')
    this.version(1).stores({
      users: '++id, guid',
      symptoms: '++id, guid, category, isActive',
      symptomInstances: '++id, guid, symptomId, timestamp',
      medications: '++id, guid, isActive',
      medicationEvents: '++id, guid, medicationId, timestamp',
      triggers: '++id, guid, category, isActive',
      triggerEvents: '++id, guid, triggerId, timestamp',
      foods: '++id, guid, category, isActive',
      foodEvents: '++id, guid, foodId, mealId, timestamp',
      flares: '++id, guid, status, bodyRegion, startDate',
      flareEvents: '++id, guid, flareId, timestamp, eventType',
      dailyEntries: '++id, guid, date',
      photos: '++id, guid, flareId, timestamp',
      photoComparisons: '++id, guid, beforePhotoId, afterPhotoId',
      correlationResults: '++id, guid, calculatedAt',
    })
  }
}

export const db = new SymptomTrackerDB()
```

---

## Key Subsystems

### 1. Body Map System

Location: `lib/bodyMap/`, `components/BodyMap/`

The body map provides interactive visualization for flare/symptom location:

```
┌─────────────────────────────────────┐
│  BodyMap.tsx                        │
│  ├── ViewSelector (front/back)      │
│  ├── SVG rendering (bodyMapSVGs.ts) │
│  ├── BodyRegion (93 regions)        │
│  ├── FlareMarker (active flares)    │
│  └── react-zoom-pan-pinch           │
└─────────────────────────────────────┘
```

**Coordinate System**:
- Normalized to 0-1 range
- Origin at top-left
- Stored as `coordinateX`, `coordinateY`

```typescript
// lib/bodyMap/coordinateUtils.ts
export function normalizeCoordinates(
  x: number, y: number,
  width: number, height: number
): { x: number; y: number } {
  return {
    x: Math.max(0, Math.min(1, x / width)),
    y: Math.max(0, Math.min(1, y / height)),
  }
}
```

### 2. Correlation Analysis Engine

Location: `lib/correlationAnalysis.ts`, `lib/analytics/`

Implements Spearman's rank correlation to identify food-symptom relationships:

```
┌──────────────────────────────────────┐
│  Correlation Analysis                │
│  ├── Spearman's rank correlation     │
│  ├── Lag window testing (15m-72h)    │
│  ├── Statistical significance (p<.05)│
│  ├── Synergistic combination detect  │
│  └── Background processing (idle)    │
└──────────────────────────────────────┘
```

**Algorithm Flow**:
```
1. Gather food events and symptom instances
2. For each food-symptom pair:
   a. Test multiple lag windows (15min to 72hr)
   b. Calculate Spearman correlation coefficient
   c. Compute p-value for significance
   d. Store best correlation per pair
3. Identify synergistic combinations
4. Cache results in correlationResults table
```

**Background Processing**:
```typescript
// lib/analytics/backgroundCorrelation.ts
export function scheduleBackgroundAnalysis() {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => runAnalysis(), { timeout: 5000 })
  } else {
    setTimeout(() => runAnalysis(), 1000)
  }
}
```

### 3. Photo Encryption System

Location: `lib/photoEncryption.ts`, `lib/photos/`

All photos are encrypted before storage:

```
┌──────────────────────────────────────┐
│  Photo Encryption Pipeline           │
│  ├── EXIF metadata stripping         │
│  ├── Thumbnail generation            │
│  ├── AES-256-GCM encryption          │
│  ├── Unique key per photo            │
│  └── Key stored with photo metadata  │
└──────────────────────────────────────┘
```

**Encryption Flow**:
```typescript
// Encrypt
const key = await crypto.subtle.generateKey(
  { name: 'AES-GCM', length: 256 },
  true,
  ['encrypt', 'decrypt']
)
const iv = crypto.getRandomValues(new Uint8Array(12))
const encrypted = await crypto.subtle.encrypt(
  { name: 'AES-GCM', iv },
  key,
  imageData
)

// Decrypt
const decrypted = await crypto.subtle.decrypt(
  { name: 'AES-GCM', iv },
  key,
  encrypted
)
```

### 4. Flare Lifecycle Management

Location: `lib/flares/`

Flares follow a state machine:

```
┌─────────┐     ┌──────────┐     ┌───────────┐     ┌──────────┐
│ Created │────▶│  Active  │────▶│ Improving │────▶│ Resolved │
└─────────┘     └──────────┘     └───────────┘     └──────────┘
                     │                 ▲
                     ▼                 │
               ┌───────────┐           │
               │ Worsening │───────────┘
               └───────────┘
```

**Event Types**:
- `created` - Initial flare creation
- `severity_update` - Severity change
- `intervention` - Treatment applied (ice, heat, medication, rest, drainage)
- `resolved` - Flare ended

### 5. Medication Reminder System

Location: `lib/medications/`

```
┌──────────────────────────────────────┐
│  Medication Reminders                │
│  ├── Notification API integration    │
│  ├── Schedule-based reminders        │
│  ├── Adherence tracking              │
│  └── Timing warnings (early/late)    │
└──────────────────────────────────────┘
```

### 6. Data Export System

Location: `lib/export/`

Three export formats:

| Format | Use Case | File |
|--------|----------|------|
| JSON | Full backup/restore | `exportJSON.ts` |
| CSV | Spreadsheet analysis | `exportCSV.ts` |
| PDF | Healthcare provider sharing | `exportPDF.ts` |

**Import System** (`importData.ts`):
- Validates backup file structure
- Supports merge or replace modes
- Handles data conflicts

---

## Data Flow Patterns

### 1. Live Queries

Data automatically updates when the database changes:

```tsx
import { useLiveQuery } from 'dexie-react-hooks'

function FlaresList() {
  const flares = useLiveQuery(() =>
    db.flares
      .where('status')
      .notEqual('resolved')
      .toArray()
  )

  return <>{flares?.map(f => <FlareCard key={f.guid} flare={f} />)}</>
}
```

### 2. Optimistic Updates

For responsive UI during database writes:

```typescript
// lib/optimistic/index.ts
export async function executeOptimistic<T>(
  optimisticState: T,
  setOptimistic: (state: T) => void,
  asyncOperation: () => Promise<T>,
  rollback: T
): Promise<T> {
  setOptimistic(optimisticState)
  try {
    return await asyncOperation()
  } catch (error) {
    setOptimistic(rollback)
    throw error
  }
}
```

### 3. Form Submission Pattern

```tsx
async function handleSubmit(data: FormData) {
  try {
    // Validate
    if (!validateData(data)) throw new Error('Invalid data')

    // Execute in transaction
    await db.transaction('rw', [db.table1, db.table2], async () => {
      await db.table1.add(entity)
      await db.table2.add(event)
    })

    // Navigate or show success
    router.push('/success')
  } catch (error) {
    // Handle error
    showError(error.message)
  }
}
```

---

## Security & Privacy

### Data Protection

1. **Local Storage Only** - No data leaves the device
2. **No Analytics** - No tracking or telemetry
3. **No External APIs** - No network requests
4. **Encrypted Photos** - AES-256-GCM encryption
5. **EXIF Stripping** - Location metadata removed

### Data Deletion

```typescript
// lib/settings/deleteAllData.ts
export async function deleteAllData(): Promise<void> {
  await db.delete()
  await db.open()
  // Re-initialize with defaults
  await initializeDatabase()
}
```

### Sensitive Data Handling

```typescript
// Never log sensitive data
console.log('User logged symptom') // OK
console.log(`Logged: ${symptomData}`) // NOT OK

// Sanitize before display
function displaySymptom(s: Symptom) {
  return sanitizeHTML(s.name)
}
```

---

## Performance Considerations

### Database Indexing

Key indexes for common queries:

```typescript
// Optimized indexes
flares: '++id, guid, status, bodyRegion, startDate'
symptomInstances: '++id, guid, symptomId, timestamp'
foodEvents: '++id, guid, foodId, mealId, timestamp'
```

### Lazy Loading

Heavy components are loaded on demand:

```typescript
const PhotoGallery = dynamic(() => import('@/components/Photos/PhotoGallery'), {
  loading: () => <Skeleton />,
  ssr: false
})
```

### Background Processing

CPU-intensive tasks use idle callbacks:

```typescript
// Schedule during idle time
requestIdleCallback(() => {
  calculateCorrelations()
}, { timeout: 5000 })
```

### Skeleton Screens

Loading states prevent layout shift:

```typescript
// components/Loading/Skeleton.tsx
export function CardSkeleton() {
  return (
    <div className="animate-pulse bg-gray-200 rounded-lg h-32" />
  )
}
```

---

## Testing Strategy

### Test Structure

```
__tests__/
├── lib/
│   ├── analytics/
│   │   └── correlation.test.ts    # Unit tests
│   └── photos/
│       └── encryption.test.ts     # Unit tests
└── integration/
    └── flareLifecycle.test.ts     # Integration tests
```

### Running Tests

```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

### Test Setup

```typescript
// jest.setup.ts
import 'fake-indexeddb/auto'  // Mock IndexedDB
import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock crypto for encryption tests
Object.defineProperty(globalThis, 'crypto', {
  value: {
    subtle: { /* mock methods */ },
    getRandomValues: (arr) => { /* fill with random */ },
    randomUUID: () => 'mock-uuid',
  }
})
```

### Writing Tests

```typescript
describe('Feature', () => {
  beforeEach(async () => {
    await db.table.clear()  // Clean state
  })

  it('should do something', async () => {
    // Arrange
    const input = { /* ... */ }

    // Act
    const result = await featureFunction(input)

    // Assert
    expect(result).toBeDefined()
    expect(result.property).toBe(expected)
  })
})
```

---

## Coding Standards

### TypeScript

- Strict mode enabled
- Explicit return types for functions
- Interface over type for objects
- Avoid `any` - use `unknown` if needed

```typescript
// Good
interface FlareData {
  severity: number
  bodyRegion: string
}

async function createFlare(data: FlareData): Promise<Flare> {
  // ...
}

// Avoid
const createFlare = async (data: any) => {
  // ...
}
```

### React Components

```typescript
// Component structure
'use client'

import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'

interface Props {
  flareId: string
  onClose: () => void
}

export function FlareModal({ flareId, onClose }: Props) {
  const [isLoading, setIsLoading] = useState(false)

  const flare = useLiveQuery(() =>
    db.flares.where('guid').equals(flareId).first()
  )

  if (!flare) return <Skeleton />

  return (
    <div>
      {/* Component content */}
    </div>
  )
}
```

### Database Operations

```typescript
// Always use transactions for multi-table operations
await db.transaction('rw', [db.flares, db.flareEvents], async () => {
  // All operations atomic
})

// Use proper error handling
try {
  await db.table.add(data)
} catch (error) {
  if (error.name === 'ConstraintError') {
    // Handle duplicate
  }
  throw error
}
```

### Validation

```typescript
// Validate at boundaries
export function validateSeverity(value: number): void {
  if (value < 1 || value > 10 || !Number.isInteger(value)) {
    throw new Error('Severity must be an integer between 1 and 10')
  }
}

export function validateCoordinates(x: number, y: number): void {
  if (x < 0 || x > 1 || y < 0 || y > 1) {
    throw new Error('Coordinates must be between 0 and 1')
  }
}

export function validateTimestamp(ts: number): void {
  if (ts > Date.now()) {
    throw new Error('Timestamp cannot be in the future')
  }
}
```

---

## Common Patterns

### Creating Entities

```typescript
// lib/flares/createFlare.ts
export async function createFlare(input: CreateFlareInput): Promise<Flare> {
  // 1. Validate
  validateSeverity(input.initialSeverity)
  validateCoordinates(input.coordinateX, input.coordinateY)

  // 2. Generate IDs and timestamps
  const now = Date.now()
  const guid = generateGUID()

  // 3. Create entity
  const flare: Flare = {
    guid,
    status: 'active',
    initialSeverity: input.initialSeverity,
    currentSeverity: input.initialSeverity,
    bodyRegion: input.bodyRegion,
    coordinateX: input.coordinateX,
    coordinateY: input.coordinateY,
    startDate: now,
    createdAt: now,
    updatedAt: now,
  }

  // 4. Transaction with event
  await db.transaction('rw', [db.flares, db.flareEvents], async () => {
    await db.flares.add(flare)
    await db.flareEvents.add({
      guid: generateGUID(),
      flareId: guid,
      eventType: 'created',
      severity: input.initialSeverity,
      timestamp: now,
      createdAt: now,
    })
  })

  return flare
}
```

### Modal Components

```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold">{title}</h2>
        {children}
      </div>
    </div>
  )
}
```

### Error Handling

```typescript
// Wrap page content in error boundary
export default function Page() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <PageContent />
    </ErrorBoundary>
  )
}

// Handle async errors
async function handleAction() {
  try {
    await riskyOperation()
  } catch (error) {
    console.error('Operation failed:', error)
    showToast({ type: 'error', message: 'Something went wrong' })
  }
}
```

---

## Troubleshooting

### Common Issues

#### IndexedDB Not Working

```javascript
// Check if IndexedDB is available
if (!('indexedDB' in window)) {
  console.error('IndexedDB not supported')
}

// Check for private browsing mode
// Safari in private mode has IndexedDB but with restrictions
```

#### Service Worker Not Registering

```javascript
// Must be served over HTTPS (or localhost)
// Check console for registration errors
navigator.serviceWorker.register('/sw.js')
  .then(reg => console.log('SW registered'))
  .catch(err => console.error('SW failed:', err))
```

#### Crypto API Not Available

```javascript
// Requires secure context (HTTPS or localhost)
if (!window.crypto?.subtle) {
  console.error('Crypto API not available')
}
```

### Debug Commands

```javascript
// Console commands for debugging

// Check database contents
indexedDB.databases().then(console.log)

// Get all flares
db.flares.toArray().then(console.log)

// Clear specific table
db.flares.clear()

// Delete database (careful!)
db.delete()
```

### Performance Debugging

```javascript
// Measure database query time
console.time('query')
await db.symptomInstances.where('timestamp').above(Date.now() - 86400000).toArray()
console.timeEnd('query')

// Check IndexedDB storage usage
navigator.storage.estimate().then(console.log)
```

---

## Deployment Checklist

- [ ] Run `npm run build` successfully
- [ ] All tests pass (`npm test`)
- [ ] Service worker caches correctly
- [ ] PWA manifest configured
- [ ] HTTPS enabled (required for PWA)
- [ ] Tested on target browsers
- [ ] Tested offline functionality
- [ ] Tested on mobile devices

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Dexie.js Documentation](https://dexie.org/docs/)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
