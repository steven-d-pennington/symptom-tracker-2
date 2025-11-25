# Quick Start Guide for Developers

## Getting Started

This project uses a **Kanban-style documentation system** where each feature has a detailed specification document.

---

## 📋 Main Project Board

👉 **[View Master Project Board](README.md)** - Start here!

The master board (`docs/README.md`) contains:
- Complete feature list with status (✅ Completed / 🚀 TODO)
- Feature IDs (F001-F086) linking to detailed specs
- Priority levels (HIGH/MEDIUM/LOW)
- Suggested implementation order
- Progress tracking (15.6% complete)

---

## 🎯 How to Pick Up a Task

### 1. Browse the Project Board
Open `docs/README.md` and find a task that interests you or matches your skills.

### 2. Read the Feature Spec
Click the feature link (e.g., `[F015 - Onboarding Flow](features/F015-onboarding-flow.md)`)

Each feature document contains:
- **Overview** - What this feature does
- **Requirements** - Spec requirements
- **Technical Approach** - How to implement it
- **Acceptance Criteria** - What "done" looks like
- **Dependencies** - What must exist first
- **Testing Checklist** - How to verify it works

### 3. Check Dependencies
Make sure all required dependencies are completed (marked with ✅)

### 4. Implement the Feature
Follow the technical approach in the feature document.

### 5. Mark as Complete
Update the master board and move the feature doc to `docs/features/completed/`

---

## 🏗️ Project Structure

```
/symptom-tracker-2
├── app/                  # Next.js app directory
│   ├── page.tsx          # Dashboard (completed)
│   ├── layout.tsx        # Root layout (completed)
│   ├── providers.tsx     # Database provider (completed)
│   ├── onboarding/       # Onboarding flow (TODO)
│   ├── flares/           # Flare management (TODO)
│   ├── symptoms/         # Symptom tracking (TODO)
│   ├── medications/      # Medication management (TODO)
│   ├── food/             # Food journal (TODO)
│   ├── analytics/        # Analytics dashboard (TODO)
│   └── settings/         # Settings pages (TODO)
│
├── components/           # Reusable React components
│   ├── BodyMap/          # Body map component (TODO)
│   ├── Flares/           # Flare components (TODO)
│   ├── Symptoms/         # Symptom components (TODO)
│   └── ...
│
├── lib/                  # Core library code
│   ├── db.ts             # Database schema (✅ completed)
│   ├── initDB.ts         # DB initialization (✅ completed)
│   ├── utils.ts          # Utility functions (✅ completed)
│   ├── photoEncryption.ts # Photo encryption (✅ completed)
│   ├── correlationAnalysis.ts # Correlation engine (✅ completed)
│   ├── presets/          # Preset data (✅ completed)
│   │   ├── symptoms.ts
│   │   ├── triggers.ts
│   │   ├── foods.ts
│   │   └── bodyRegions.ts
│   └── ...
│
├── docs/                 # Project documentation
│   ├── README.md         # 📋 Master project board (START HERE)
│   ├── QUICKSTART.md     # This file
│   ├── features/         # Feature specifications
│   │   ├── F015-onboarding-flow.md
│   │   ├── F020-body-map-svg.md
│   │   ├── F024-flare-creation.md
│   │   └── ...
│   └── features/completed/ # Completed features
│
└── trackedsoc.md         # 📖 Original specification (56KB)
```

---

## ✅ What's Already Built

### Core Infrastructure (100% complete)
- ✅ Next.js 15 + React 19 + TypeScript setup
- ✅ Tailwind CSS styling
- ✅ IndexedDB with Dexie.js (local-first storage)
- ✅ Complete database schema (18 entities)
- ✅ Database initialization

### Privacy & Security (100% complete)
- ✅ AES-256-GCM photo encryption
- ✅ EXIF metadata stripping
- ✅ Unique encryption key per photo
- ✅ No cloud dependency

### Analytics Engine (100% complete)
- ✅ Spearman's rank correlation
- ✅ Lag window testing (15min to 72hr)
- ✅ Statistical significance (p-value)
- ✅ Synergistic combination detection

### Preset Data (100% complete)
- ✅ 50+ symptoms with categories
- ✅ 30+ triggers (environmental, lifestyle, dietary)
- ✅ 40+ foods with allergen tags
- ✅ 93+ body regions

### UI (Basic)
- ✅ Dashboard homepage with action cards
- ✅ Dark mode support
- ✅ Responsive design

---

## 🚀 High Priority Next Steps

### Phase 1: Core User Workflows (MVP)
Start with these features to create a working MVP:

1. **F015** - Onboarding Flow ⭐
2. **F020** - Body Map SVG Component ⭐
3. **F021** - Zoom & Pan Functionality ⭐
4. **F022** - Coordinate Capture ⭐
5. **F024** - Flare Creation Modal ⭐
6. **F027** - Active Flares List ⭐
7. **F029** - Symptom Logging ⭐

These 7 features will create a minimal viable product for flare tracking.

---

## 🛠️ Development Workflow

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open http://localhost:3000

### 3. Build for Production
```bash
npm run build
```

### 4. Test Offline
1. Build the app
2. Start production server: `npm start`
3. Open DevTools > Network tab
4. Set to "Offline" mode
5. Verify all features work

---

## 📝 Coding Standards

### Database Operations
- All mutations must be in transactions
- Use append-only pattern for events (FlareEvent, MedicationEvent, etc.)
- Soft deletes for entity definitions (set `isActive = false`)
- Never modify historical events

### Component Structure
- Use TypeScript for all components
- Props interfaces clearly defined
- Client components: `'use client'` directive
- Server components: default

### Validation
- Severity values: 1-10 integers only
- Coordinates: 0-1 normalized range
- Timestamps: past or present (no future)
- Required fields enforced

### Accessibility
- Touch targets ≥ 44x44px
- Keyboard navigation support
- ARIA labels for screen readers
- High contrast mode compatible

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Works offline (no network requests)
- [ ] Works on mobile (responsive)
- [ ] Works on desktop
- [ ] Dark mode works
- [ ] Keyboard navigation works
- [ ] Screen reader announces properly

### Unit Tests (TODO)
- Correlation algorithm
- Photo encryption/decryption
- Coordinate normalization
- Data validation

### Integration Tests (TODO)
- Flare lifecycle (create → update → resolve)
- Food logging → correlation analysis
- Photo upload → encryption → storage

---

## 🤝 Contributing

1. Pick a feature from the master board
2. Create a branch: `git checkout -b feature/F024-flare-creation`
3. Implement following the feature spec
4. Test thoroughly (offline, mobile, accessibility)
5. Commit with clear message
6. Push and create PR

---

## 📚 Key Resources

- **Master Project Board**: `docs/README.md`
- **Original Specification**: `trackedsoc.md` (comprehensive 56KB spec)
- **Database Schema**: `lib/db.ts` (all 18 entities)
- **Correlation Engine**: `lib/correlationAnalysis.ts`
- **Body Regions**: `lib/presets/bodyRegions.ts` (93+ regions)

---

## 💡 Tips

### For New Contributors
- Start with smaller features (LOW complexity)
- Read the original spec (`trackedsoc.md`) for context
- Check completed features for code patterns
- Ask questions in feature document issues

### For AI Agents
- Each feature document is self-contained
- Dependencies list tells you what must exist first
- Acceptance criteria define "done"
- Technical approach suggests implementation
- Testing checklist ensures quality

### For Project Managers
- Track progress: 14 completed / 90 total = 15.6%
- High priority features are marked ⭐
- Suggested implementation order in master board
- Each feature has effort estimates

---

## 🎯 Success Criteria

### MVP (Minimum Viable Product)
Complete Phase 1 features (7 features) to have:
- User onboarding
- Interactive body map
- Flare creation and tracking
- Basic symptom logging

### Complete Application
Complete all 90 features to have:
- Full health tracking system
- Analytics and insights
- Data export capabilities
- PWA with offline support
- WCAG 2.1 AA accessible

---

## 📞 Getting Help

- **Feature Questions**: See feature document
- **Spec Questions**: See `trackedsoc.md`
- **Technical Issues**: Check existing code in `lib/` directory
- **Architecture Decisions**: See completed features for patterns

---

**Ready to start? Open `docs/README.md` and pick your first feature!** 🚀
