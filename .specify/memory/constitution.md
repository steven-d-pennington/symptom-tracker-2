<!--
## Sync Impact Report

**Version change**: 0.0.0 → 1.0.0 (MAJOR: Initial constitution creation)

**Modified principles**: N/A (initial creation)

**Added sections**:
- Core Principles (8 principles)
  - I. Privacy First
  - II. Offline First
  - III. Accessibility Compliance
  - IV. Type Safety
  - V. Data Integrity
  - VI. Testing Standards
  - VII. Performance Requirements
  - VIII. User Experience Consistency
- Quality Gates
- Development Standards
- Governance

**Removed sections**: N/A

**Templates requiring updates**:
- ✅ `.specify/templates/plan-template.md` - Compatible (Constitution Check section exists)
- ✅ `.specify/templates/spec-template.md` - Compatible (Requirements section aligns)
- ✅ `.specify/templates/tasks-template.md` - Compatible (Testing phases align with Principle VI)

**Follow-up TODOs**: None
-->

# Pocket Symptom Tracker Constitution

## Core Principles

### I. Privacy First

All user health data MUST remain on the user's device. The application MUST NOT make external API calls, collect telemetry, or transmit data to cloud services. Photo storage MUST use AES-256-GCM encryption with unique keys per photo. EXIF metadata MUST be stripped from all images before storage.

**Rationale**: Users are tracking sensitive health information. Trust requires absolute data sovereignty. No exceptions.

### II. Offline First

The application MUST function fully without an internet connection. All features MUST operate using local IndexedDB storage via Dexie.js. Service workers MUST cache all application assets for offline access. No feature may degrade when the network is unavailable.

**Rationale**: Health tracking must be reliable regardless of connectivity. Users may need to log symptoms in remote areas or during network outages.

### III. Accessibility Compliance

All features MUST meet WCAG 2.1 AA standards. Interactive elements MUST have minimum 44x44px touch targets. Keyboard navigation MUST be fully supported with visible focus indicators. Screen reader support via ARIA labels is mandatory. Color contrast MUST meet AA standards (4.5:1 for normal text, 3:1 for large text). High contrast mode MUST be available.

**Rationale**: Chronic illness affects people of all abilities. The application must be usable by everyone.

### IV. Type Safety

TypeScript strict mode MUST be enabled. All functions MUST have explicit return types. Interface definitions MUST be used for object types (prefer `interface` over `type`). The `any` type is prohibited; use `unknown` when type is truly dynamic. All component props MUST be explicitly typed.

**Rationale**: Type safety prevents runtime errors and improves maintainability in a health-critical application.

### V. Data Integrity

All entities MUST use GUIDs for cross-table references (not auto-increment IDs). Historical data in `*Events` tables MUST be immutable (append-only pattern). Multi-table operations MUST use database transactions via `db.transaction('rw', [...], async () => {})`. Entity deletion MUST use soft deletes (`isActive: false`) rather than hard deletes.

**Rationale**: Health data is historical and irreplaceable. Data integrity patterns prevent corruption and support audit trails.

### VI. Testing Standards

Unit tests MUST cover critical algorithms (correlation analysis, encryption, validation). Integration tests MUST verify multi-step workflows (flare lifecycle, data export/import). Tests MUST use `fake-indexeddb` for database mocking. Code coverage MUST be maintained at 80% or higher for core library code. All tests MUST pass before merging to main branch.

**Test Structure**:
- Unit tests: `__tests__/lib/` for algorithm and utility testing
- Integration tests: `__tests__/integration/` for workflow testing
- Component tests: Co-located with components using React Testing Library

**Rationale**: Users depend on accurate health tracking. Testing prevents regressions that could affect health data accuracy.

### VII. Performance Requirements

First Contentful Paint MUST be under 1.5 seconds. Time to Interactive MUST be under 3 seconds. Lighthouse performance score MUST be 90 or higher. Database queries MUST use proper indexes for common access patterns. CPU-intensive operations (correlation analysis) MUST use `requestIdleCallback` or polyfill. Heavy components MUST be lazy loaded. Skeleton screens MUST prevent layout shift during loading.

**Rationale**: Responsive performance is essential for user engagement and accessibility.

### VIII. User Experience Consistency

Form validation MUST use consistent patterns across all inputs. Error messages MUST be user-friendly and actionable. Loading states MUST use skeleton screens (never blank screens). Modal dialogs MUST trap focus and support Escape key dismissal. Navigation MUST be predictable with clear back/cancel paths. Severity values MUST be integers 1-10. Coordinates MUST be normalized to 0-1 range. Timestamps MUST be past or present (never future).

**Rationale**: Consistency reduces cognitive load for users managing chronic conditions.

## Quality Gates

### Pre-Implementation Gate

Before starting any feature implementation:

1. **Requirements Clarity**: All functional requirements MUST be explicit (no "NEEDS CLARIFICATION" remaining)
2. **Dependencies**: All required dependencies MUST be completed
3. **Technical Approach**: Database operations, file structure, and key algorithms MUST be documented
4. **Acceptance Criteria**: Measurable criteria MUST be defined

### Pre-Merge Gate

Before merging any feature branch:

1. **Tests Pass**: `npm test` MUST complete with no failures
2. **Build Succeeds**: `npm run build` MUST complete without errors
3. **Lint Clean**: `npm run lint` MUST report no errors
4. **Offline Verified**: Feature MUST work in offline mode
5. **Mobile Tested**: Feature MUST be responsive on mobile viewports (320px-414px)
6. **Accessibility Checked**: Feature MUST pass keyboard navigation and screen reader testing

## Development Standards

### Database Operations

```typescript
// REQUIRED: Use transactions for multi-table operations
await db.transaction('rw', [db.flares, db.flareEvents], async () => {
  await db.flares.add(flare)
  await db.flareEvents.add(event)
})

// REQUIRED: Append-only for event tables
await db.flareEvents.add(newEvent) // Correct
await db.flareEvents.update(id, {...}) // PROHIBITED

// REQUIRED: Soft deletes for entities
await db.symptoms.update(id, { isActive: false }) // Correct
await db.symptoms.delete(id) // PROHIBITED
```

### Component Patterns

```typescript
// REQUIRED: Client components with 'use client' directive
'use client'

// REQUIRED: Explicit props interfaces
interface Props {
  flareId: string
  onClose: () => void
}

// REQUIRED: Live queries for reactive data
const flares = useLiveQuery(() => db.flares.toArray())
```

### Validation Rules

All validation MUST be performed at data boundaries:

- Severity: Integer 1-10 only
- Coordinates: Float 0-1 range (normalized)
- Timestamps: Must be ≤ Date.now()
- Required fields: Enforce at form submission
- GUIDs: Use `crypto.randomUUID()` for generation

## Governance

### Amendment Process

1. Propose change with rationale in pull request
2. Document impact on existing features
3. Update affected templates and documentation
4. Increment version according to semantic versioning:
   - MAJOR: Principle removal or redefinition
   - MINOR: New principle or section added
   - PATCH: Clarifications, wording fixes

### Compliance Review

- All feature implementations MUST reference applicable constitution principles
- Code reviews MUST verify compliance with relevant principles
- Violations MUST be justified and documented in pull request

### Guidance Files

- Runtime development guidance: `CLAUDE.md`
- Architecture documentation: `ARCHITECTURE.md`
- Testing procedures: `docs/testing/CROSS_BROWSER_TESTING.md`
- Feature specifications: `docs/features/`

**Version**: 1.0.0 | **Ratified**: 2025-12-07 | **Last Amended**: 2025-12-07
