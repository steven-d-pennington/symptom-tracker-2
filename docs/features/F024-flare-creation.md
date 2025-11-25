# F024 - Flare Creation Modal

**Status:** 🚀 TODO
**Priority:** HIGH
**Complexity:** Medium
**Estimated Effort:** 4-6 hours

---

## Overview

Build the modal/dialog interface for creating a new flare after a user taps a location on the body map. Captures initial severity, notes, and optional photo attachment.

---

## Requirements (from spec)

### Workflow 2: Logging a New Flare

**Trigger**: User notices new flare/lesion

**Steps**:
1. Navigate to body map interface
2. Select body view (front/back/side)
3. Tap body region where flare is located
4. Body map zooms to selected region (2-3x magnification)
5. User taps precise location within region
6. System captures normalized coordinates (x,y)
7. **Flare creation modal opens**:
   - Initial severity slider (1-10)
   - Optional notes field
   - Optional photo attachment
   - Timestamp (defaults to now, editable)
8. User submits flare creation
9. System:
   - Creates flare entity with unique ID
   - Creates initial flare event (type: created)
   - Updates body map with flare marker
   - Adds flare to "Active Flares" list

**Success Criteria**:
- Flare has unique persistent ID
- Location captured with precision
- Initial severity recorded
- Flare visible on body map
- Flare appears in active list

---

## Technical Approach

### File Structure
```
components/Flares/
  FlareCreationModal.tsx      # Main modal component
  SeveritySlider.tsx          # 1-10 severity slider
  PhotoUploadButton.tsx       # Photo attachment
  TimestampPicker.tsx         # Editable timestamp
lib/flares/
  createFlare.ts              # Database operations
  flareEvents.ts              # Event creation
```

### Database Operations

**Create Flare + Initial Event (Atomic Transaction):**
```typescript
async function createFlare(data: {
  bodyRegion: string
  coordinateX: number
  coordinateY: number
  initialSeverity: number
  notes?: string
  photoId?: string
  timestamp?: number
}): Promise<Flare> {
  const now = getCurrentTimestamp()
  const timestamp = data.timestamp || now

  // Create flare entity
  const flare: Flare = {
    guid: generateGUID(),
    startDate: timestamp,
    status: 'active',
    bodyRegion: data.bodyRegion,
    coordinateX: data.coordinateX,
    coordinateY: data.coordinateY,
    initialSeverity: data.initialSeverity,
    currentSeverity: data.initialSeverity,
    createdAt: now,
    updatedAt: now,
  }

  // Create initial flare event (type: created)
  const flareEvent: FlareEvent = {
    guid: generateGUID(),
    flareId: flare.guid,
    eventType: 'created',
    timestamp: timestamp,
    timezoneOffset: getTimezoneOffset(),
    severity: data.initialSeverity,
    notes: data.notes,
    createdAt: now,
  }

  // Atomic transaction
  await db.transaction('rw', db.flares, db.flareEvents, async () => {
    await db.flares.add(flare)
    await db.flareEvents.add(flareEvent)
  })

  return flare
}
```

**Handle Photo Attachment (if provided):**
```typescript
async function attachPhotoToFlare(
  file: File,
  flareId: string,
  bodyRegion: string
): Promise<PhotoAttachment> {
  // Encrypt photo
  const { encryptedData, encryptionKey, iv } = await encryptPhoto(file)
  const { encryptedData: thumbData, encryptionKey: thumbKey, iv: thumbIV } =
    await encryptThumbnail(file)

  const metadata = await getPhotoMetadata(file)

  const photo: PhotoAttachment = {
    guid: generateGUID(),
    bodyRegion: bodyRegion,
    fileName: generateGUID() + '.jpg',
    originalFileName: file.name,
    mimeType: metadata.mimeType,
    sizeBytes: metadata.sizeBytes,
    width: metadata.width,
    height: metadata.height,
    encryptedData: encryptedData,
    thumbnailData: thumbData,
    encryptionIV: iv,
    thumbnailIV: thumbIV,
    encryptionKey: encryptionKey,
    captureTimestamp: Date.now(),
    tags: [`flare:${flareId}`],
    createdAt: Date.now(),
  }

  await db.photoAttachments.add(photo)
  return photo
}
```

---

## UI/UX Design

### Modal Layout
```
+----------------------------------------+
|  New Flare                        [X]  |
+----------------------------------------+
|                                        |
|  Location: Left Groin                  |
|  Coordinates: (0.45, 0.62)             |
|                                        |
|  Initial Severity *                    |
|  ●━━━━━━━━━━━━━━━○ 7                   |
|  Moderate pain                         |
|                                        |
|  Notes (optional)                      |
|  ┌────────────────────────────────┐   |
|  │ Noticed after exercise today   │   |
|  │                                 │   |
|  └────────────────────────────────┘   |
|                                        |
|  📸 Add Photo (optional)               |
|  [ + Upload Photo ]                    |
|                                        |
|  Timestamp                             |
|  [2025-11-25 14:30] [📅] [🕐]         |
|                                        |
|  [Cancel]              [Create Flare]  |
+----------------------------------------+
```

### Component Structure
```typescript
interface FlareCreationModalProps {
  isOpen: boolean
  onClose: () => void
  bodyRegion: string
  coordinates: { x: number; y: number }
}

function FlareCreationModal({
  isOpen,
  onClose,
  bodyRegion,
  coordinates,
}: FlareCreationModalProps) {
  const [severity, setSeverity] = useState(5)
  const [notes, setNotes] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [timestamp, setTimestamp] = useState(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Attach photo if provided
      let photoId: string | undefined
      if (photo) {
        const photoAttachment = await attachPhotoToFlare(
          photo,
          '', // Will be set after flare creation
          bodyRegion
        )
        photoId = photoAttachment.guid
      }

      // Create flare
      const flare = await createFlare({
        bodyRegion,
        coordinateX: coordinates.x,
        coordinateY: coordinates.y,
        initialSeverity: severity,
        notes: notes || undefined,
        photoId,
        timestamp: timestamp.getTime(),
      })

      // Success feedback
      toast.success('Flare created successfully')
      onClose()

      // Navigate to flare detail?
      // router.push(`/flares/${flare.guid}`)
    } catch (error) {
      console.error('Error creating flare:', error)
      toast.error('Failed to create flare')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>New Flare</h2>

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Location: <strong>{bodyRegion}</strong>
        </p>
        <p className="text-xs text-gray-500">
          Coordinates: ({coordinates.x.toFixed(2)}, {coordinates.y.toFixed(2)})
        </p>
      </div>

      <SeveritySlider
        value={severity}
        onChange={setSeverity}
        label="Initial Severity"
        required
      />

      <TextArea
        label="Notes (optional)"
        value={notes}
        onChange={setNotes}
        placeholder="Describe the flare..."
        rows={3}
      />

      <PhotoUploadButton
        onPhotoSelected={setPhoto}
        selectedPhoto={photo}
      />

      <TimestampPicker
        value={timestamp}
        onChange={setTimestamp}
        maxDate={new Date()} // Can't be in future
      />

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Flare'}
        </Button>
      </div>
    </Modal>
  )
}
```

---

## Validation Rules

### Required Fields
- ✅ Body region (from map selection)
- ✅ Coordinates (from map tap)
- ✅ Initial severity (1-10)

### Optional Fields
- Notes (unlimited length)
- Photo attachment
- Timestamp (defaults to now)

### Constraints
- Severity must be integer 1-10
- Coordinates must be 0-1 range
- Timestamp cannot be in future
- Photo must be image file (JPEG, PNG)
- Photo max size: 10MB

---

## Acceptance Criteria

- [ ] Modal opens when user taps location on body map
- [ ] Body region and coordinates displayed correctly
- [ ] Severity slider allows values 1-10
- [ ] Severity slider shows descriptive label (Mild/Moderate/Severe)
- [ ] Notes field accepts unlimited text
- [ ] Photo upload button opens file picker
- [ ] Photo preview shown after selection
- [ ] Timestamp defaults to current time
- [ ] Timestamp can be edited (date + time pickers)
- [ ] Cannot set future timestamp
- [ ] "Create Flare" button disabled while submitting
- [ ] Success creates flare entity in database
- [ ] Success creates initial flare event (type: created)
- [ ] Photo is encrypted before storage (if provided)
- [ ] Modal closes after successful creation
- [ ] Success toast/notification shown
- [ ] Error handling for failed creation
- [ ] Cancel button closes modal without saving
- [ ] Keyboard navigation works (Tab, Enter, Esc)
- [ ] Mobile responsive
- [ ] Works offline

---

## Dependencies

**Required:**
- Database schema (F003) ✅
- Flare & FlareEvent entities ✅
- Photo encryption (F007) ✅
- Body map component (F020)
- Coordinate capture (F022)

**Optional:**
- Toast notifications library
- Date/time picker component

---

## Testing Checklist

- [ ] Create flare with minimum required fields
- [ ] Create flare with all optional fields
- [ ] Photo attachment encrypts properly
- [ ] EXIF data stripped from photo
- [ ] Flare appears on body map after creation
- [ ] Flare appears in active flares list
- [ ] Initial event created correctly
- [ ] Validation prevents invalid severity values
- [ ] Validation prevents future timestamps
- [ ] Cancel discards changes
- [ ] Database transaction is atomic (no partial saves)
- [ ] Error handling for database failures
- [ ] Error handling for photo encryption failures

---

## Notes

- Keep modal focused on essential info (severity, notes, photo)
- Consider showing small preview of body map region
- Add visual feedback during submission (loading spinner)
- Consider auto-saving draft to localStorage (if user closes accidentally)
- Severity slider should have haptic feedback on mobile

---

## Related Files

- `/components/Flares/FlareCreationModal.tsx` (to be created)
- `/lib/flares/createFlare.ts` (to be created)
- `/lib/db.ts` (existing - Flare/FlareEvent schema)
- `/lib/photoEncryption.ts` (existing - photo encryption)
- `/components/BodyMap/BodyMap.tsx` (dependency - F020)

---

## References

- Specification: Section "Workflow 2: Logging a New Flare"
- Specification: Section "F-002: Flare Lifecycle Management"
- Business Rules: BR-3 (Medical-Grade Data Integrity)
- Data Integrity: DI-001 (Append-Only Event History)
