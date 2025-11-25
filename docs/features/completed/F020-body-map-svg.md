# F020 - Body Map SVG Component

**Status:** 🚀 TODO
**Priority:** HIGH
**Complexity:** High
**Estimated Effort:** 8-12 hours

---

## Overview

Create an interactive SVG-based body map component with 93+ anatomical regions, supporting front/back/side views for precise flare location tracking.

---

## Requirements (from spec)

### F-001: Precision Body Mapping
**Description**: Interactive body map with 93+ anatomical regions for precise flare location tracking.

**Capabilities**:
- Front, back, and side body views
- 93+ distinct regions including:
  - Standard regions: head, neck, shoulders, chest, abdomen, back, arms, legs
  - Groin-specific: left groin, right groin, center groin (HS-specific)
  - Detailed subdivisions: upper arm, lower arm, hand, thigh, calf, foot
- Zoom/pan functionality:
  - 1x to 3x magnification
  - Pinch-to-zoom (mobile)
  - Scroll-wheel zoom (desktop)
  - Pan by dragging
- Coordinate capture:
  - Tap/click to place marker
  - Normalized coordinates (0-1 range)
  - Resolution-independent precision
- Marker display:
  - Active flares (color-coded by severity)
  - Resolved flares (optional toggle)
  - Status indicators (improving/worsening arrows)
- Accessibility:
  - Keyboard navigation (tab, arrow keys, enter to select)
  - Screen reader support (region announcements)
  - High contrast mode compatible
  - Touch target size ≥ 44x44px

**Business Value**: Enables precise medical-grade location tracking for healthcare consultation.

---

## Technical Approach

### File Structure
```
components/BodyMap/
  BodyMap.tsx               # Main container component
  BodyMapSVG.tsx            # SVG renderer
  BodyRegion.tsx            # Individual region component
  FlareMarker.tsx           # Flare marker component
  ViewSelector.tsx          # Front/back/side toggle
  ZoomControls.tsx          # Zoom in/out buttons
lib/bodyMap/
  bodyMapSVGs.tsx           # SVG path definitions
  regionMapping.ts          # Region ID to SVG path mapping
  coordinateUtils.ts        # Coordinate normalization
  zoomPanUtils.ts           # Zoom/pan calculations
```

### SVG Structure

**Region Definition:**
```typescript
interface BodyMapRegion {
  id: string                    // e.g., 'groin-left'
  name: string                  // e.g., 'Groin (left)'
  path: string                  // SVG path data
  view: 'front' | 'back' | 'side'
  category: 'head' | 'torso' | 'upper-limb' | 'lower-limb' | 'specialized'
  bounds: { x: number; y: number; width: number; height: number }
}
```

**SVG Template (Front View):**
```xml
<svg viewBox="0 0 400 800" xmlns="http://www.w3.org/2000/svg">
  <!-- Head -->
  <path id="head" d="M200,50 Q220,50 220,70 Q220,90 200,90 Q180,90 180,70 Q180,50 200,50" />

  <!-- Neck -->
  <path id="neck-front" d="M190,90 L190,110 L210,110 L210,90" />

  <!-- Groin regions (HS-specific) -->
  <path id="groin-left" d="..." />
  <path id="groin-right" d="..." />
  <path id="groin-center" d="..." />

  <!-- ... 90+ more regions ... -->
</svg>
```

### Coordinate Normalization

**Convert screen coordinates to normalized (0-1) coordinates:**
```typescript
function normalizeCoordinates(
  clickX: number,
  clickY: number,
  regionBounds: DOMRect,
  zoom: number
): { x: number; y: number } {
  // Account for zoom and pan offset
  const relativeX = (clickX - regionBounds.left) / zoom
  const relativeY = (clickY - regionBounds.top) / zoom

  // Normalize to 0-1 range
  const normalizedX = relativeX / regionBounds.width
  const normalizedY = relativeY / regionBounds.height

  return {
    x: Math.max(0, Math.min(1, normalizedX)),
    y: Math.max(0, Math.min(1, normalizedY)),
  }
}
```

**Convert normalized coordinates back to screen coordinates:**
```typescript
function denormalizeCoordinates(
  normalizedX: number,
  normalizedY: number,
  regionBounds: DOMRect,
  zoom: number
): { x: number; y: number } {
  return {
    x: normalizedX * regionBounds.width * zoom,
    y: normalizedY * regionBounds.height * zoom,
  }
}
```

---

## UI/UX Design

### Main Body Map Interface
```
+----------------------------------------+
|  Body Map                        [X]   |
|  ┌────────────────────────────────┐   |
|  │ [Front] [Back] [Side]   🔍- 🔍+ │   |
|  │                                  │   |
|  │      Front View (2x zoom)        │   |
|  │                                  │   |
|  │         👤                       │   |
|  │        /│\                       │   |
|  │       / │ \                      │   |
|  │         │                        │   |
|  │        / \                       │   |
|  │       /   \                      │   |
|  │                                  │   |
|  │  🔴 Active flare (severity 8)    │   |
|  │  🟡 Active flare (severity 4)    │   |
|  │  ⚪ Resolved flare               │   |
|  │                                  │   |
|  └────────────────────────────────┘   |
|  [ ] Show resolved flares             |
|  Tap a region to add flare            |
+----------------------------------------+
```

### Region Hover/Selection
```typescript
<BodyRegion
  id="groin-left"
  name="Groin (left)"
  path="..."
  isSelected={selectedRegion === 'groin-left'}
  hasFlares={flaresInRegion.length > 0}
  onClick={handleRegionClick}
  onHover={handleRegionHover}
  className={`
    region
    ${isSelected ? 'region-selected' : ''}
    ${hasFlares ? 'region-has-flares' : ''}
  `}
/>
```

**CSS States:**
```css
.region {
  fill: transparent;
  stroke: #cbd5e0;
  stroke-width: 1;
  transition: all 0.2s;
  cursor: pointer;
}

.region:hover {
  fill: rgba(59, 130, 246, 0.1);
  stroke: #3b82f6;
  stroke-width: 2;
}

.region-selected {
  fill: rgba(59, 130, 246, 0.2);
  stroke: #2563eb;
  stroke-width: 3;
}

.region-has-flares {
  stroke: #ef4444;
  stroke-width: 2;
}
```

---

## Zoom & Pan Implementation

### Zoom State
```typescript
const [zoomLevel, setZoomLevel] = useState(1)
const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })

const handleZoomIn = () => {
  setZoomLevel(prev => Math.min(prev + 0.5, 3))
}

const handleZoomOut = () => {
  setZoomLevel(prev => Math.max(prev - 0.5, 1))
}

const handlePinchZoom = (event: TouchEvent) => {
  // Calculate distance between two touch points
  const touch1 = event.touches[0]
  const touch2 = event.touches[1]
  const distance = Math.hypot(
    touch2.clientX - touch1.clientX,
    touch2.clientY - touch1.clientY
  )

  // Compare to initial distance to determine zoom
  const scale = distance / initialDistance
  setZoomLevel(prev => Math.max(1, Math.min(3, prev * scale)))
}
```

### Pan Interaction
```typescript
const handlePanStart = (e: React.MouseEvent | React.TouchEvent) => {
  setIsPanning(true)
  setPanStartPos({
    x: 'touches' in e ? e.touches[0].clientX : e.clientX,
    y: 'touches' in e ? e.touches[0].clientY : e.clientY,
  })
}

const handlePanMove = (e: React.MouseEvent | React.TouchEvent) => {
  if (!isPanning) return

  const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const currentY = 'touches' in e ? e.touches[0].clientY : e.clientY

  setPanOffset({
    x: panOffset.x + (currentX - panStartPos.x),
    y: panOffset.y + (currentY - panStartPos.y),
  })
}
```

---

## Flare Marker Display

### Marker Component
```typescript
interface FlareMarkerProps {
  flare: Flare
  normalizedX: number
  normalizedY: number
  zoom: number
  onClick: (flare: Flare) => void
}

function FlareMarker({ flare, normalizedX, normalizedY, zoom, onClick }: FlareMarkerProps) {
  const color = getSeverityColor(flare.currentSeverity)
  const size = 8 * zoom // Scale with zoom

  return (
    <g
      transform={`translate(${normalizedX * 100}, ${normalizedY * 100})`}
      onClick={() => onClick(flare)}
      className="cursor-pointer"
    >
      <circle
        cx={0}
        cy={0}
        r={size}
        fill={color}
        stroke="white"
        strokeWidth={2}
      />
      {flare.status === 'worsening' && (
        <path d="M0,-10 L5,0 L-5,0 Z" fill="red" /> // Up arrow
      )}
      {flare.status === 'improving' && (
        <path d="M0,10 L5,0 L-5,0 Z" fill="green" /> // Down arrow
      )}
    </g>
  )
}

function getSeverityColor(severity: number): string {
  if (severity >= 8) return '#ef4444' // red-500
  if (severity >= 5) return '#f59e0b' // amber-500
  if (severity >= 3) return '#eab308' // yellow-500
  return '#84cc16' // lime-500
}
```

---

## Accessibility

### Keyboard Navigation
```typescript
<svg
  role="img"
  aria-label="Body map for flare location tracking"
  tabIndex={0}
  onKeyDown={handleKeyDown}
>
  <g role="group" aria-label="Body regions">
    {regions.map(region => (
      <path
        key={region.id}
        d={region.path}
        role="button"
        aria-label={`${region.name} region`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleRegionClick(region.id)
          }
        }}
      />
    ))}
  </g>
</svg>
```

### Screen Reader Announcements
```typescript
const [announcement, setAnnouncement] = useState('')

const handleRegionHover = (regionName: string) => {
  setAnnouncement(`Hovering over ${regionName} region`)
}

<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {announcement}
</div>
```

---

## Acceptance Criteria

- [ ] SVG body map with 93+ regions renders correctly
- [ ] Front, back, and side views toggle properly
- [ ] Regions highlight on hover
- [ ] Regions are selectable via click/tap
- [ ] Zoom controls (buttons) zoom from 1x to 3x
- [ ] Pinch-to-zoom works on mobile devices
- [ ] Scroll-wheel zoom works on desktop
- [ ] Pan by dragging works when zoomed in
- [ ] Click on region captures normalized coordinates (0-1)
- [ ] Flare markers display at correct locations
- [ ] Markers color-coded by severity (green→yellow→red)
- [ ] Status arrows show on markers (improving/worsening)
- [ ] Toggle to show/hide resolved flares works
- [ ] Touch targets ≥ 44x44px on mobile
- [ ] Keyboard navigation works (Tab, Enter, Arrow keys)
- [ ] Screen reader announces region names
- [ ] High contrast mode compatible
- [ ] Responsive on all screen sizes

---

## Dependencies

**Required:**
- Body region definitions (F014) ✅
- Flare database schema (F003) ✅

**Needed for full functionality:**
- Flare creation modal (F024)
- Zoom & pan functionality (F021)
- Coordinate capture (F022)

---

## Testing Checklist

- [ ] All 93+ regions render without gaps or overlaps
- [ ] View switching (front/back/side) is smooth
- [ ] Zoom doesn't break region boundaries
- [ ] Pan stays within bounds when zoomed
- [ ] Coordinates normalize correctly at all zoom levels
- [ ] Markers stay in correct position when zooming
- [ ] Multiple markers in same region don't overlap
- [ ] Touch interactions work on mobile
- [ ] Keyboard navigation reaches all regions
- [ ] Screen reader announces all regions
- [ ] Works offline
- [ ] Performance good with 20+ markers

---

## Notes

- Consider using library like `react-zoom-pan-pinch` for zoom/pan
- SVG paths can be created using vector graphics tools (Figma, Illustrator)
- Start with simplified body outline, add detail iteratively
- Groin regions are critical for HS tracking (highlighted in spec)
- Consider lazy loading SVG paths for performance

---

## Related Files

- `/components/BodyMap/BodyMap.tsx` (to be created)
- `/lib/presets/bodyRegions.ts` (existing - 93+ regions defined)
- `/lib/db.ts` (existing - Flare schema)

---

## References

- Specification: Section "F-001: Precision Body Mapping"
- Specification: Appendix "Body Region Definitions"
- BR-4: Precision Tracking requirement
