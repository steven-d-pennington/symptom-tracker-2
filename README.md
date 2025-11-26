# Pocket Symptom Tracker

A privacy-first, offline-capable Progressive Web App (PWA) for tracking chronic health conditions, symptoms, and flares. Built with Next.js 15, React 19, and IndexedDB.

## Features

- **Flare Tracking** - Log and monitor health flares with body map visualization
- **Symptom Logging** - Track symptoms with severity, location, and notes
- **Medication Management** - Schedule medications, log doses, and track adherence
- **Food Journal** - Log meals and identify food-symptom correlations
- **Trigger Tracking** - Monitor environmental, lifestyle, and dietary triggers
- **Analytics Dashboard** - Visualize trends, correlations, and problem areas
- **Photo Documentation** - Capture and annotate photos with AES-256 encryption
- **Data Export** - Export to JSON, CSV, or PDF for sharing with healthcare providers
- **Offline-First** - Full functionality without internet connection
- **Privacy-Focused** - All data stored locally, no cloud dependency

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Database**: IndexedDB via Dexie.js
- **Encryption**: Web Crypto API (AES-256-GCM)
- **Testing**: Jest + React Testing Library
- **PWA**: Service Worker + Web App Manifest

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app                    # Next.js App Router pages
  /analytics            # Analytics dashboard
  /daily                # Daily health reflection
  /flares               # Flare management
  /food                 # Food journal
  /medications          # Medication tracking
  /onboarding           # User onboarding flow
  /photos               # Photo gallery
  /settings             # App settings
  /symptoms             # Symptom tracking
  /triggers             # Trigger management

/components             # Reusable React components
  /Accessibility        # Skip links, accessible modals
  /Analytics            # Charts and metrics
  /BodyMap              # Interactive body visualization
  /Flares               # Flare cards, modals, timeline
  /Food                 # Meal logging components
  /Loading              # Skeleton screens
  /Medications          # Medication management UI
  /Photos               # Photo capture, gallery, comparison
  /PWA                  # Install prompt, PWA provider
  /Symptoms             # Symptom logging components
  /Triggers             # Trigger management UI

/lib                    # Core business logic
  /accessibility        # Focus trap, ARIA utilities
  /admin                # Super admin data generator
  /analytics            # Correlation analysis, background processing
  /bodyMap              # SVG rendering, coordinate utilities
  /errors               # Error handling and boundaries
  /export               # JSON, CSV, PDF export; data import
  /flares               # Flare CRUD operations
  /food                 # Food logging and management
  /medications          # Medication scheduling, reminders
  /onboarding           # Onboarding state and completion
  /optimistic           # Optimistic UI update utilities
  /photos               # Photo upload, encryption
  /presets              # Default symptoms, triggers, foods
  /pwa                  # Service worker utilities
  /settings             # User settings, data deletion
  /symptoms             # Symptom logging, location linking
  /triggers             # Trigger logging and management

/docs                   # Project documentation
  /features             # Feature specifications
  /testing              # Testing documentation

/__tests__              # Jest test suite
```

## Documentation

- **[Architecture Guide](ARCHITECTURE.md)** - Technical architecture and design decisions
- **[Project Board](docs/README.md)** - Feature tracking and status
- **[Cross-Browser Testing](docs/testing/CROSS_BROWSER_TESTING.md)** - Browser compatibility guide
- **[Original Specification](trackedsoc.md)** - Complete feature specification

## Key Features

### Body Map Visualization
Interactive SVG body map for pinpointing symptom and flare locations with zoom, pan, and region highlighting.

### Correlation Analysis
Spearman's rank correlation algorithm identifies relationships between foods, triggers, and symptoms with statistical significance testing.

### Privacy & Security
- All data stored locally in IndexedDB
- Photos encrypted with AES-256-GCM
- EXIF metadata stripped from images
- No cloud services or external APIs
- Complete data deletion capability

### Progressive Web App
- Installable on mobile and desktop
- Works offline with service worker caching
- Background sync for data processing

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Test Suite**: 70 tests covering correlation algorithms, encryption, and flare lifecycle.

## Development

### Prerequisites
- Node.js 18+
- npm 9+

### Environment
No environment variables required - the app runs entirely client-side.

### Database
IndexedDB is initialized automatically on first load with preset symptoms, triggers, and foods.

### Super Admin
Users with the first name "Steven" have access to a Super Admin panel in Settings for:
- Generating test data (1-5 years)
- Viewing IndexedDB tables
- Database statistics

## Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | Full Support |
| Firefox | 88+ | Full Support |
| Safari | 14+ | Full Support |
| Edge | 90+ | Full Support |
| iOS Safari | 14+ | Full Support |
| Chrome Android | 90+ | Full Support |

## License

Private - All rights reserved.

## Contributing

See the [Architecture Guide](ARCHITECTURE.md) for technical details and coding standards.
