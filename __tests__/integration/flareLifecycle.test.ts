/**
 * Integration Tests for Flare Lifecycle (F084)
 * Tests the complete flare workflow: creation, updates, interventions, and resolution
 */

import { db, Flare, FlareEvent } from '@/lib/db'
import { createFlare, getActiveFlares, getFlareById, getFlareEvents } from '@/lib/flares/createFlare'
import { updateFlareSeverity, logFlareIntervention } from '@/lib/flares/updateFlare'
import { resolveFlare, calculateDaysActive } from '@/lib/flares/resolveFlare'

// Helper to clear flare data before each test
async function clearFlareData() {
  await db.flares.clear()
  await db.flareEvents.clear()
}

describe('Flare Lifecycle Integration Tests', () => {
  beforeEach(async () => {
    await clearFlareData()
  })

  afterAll(async () => {
    await clearFlareData()
  })

  describe('Flare Creation', () => {
    it('should create a flare with initial severity', async () => {
      const flare = await createFlare({
        bodyRegion: 'knee_left',
        coordinateX: 0.3,
        coordinateY: 0.7,
        initialSeverity: 5,
        notes: 'Initial flare started after walking',
      })

      expect(flare).toBeDefined()
      expect(flare.guid).toBeDefined()
      expect(flare.status).toBe('active')
      expect(flare.initialSeverity).toBe(5)
      expect(flare.currentSeverity).toBe(5)
      expect(flare.bodyRegion).toBe('knee_left')
    })

    it('should create a corresponding flare event on creation', async () => {
      const flare = await createFlare({
        bodyRegion: 'knee_left',
        coordinateX: 0.3,
        coordinateY: 0.7,
        initialSeverity: 5,
      })

      const events = await getFlareEvents(flare.guid)
      expect(events).toHaveLength(1)
      expect(events[0].eventType).toBe('created')
      expect(events[0].severity).toBe(5)
    })

    it('should reject invalid severity (below 1)', async () => {
      await expect(
        createFlare({
          bodyRegion: 'knee_left',
          coordinateX: 0.3,
          coordinateY: 0.7,
          initialSeverity: 0,
        })
      ).rejects.toThrow('Severity must be between 1 and 10')
    })

    it('should reject invalid severity (above 10)', async () => {
      await expect(
        createFlare({
          bodyRegion: 'knee_left',
          coordinateX: 0.3,
          coordinateY: 0.7,
          initialSeverity: 11,
        })
      ).rejects.toThrow('Severity must be between 1 and 10')
    })

    it('should reject invalid coordinates', async () => {
      await expect(
        createFlare({
          bodyRegion: 'knee_left',
          coordinateX: 1.5,
          coordinateY: 0.7,
          initialSeverity: 5,
        })
      ).rejects.toThrow('Coordinates must be between 0 and 1')
    })

    it('should reject future timestamps', async () => {
      const futureTime = Date.now() + 86400000 // 1 day in future
      await expect(
        createFlare({
          bodyRegion: 'knee_left',
          coordinateX: 0.3,
          coordinateY: 0.7,
          initialSeverity: 5,
          timestamp: futureTime,
        })
      ).rejects.toThrow('Timestamp cannot be in the future')
    })
  })

  describe('Flare Retrieval', () => {
    it('should retrieve active flares', async () => {
      await createFlare({
        bodyRegion: 'knee_left',
        coordinateX: 0.3,
        coordinateY: 0.7,
        initialSeverity: 5,
      })

      await createFlare({
        bodyRegion: 'elbow_right',
        coordinateX: 0.8,
        coordinateY: 0.4,
        initialSeverity: 3,
      })

      const activeFlares = await getActiveFlares()
      expect(activeFlares).toHaveLength(2)
    })

    it('should retrieve flare by ID', async () => {
      const created = await createFlare({
        bodyRegion: 'knee_left',
        coordinateX: 0.3,
        coordinateY: 0.7,
        initialSeverity: 5,
      })

      const retrieved = await getFlareById(created.guid)
      expect(retrieved).toBeDefined()
      expect(retrieved!.guid).toBe(created.guid)
      expect(retrieved!.bodyRegion).toBe('knee_left')
    })

    it('should return undefined for non-existent flare', async () => {
      const flare = await getFlareById('non-existent-id')
      expect(flare).toBeUndefined()
    })
  })

  describe('Flare Updates', () => {
    let testFlare: Flare

    beforeEach(async () => {
      await clearFlareData()
      testFlare = await createFlare({
        bodyRegion: 'knee_left',
        coordinateX: 0.3,
        coordinateY: 0.7,
        initialSeverity: 5,
      })
    })

    it('should update flare severity', async () => {
      await updateFlareSeverity({
        flareId: testFlare.guid,
        newSeverity: 7,
        trend: 'worsening',
        notes: 'Pain increased after activity',
      })

      const updated = await getFlareById(testFlare.guid)
      expect(updated!.currentSeverity).toBe(7)
      expect(updated!.status).toBe('worsening')
    })

    it('should create severity update event', async () => {
      await updateFlareSeverity({
        flareId: testFlare.guid,
        newSeverity: 3,
        trend: 'improving',
      })

      const events = await getFlareEvents(testFlare.guid)
      expect(events).toHaveLength(2) // created + update
      expect(events[1].eventType).toBe('severity_update')
      expect(events[1].severity).toBe(3)
      expect(events[1].trend).toBe('improving')
    })

    it('should set status to active when trend is stable', async () => {
      await updateFlareSeverity({
        flareId: testFlare.guid,
        newSeverity: 5,
        trend: 'stable',
      })

      const updated = await getFlareById(testFlare.guid)
      expect(updated!.status).toBe('active')
    })

    it('should reject update on non-existent flare', async () => {
      await expect(
        updateFlareSeverity({
          flareId: 'non-existent',
          newSeverity: 5,
        })
      ).rejects.toThrow('Flare not found')
    })

    it('should reject invalid severity in update', async () => {
      await expect(
        updateFlareSeverity({
          flareId: testFlare.guid,
          newSeverity: 15,
        })
      ).rejects.toThrow('Severity must be between 1 and 10')
    })
  })

  describe('Flare Interventions', () => {
    let testFlare: Flare

    beforeEach(async () => {
      await clearFlareData()
      testFlare = await createFlare({
        bodyRegion: 'knee_left',
        coordinateX: 0.3,
        coordinateY: 0.7,
        initialSeverity: 5,
      })
    })

    it('should log ice intervention', async () => {
      await logFlareIntervention({
        flareId: testFlare.guid,
        interventionType: 'ice',
        interventionDetails: '20 minutes ice pack',
        notes: 'Applied ice after exercise',
      })

      const events = await getFlareEvents(testFlare.guid)
      const interventionEvent = events.find(e => e.eventType === 'intervention')
      expect(interventionEvent).toBeDefined()
      expect(interventionEvent!.interventionType).toBe('ice')
      expect(interventionEvent!.interventionDetails).toBe('20 minutes ice pack')
    })

    it('should log heat intervention', async () => {
      await logFlareIntervention({
        flareId: testFlare.guid,
        interventionType: 'heat',
        interventionDetails: 'Heating pad for 15 minutes',
      })

      const events = await getFlareEvents(testFlare.guid)
      const interventionEvent = events.find(e => e.eventType === 'intervention')
      expect(interventionEvent!.interventionType).toBe('heat')
    })

    it('should log medication intervention', async () => {
      await logFlareIntervention({
        flareId: testFlare.guid,
        interventionType: 'medication',
        interventionDetails: 'Ibuprofen 400mg',
      })

      const events = await getFlareEvents(testFlare.guid)
      const interventionEvent = events.find(e => e.eventType === 'intervention')
      expect(interventionEvent!.interventionType).toBe('medication')
    })

    it('should log rest intervention', async () => {
      await logFlareIntervention({
        flareId: testFlare.guid,
        interventionType: 'rest',
        notes: 'Elevated leg for 1 hour',
      })

      const events = await getFlareEvents(testFlare.guid)
      const interventionEvent = events.find(e => e.eventType === 'intervention')
      expect(interventionEvent!.interventionType).toBe('rest')
    })

    it('should log drainage intervention', async () => {
      await logFlareIntervention({
        flareId: testFlare.guid,
        interventionType: 'drainage',
        interventionDetails: 'Medical drainage procedure',
      })

      const events = await getFlareEvents(testFlare.guid)
      const interventionEvent = events.find(e => e.eventType === 'intervention')
      expect(interventionEvent!.interventionType).toBe('drainage')
    })

    it('should log multiple interventions', async () => {
      await logFlareIntervention({
        flareId: testFlare.guid,
        interventionType: 'ice',
      })

      await logFlareIntervention({
        flareId: testFlare.guid,
        interventionType: 'rest',
      })

      await logFlareIntervention({
        flareId: testFlare.guid,
        interventionType: 'medication',
      })

      const events = await getFlareEvents(testFlare.guid)
      const interventionEvents = events.filter(e => e.eventType === 'intervention')
      expect(interventionEvents).toHaveLength(3)
    })

    it('should reject intervention on non-existent flare', async () => {
      await expect(
        logFlareIntervention({
          flareId: 'non-existent',
          interventionType: 'ice',
        })
      ).rejects.toThrow('Flare not found')
    })
  })

  describe('Flare Resolution', () => {
    let testFlare: Flare

    beforeEach(async () => {
      await clearFlareData()
      testFlare = await createFlare({
        bodyRegion: 'knee_left',
        coordinateX: 0.3,
        coordinateY: 0.7,
        initialSeverity: 5,
        timestamp: Date.now() - 86400000 * 3, // 3 days ago
      })
    })

    it('should resolve a flare', async () => {
      await resolveFlare({
        flareId: testFlare.guid,
        resolutionNotes: 'Flare resolved after treatment',
      })

      const resolved = await getFlareById(testFlare.guid)
      expect(resolved!.status).toBe('resolved')
      expect(resolved!.endDate).toBeDefined()
    })

    it('should create resolution event', async () => {
      await resolveFlare({
        flareId: testFlare.guid,
        resolutionNotes: 'Successfully treated',
      })

      const events = await getFlareEvents(testFlare.guid)
      const resolutionEvent = events.find(e => e.eventType === 'resolved')
      expect(resolutionEvent).toBeDefined()
      expect(resolutionEvent!.resolutionNotes).toBe('Successfully treated')
    })

    it('should not include resolved flares in active list', async () => {
      await resolveFlare({
        flareId: testFlare.guid,
      })

      const activeFlares = await getActiveFlares()
      expect(activeFlares).toHaveLength(0)
    })

    it('should reject resolving already resolved flare', async () => {
      await resolveFlare({
        flareId: testFlare.guid,
      })

      await expect(
        resolveFlare({
          flareId: testFlare.guid,
        })
      ).rejects.toThrow('Flare is already resolved')
    })

    it('should reject resolution date before start date', async () => {
      const earlyDate = testFlare.startDate - 86400000 // 1 day before start
      await expect(
        resolveFlare({
          flareId: testFlare.guid,
          resolutionDate: earlyDate,
        })
      ).rejects.toThrow('Resolution date cannot be before flare start date')
    })

    it('should reject resolution of non-existent flare', async () => {
      await expect(
        resolveFlare({
          flareId: 'non-existent',
        })
      ).rejects.toThrow('Flare not found')
    })
  })

  describe('Updating Resolved Flares', () => {
    let testFlare: Flare

    beforeEach(async () => {
      await clearFlareData()
      testFlare = await createFlare({
        bodyRegion: 'knee_left',
        coordinateX: 0.3,
        coordinateY: 0.7,
        initialSeverity: 5,
      })
      await resolveFlare({ flareId: testFlare.guid })
    })

    it('should reject severity update on resolved flare', async () => {
      await expect(
        updateFlareSeverity({
          flareId: testFlare.guid,
          newSeverity: 3,
        })
      ).rejects.toThrow('Cannot update resolved flare')
    })

    it('should reject intervention on resolved flare', async () => {
      await expect(
        logFlareIntervention({
          flareId: testFlare.guid,
          interventionType: 'ice',
        })
      ).rejects.toThrow('Cannot log intervention for resolved flare')
    })
  })

  describe('Full Flare Lifecycle', () => {
    it('should complete full lifecycle: create -> update -> intervene -> resolve', async () => {
      // Step 1: Create flare
      const flare = await createFlare({
        bodyRegion: 'ankle_right',
        coordinateX: 0.75,
        coordinateY: 0.9,
        initialSeverity: 4,
        notes: 'Started after running',
        timestamp: Date.now() - 86400000 * 5, // 5 days ago
      })
      expect(flare.status).toBe('active')

      // Step 2: Flare worsens
      await updateFlareSeverity({
        flareId: flare.guid,
        newSeverity: 7,
        trend: 'worsening',
        notes: 'Pain increased significantly',
      })

      let current = await getFlareById(flare.guid)
      expect(current!.status).toBe('worsening')
      expect(current!.currentSeverity).toBe(7)

      // Step 3: Apply interventions
      await logFlareIntervention({
        flareId: flare.guid,
        interventionType: 'ice',
        interventionDetails: '20 minutes, 3 times daily',
      })

      await logFlareIntervention({
        flareId: flare.guid,
        interventionType: 'rest',
        notes: 'Limited walking',
      })

      await logFlareIntervention({
        flareId: flare.guid,
        interventionType: 'medication',
        interventionDetails: 'Anti-inflammatory medication',
      })

      // Step 4: Flare starts improving
      await updateFlareSeverity({
        flareId: flare.guid,
        newSeverity: 4,
        trend: 'improving',
        notes: 'Responding well to treatment',
      })

      current = await getFlareById(flare.guid)
      expect(current!.status).toBe('improving')
      expect(current!.currentSeverity).toBe(4)

      // Step 5: Continue improving
      await updateFlareSeverity({
        flareId: flare.guid,
        newSeverity: 2,
        trend: 'improving',
      })

      current = await getFlareById(flare.guid)
      expect(current!.currentSeverity).toBe(2)

      // Step 6: Resolve flare
      await resolveFlare({
        flareId: flare.guid,
        resolutionNotes: 'Fully recovered',
      })

      current = await getFlareById(flare.guid)
      expect(current!.status).toBe('resolved')
      expect(current!.endDate).toBeDefined()

      // Verify complete event history
      const events = await getFlareEvents(flare.guid)
      expect(events.length).toBeGreaterThanOrEqual(7) // created + 2 updates + 3 interventions + resolved

      const eventTypes = events.map(e => e.eventType)
      expect(eventTypes).toContain('created')
      expect(eventTypes).toContain('severity_update')
      expect(eventTypes).toContain('intervention')
      expect(eventTypes).toContain('resolved')
    })
  })

  describe('Days Active Calculation', () => {
    it('should calculate days for active flare', () => {
      const startDate = Date.now() - 86400000 * 5 // 5 days ago
      const days = calculateDaysActive(startDate)
      expect(days).toBe(5)
    })

    it('should calculate days for resolved flare', () => {
      const startDate = Date.now() - 86400000 * 10 // 10 days ago
      const endDate = Date.now() - 86400000 * 3 // 3 days ago
      const days = calculateDaysActive(startDate, endDate)
      expect(days).toBe(7)
    })

    it('should return 0 for same day', () => {
      const today = Date.now()
      const days = calculateDaysActive(today, today)
      expect(days).toBe(0)
    })
  })

  describe('Concurrent Flares', () => {
    it('should handle multiple active flares simultaneously', async () => {
      const flare1 = await createFlare({
        bodyRegion: 'knee_left',
        coordinateX: 0.3,
        coordinateY: 0.7,
        initialSeverity: 5,
      })

      const flare2 = await createFlare({
        bodyRegion: 'elbow_right',
        coordinateX: 0.8,
        coordinateY: 0.4,
        initialSeverity: 3,
      })

      const flare3 = await createFlare({
        bodyRegion: 'ankle_right',
        coordinateX: 0.75,
        coordinateY: 0.9,
        initialSeverity: 7,
      })

      const activeFlares = await getActiveFlares()
      expect(activeFlares).toHaveLength(3)

      // Update each independently
      await updateFlareSeverity({
        flareId: flare1.guid,
        newSeverity: 3,
        trend: 'improving',
      })

      await updateFlareSeverity({
        flareId: flare2.guid,
        newSeverity: 5,
        trend: 'worsening',
      })

      // Resolve one
      await resolveFlare({ flareId: flare3.guid })

      const remainingActive = await getActiveFlares()
      expect(remainingActive).toHaveLength(2)

      // Check individual states
      const f1 = await getFlareById(flare1.guid)
      const f2 = await getFlareById(flare2.guid)
      const f3 = await getFlareById(flare3.guid)

      expect(f1!.status).toBe('improving')
      expect(f2!.status).toBe('worsening')
      expect(f3!.status).toBe('resolved')
    })
  })

  describe('Edge Cases', () => {
    it('should handle flare created and resolved same day', async () => {
      const flare = await createFlare({
        bodyRegion: 'knee_left',
        coordinateX: 0.3,
        coordinateY: 0.7,
        initialSeverity: 2,
      })

      await resolveFlare({ flareId: flare.guid })

      const resolved = await getFlareById(flare.guid)
      expect(resolved!.status).toBe('resolved')
      expect(calculateDaysActive(resolved!.startDate, resolved!.endDate)).toBe(0)
    })

    it('should handle rapid severity changes', async () => {
      const flare = await createFlare({
        bodyRegion: 'knee_left',
        coordinateX: 0.3,
        coordinateY: 0.7,
        initialSeverity: 5,
      })

      // Rapid changes
      for (let i = 6; i <= 10; i++) {
        await updateFlareSeverity({
          flareId: flare.guid,
          newSeverity: i,
          trend: 'worsening',
        })
      }

      for (let i = 9; i >= 1; i--) {
        await updateFlareSeverity({
          flareId: flare.guid,
          newSeverity: i,
          trend: 'improving',
        })
      }

      const events = await getFlareEvents(flare.guid)
      expect(events.length).toBe(15) // 1 created + 5 worsening + 9 improving

      const final = await getFlareById(flare.guid)
      expect(final!.currentSeverity).toBe(1)
      expect(final!.status).toBe('improving')
    })

    it('should maintain event chronological order', async () => {
      const flare = await createFlare({
        bodyRegion: 'knee_left',
        coordinateX: 0.3,
        coordinateY: 0.7,
        initialSeverity: 5,
      })

      await updateFlareSeverity({ flareId: flare.guid, newSeverity: 6 })
      await logFlareIntervention({ flareId: flare.guid, interventionType: 'ice' })
      await updateFlareSeverity({ flareId: flare.guid, newSeverity: 4 })
      await resolveFlare({ flareId: flare.guid })

      const events = await getFlareEvents(flare.guid)

      // Verify chronological order
      for (let i = 1; i < events.length; i++) {
        expect(events[i].timestamp).toBeGreaterThanOrEqual(events[i - 1].timestamp)
      }
    })
  })
})
