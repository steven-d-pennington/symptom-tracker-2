# Cross-Browser Testing Guide (F085)

This document provides comprehensive testing procedures and compatibility information for the Pocket Symptom Tracker application across different browsers and devices.

## Table of Contents

1. [Supported Browsers](#supported-browsers)
2. [Testing Checklist](#testing-checklist)
3. [Feature Compatibility Matrix](#feature-compatibility-matrix)
4. [Known Browser Differences](#known-browser-differences)
5. [Testing Procedures](#testing-procedures)
6. [Mobile Testing](#mobile-testing)
7. [PWA Testing](#pwa-testing)
8. [Troubleshooting](#troubleshooting)

---

## Supported Browsers

### Desktop Browsers (Primary Support)

| Browser | Minimum Version | Status |
|---------|-----------------|--------|
| Chrome | 90+ | ✅ Full Support |
| Firefox | 88+ | ✅ Full Support |
| Safari | 14+ | ✅ Full Support |
| Edge | 90+ | ✅ Full Support |

### Mobile Browsers (Primary Support)

| Browser | Platform | Minimum Version | Status |
|---------|----------|-----------------|--------|
| Chrome | Android | 90+ | ✅ Full Support |
| Safari | iOS | 14+ | ✅ Full Support |
| Samsung Internet | Android | 14+ | ✅ Full Support |
| Firefox | Android | 88+ | ⚠️ Limited PWA Support |

---

## Testing Checklist

### Core Functionality

- [ ] **Authentication & User Setup**
  - [ ] User can complete onboarding flow
  - [ ] User name is saved correctly
  - [ ] Settings persist across sessions

- [ ] **Symptom Tracking**
  - [ ] Symptom logging works
  - [ ] Severity selection (1-10) works
  - [ ] Body map displays correctly
  - [ ] Coordinate capture works on touch and mouse

- [ ] **Flare Management**
  - [ ] Create flare with body location
  - [ ] Update flare severity
  - [ ] Log interventions
  - [ ] Resolve flares
  - [ ] View flare timeline

- [ ] **Medication Tracking**
  - [ ] Log medication events
  - [ ] View adherence reports
  - [ ] Medication reminders (if supported)

- [ ] **Food Journal**
  - [ ] Log meals with foods
  - [ ] Portion size selection
  - [ ] Meal type selection

- [ ] **Daily Entries**
  - [ ] Complete daily reflection
  - [ ] Calendar view displays correctly
  - [ ] Health metrics saved

- [ ] **Analytics Dashboard**
  - [ ] Charts render correctly
  - [ ] Heat map displays
  - [ ] Correlation reports load
  - [ ] Data exports work

### Technical Features

- [ ] **IndexedDB (Dexie.js)**
  - [ ] Database initializes on first load
  - [ ] Data persists across browser restarts
  - [ ] Transactions complete successfully
  - [ ] Large data sets (1000+ entries) perform well

- [ ] **Web Crypto API**
  - [ ] Photo encryption works
  - [ ] Encrypted data decrypts correctly
  - [ ] Key generation succeeds
  - [ ] AES-256-GCM operations complete

- [ ] **Service Worker**
  - [ ] SW registers successfully
  - [ ] Offline mode works
  - [ ] Cache updates properly
  - [ ] Background sync (if applicable)

- [ ] **PWA Features**
  - [ ] Manifest loads correctly
  - [ ] Install prompt appears
  - [ ] App installs successfully
  - [ ] Standalone mode works
  - [ ] App icon displays

---

## Feature Compatibility Matrix

| Feature | Chrome | Firefox | Safari | Edge | iOS Safari | Android Chrome |
|---------|--------|---------|--------|------|------------|----------------|
| IndexedDB | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Web Crypto API | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Service Worker | ✅ | ✅ | ✅ | ✅ | ✅* | ✅ |
| PWA Install | ✅ | ⚠️ | ⚠️ | ✅ | ⚠️ | ✅ |
| requestIdleCallback | ✅ | ✅ | ❌** | ✅ | ❌** | ✅ |
| CSS Grid | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| CSS Flexbox | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Touch Events | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| File API | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Camera Access | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Notes:**
- *iOS Safari: Service workers have some limitations in standalone mode
- **Safari: requestIdleCallback is polyfilled with setTimeout

---

## Known Browser Differences

### Safari (Desktop & iOS)

1. **requestIdleCallback**: Not supported - polyfilled with setTimeout
   - Impact: Background correlation analysis runs slightly differently
   - Mitigation: Polyfill implemented in `lib/analytics/backgroundCorrelation.ts`

2. **PWA Installation**: Uses "Add to Home Screen" instead of install prompt
   - Impact: No native install banner
   - Mitigation: Custom install instructions shown

3. **IndexedDB in Private Mode**: Limited functionality
   - Impact: Data won't persist in private browsing
   - Mitigation: Warn users about private mode limitations

4. **Date Input**: Native date picker styling differs
   - Impact: Visual inconsistency
   - Status: Acceptable difference

### Firefox

1. **PWA Support**: Desktop PWA requires additional configuration
   - Impact: Install experience differs
   - Mitigation: Provide manual install instructions

2. **WebCrypto subtle timing**: Slightly different async behavior
   - Impact: None - already handled with async/await
   - Status: No action needed

### Edge

1. **Generally Chrome-compatible**: Uses Chromium engine
   - Impact: Minimal differences
   - Status: Full support

### Mobile-Specific

1. **Touch Target Sizes**: Minimum 44x44px required for accessibility
   - Status: Implemented per WCAG 2.1 AA

2. **Virtual Keyboard**: May affect layout
   - Mitigation: Scroll handling implemented

3. **iOS Standalone Mode**:
   - Some Service Worker features limited
   - localStorage/sessionStorage size limits

---

## Testing Procedures

### Initial Load Test

1. Clear browser cache and storage
2. Navigate to application URL
3. Verify:
   - Page loads without errors
   - No console errors
   - Service worker registers
   - Onboarding flow starts for new users

### Data Persistence Test

1. Complete onboarding
2. Create sample data:
   - Log a symptom instance
   - Create a flare
   - Log a medication event
   - Create a daily entry
3. Close browser completely
4. Reopen browser and navigate to app
5. Verify all data persists

### Offline Mode Test

1. Load application while online
2. Wait for Service Worker to cache assets
3. Enable airplane mode or disable network
4. Navigate through app
5. Verify:
   - Cached pages load
   - Data entry works (stored locally)
   - Offline indicator shown

### Photo Encryption Test

1. Navigate to photo capture
2. Take or upload a photo
3. Verify:
   - Photo encrypts successfully
   - Thumbnail generates
   - Photo displays in gallery
4. Close and reopen app
5. Verify photo still decrypts and displays

### Body Map Test

1. Navigate to body map
2. Test on different screen sizes
3. Verify:
   - SVG renders correctly
   - Zoom/pan works (mouse wheel, pinch)
   - Tap/click registers coordinates
   - Regions highlight on selection

### Performance Test

1. Generate test data (use Super Admin if available)
2. Navigate to analytics dashboard
3. Verify:
   - Charts render within 3 seconds
   - Scrolling is smooth (60fps)
   - No memory warnings
   - Background analysis completes

---

## Mobile Testing

### Touch Interaction Checklist

- [ ] Single tap selects items
- [ ] Long press opens context menus (where applicable)
- [ ] Swipe gestures work (where implemented)
- [ ] Pinch-to-zoom on body map
- [ ] Pull-to-refresh (where implemented)
- [ ] Keyboard appears for input fields
- [ ] Form scrolls when keyboard opens

### Screen Size Testing

Test at these viewport widths:
- 320px (iPhone SE)
- 375px (iPhone standard)
- 390px (iPhone 12/13/14)
- 414px (iPhone Plus/Max)
- 360px (Android standard)
- 412px (Pixel phones)

### Orientation Testing

- [ ] Portrait mode displays correctly
- [ ] Landscape mode displays correctly
- [ ] Rotation doesn't lose state
- [ ] Forms remain accessible in both orientations

### Device-Specific Tests

**iOS:**
1. Test in Safari
2. Test PWA (Add to Home Screen)
3. Verify camera access
4. Check notification permissions

**Android:**
1. Test in Chrome
2. Test PWA installation
3. Verify camera access
4. Test with Android back button

---

## PWA Testing

### Installation Test

**Chrome Desktop:**
1. Look for install icon in address bar
2. Click install
3. Verify app opens in standalone window
4. Verify icon in app drawer/dock

**Chrome Android:**
1. Look for "Add to Home Screen" banner
2. Install app
3. Verify home screen icon
4. Open app and verify standalone mode

**Safari iOS:**
1. Tap Share button
2. Select "Add to Home Screen"
3. Verify icon and name
4. Open app and verify standalone mode

### Manifest Verification

1. Open DevTools > Application > Manifest
2. Verify:
   - Name and short_name correct
   - Icons load at all sizes
   - Display mode is "standalone"
   - Theme colors correct
   - Start URL correct

### Service Worker Verification

1. Open DevTools > Application > Service Workers
2. Verify:
   - SW is registered
   - SW is active
   - No errors in console
3. Check Network tab in offline mode
4. Verify assets served from cache

---

## Troubleshooting

### Common Issues

**IndexedDB Not Working:**
- Check if private/incognito mode
- Verify storage permissions
- Try clearing site data and reloading

**Service Worker Not Registering:**
- Ensure HTTPS (or localhost)
- Check for SW errors in console
- Verify SW file is accessible

**Photos Not Loading:**
- Verify Web Crypto API available
- Check IndexedDB storage quota
- Ensure encryption keys stored

**PWA Not Installing:**
- Verify manifest.json loads
- Check HTTPS requirement
- Ensure service worker active
- Check PWA criteria in DevTools

**Body Map Not Responding:**
- Check touch events enabled
- Verify JavaScript not blocked
- Test zoom level

### Browser DevTools Commands

```javascript
// Check IndexedDB
indexedDB.databases().then(console.log)

// Check Service Worker
navigator.serviceWorker.getRegistrations().then(console.log)

// Check Web Crypto
console.log('Crypto:', !!window.crypto?.subtle)

// Clear all data (for testing)
indexedDB.deleteDatabase('SymptomTrackerDB')
```

---

## Test Results Template

```markdown
## Browser Test Report

**Date:** YYYY-MM-DD
**Tester:** [Name]
**Browser:** [Browser Name + Version]
**Platform:** [OS + Version]
**Device:** [Device Name/Model]

### Test Results

| Test Category | Pass | Fail | Notes |
|---------------|------|------|-------|
| Core Functionality | | | |
| IndexedDB | | | |
| Web Crypto | | | |
| Service Worker | | | |
| PWA Features | | | |
| Mobile Touch | | | |
| Accessibility | | | |

### Issues Found

1. [Issue description]
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Severity: [Critical/Major/Minor]

### Screenshots

[Attach relevant screenshots]
```

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2024-01-XX | 1.0 | Initial documentation |
