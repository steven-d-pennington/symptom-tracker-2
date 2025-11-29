# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pocket Symptom Tracker is a privacy-first, offline-capable PWA for tracking chronic health conditions. All data is stored locally in IndexedDB with no backend server. The app includes specialized Hidradenitis Suppurativa (HS) tracking with IHS4 scoring and Hurley staging.

## Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm run lint         # Run ESLint
npm test             # Run all tests (70 tests)
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15 (App Router) with React 19
- **Database**: IndexedDB via Dexie.js (23 tables across 2 schema versions)
- **Styling**: Tailwind CSS
- **Encryption**: Web Crypto API (AES-256-GCM for photos)
- **Testing**: Jest + React Testing Library + fake-indexeddb

### Directory Structure
```
app/                    # Next.js pages (client-side rendering)
components/             # React components organized by feature
lib/                    # Core business logic
  db.ts                 # Database schema (Dexie.js)
  initDB.ts             # Database initialization
  hs/                   # Hidradenitis Suppurativa tracking
  export/               # JSON/CSV/PDF export and import
  analytics/            # Correlation analysis engine
  bodyMap/              # Body map SVG and coordinates
  presets/              # Default symptoms, triggers, foods, body regions
__tests__/              # Jest test suite
docs/                   # Feature specifications (kanban-style)
  features/             # Individual feature specs
  features/completed/   # Completed feature documentation
```

### Database Patterns
- **GUIDs for references**: All entities use `guid` field for cross-table references (not auto-increment `id`)
- **Append-only events**: Historical data in `*Events` tables is never modified
- **Soft deletes**: Use `isActive: false` instead of deleting entity definitions
- **Transactions**: Multi-table operations must use `db.transaction('rw', [tables], async () => {})`

### Key Subsystems
1. **Body Map**: Interactive SVG with 58+ regions, normalized coordinates (0-1 range)
2. **Correlation Analysis**: Spearman's rank correlation with lag windows (15min-72hr)
3. **Photo Encryption**: Per-photo AES-256-GCM keys with EXIF stripping
4. **HS Tracking**: IHS4 scoring (nodule×1, abscess×2, tunnel×4), Hurley staging (I-III)
5. **Flare Lifecycle**: States: created → active → improving/worsening → resolved

### Data Flow
- Use `useLiveQuery` from `dexie-react-hooks` for reactive database queries
- All interactive pages are client components (`'use client'`)
- Optimistic updates via `lib/optimistic/index.ts`

## Feature Development

Features are documented in `docs/features/` using a template format. Each feature spec includes:
- Requirements, technical approach, acceptance criteria
- Dependencies on other features
- Testing checklist

Project board at `docs/README.md` tracks feature status. Move completed feature docs to `docs/features/completed/`.

## Validation Rules

- Severity values: integers 1-10 only
- Coordinates: normalized 0-1 range
- Timestamps: must be past or present (no future)
- Touch targets: minimum 44×44px for accessibility

## Special Users

Users with first name "Steven" access Super Admin panel in Settings for test data generation and database inspection.
