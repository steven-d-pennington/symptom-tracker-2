/**
 * Unit Tests for IHS4 Calculation
 * Tests the IHS4 (International Hidradenitis Suppurativa Severity Score System) calculation
 *
 * Formula: IHS4 = (Nodules × 1) + (Abscesses × 2) + (Draining Tunnels × 4)
 * Severity thresholds: ≤3 Mild, 4-10 Moderate, ≥11 Severe
 */

import {
  calculateIHS4ForDate,
  calculateCurrentIHS4,
  getIHS4Severity,
  getIHS4History,
  getIHS4Change,
  getIHS4Average,
  getWorstIHS4InPeriod,
  calculateIHS4Impact,
  validateIHS4Score,
  createEmptyIHS4Result,
  formatIHS4Score,
} from '@/lib/hs/ihs4'
import type { HSLesion, DailyHSEntry, IHS4Result } from '@/lib/hs/types'
import { IHS4_WEIGHTS, IHS4_THRESHOLDS } from '@/lib/hs/types'

// Helper to create test lesions
function createTestLesion(
  overrides: Partial<HSLesion> = {}
): HSLesion {
  return {
    guid: `lesion-${Math.random().toString(36).substr(2, 9)}`,
    regionId: 'left-axilla-central',
    coordinates: { x: 50, y: 50 },
    lesionType: 'nodule',
    status: 'active',
    onsetDate: '2024-01-01',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  }
}

// Helper to create test daily entry
function createTestDailyEntry(
  date: string,
  ihs4: IHS4Result
): DailyHSEntry {
  return {
    guid: `entry-${Math.random().toString(36).substr(2, 9)}`,
    date,
    ihs4,
    overallSymptoms: {
      worstPain: 0,
      averagePain: 0,
      overallDrainage: 'none',
      odor: 'none',
      fatigue: 0,
    },
    qualityOfLife: {
      activitiesAffected: {
        mobility: false,
        dressing: false,
        sleep: false,
        workOrSchool: false,
        exercise: false,
        intimacy: false,
        socialActivities: false,
      },
      emotional: {
        embarrassment: 0,
        anxiety: 0,
        depression: 0,
        frustration: 0,
      },
    },
    flare: {
      isFlareDay: false,
      newLesionsToday: 0,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

describe('IHS4 Constants', () => {
  it('should have correct weights for lesion types', () => {
    expect(IHS4_WEIGHTS.nodule).toBe(1)
    expect(IHS4_WEIGHTS.abscess).toBe(2)
    expect(IHS4_WEIGHTS.draining_tunnel).toBe(4)
  })

  it('should have correct severity thresholds', () => {
    expect(IHS4_THRESHOLDS.mild.max).toBe(3)
    expect(IHS4_THRESHOLDS.moderate.min).toBe(4)
    expect(IHS4_THRESHOLDS.moderate.max).toBe(10)
    expect(IHS4_THRESHOLDS.severe.min).toBe(11)
  })
})

describe('getIHS4Severity', () => {
  it('should return mild for scores 0-3', () => {
    expect(getIHS4Severity(0)).toBe('mild')
    expect(getIHS4Severity(1)).toBe('mild')
    expect(getIHS4Severity(2)).toBe('mild')
    expect(getIHS4Severity(3)).toBe('mild')
  })

  it('should return moderate for scores 4-10', () => {
    expect(getIHS4Severity(4)).toBe('moderate')
    expect(getIHS4Severity(7)).toBe('moderate')
    expect(getIHS4Severity(10)).toBe('moderate')
  })

  it('should return severe for scores 11+', () => {
    expect(getIHS4Severity(11)).toBe('severe')
    expect(getIHS4Severity(15)).toBe('severe')
    expect(getIHS4Severity(50)).toBe('severe')
  })
})

describe('calculateCurrentIHS4', () => {
  it('should return 0 for empty lesion array', () => {
    const result = calculateCurrentIHS4([])
    expect(result.score).toBe(0)
    expect(result.severity).toBe('mild')
    expect(result.breakdown.nodules).toBe(0)
    expect(result.breakdown.abscesses).toBe(0)
    expect(result.breakdown.drainingTunnels).toBe(0)
    expect(result.lesionIds).toHaveLength(0)
  })

  it('should calculate score correctly for nodules only', () => {
    const lesions = [
      createTestLesion({ lesionType: 'nodule' }),
      createTestLesion({ lesionType: 'nodule' }),
      createTestLesion({ lesionType: 'nodule' }),
    ]
    const result = calculateCurrentIHS4(lesions)
    expect(result.score).toBe(3) // 3 × 1
    expect(result.severity).toBe('mild')
    expect(result.breakdown.nodules).toBe(3)
  })

  it('should calculate score correctly for abscesses only', () => {
    const lesions = [
      createTestLesion({ lesionType: 'abscess' }),
      createTestLesion({ lesionType: 'abscess' }),
    ]
    const result = calculateCurrentIHS4(lesions)
    expect(result.score).toBe(4) // 2 × 2
    expect(result.severity).toBe('moderate')
    expect(result.breakdown.abscesses).toBe(2)
  })

  it('should calculate score correctly for draining tunnels only', () => {
    const lesions = [
      createTestLesion({ lesionType: 'draining_tunnel' }),
      createTestLesion({ lesionType: 'draining_tunnel' }),
      createTestLesion({ lesionType: 'draining_tunnel' }),
    ]
    const result = calculateCurrentIHS4(lesions)
    expect(result.score).toBe(12) // 3 × 4
    expect(result.severity).toBe('severe')
    expect(result.breakdown.drainingTunnels).toBe(3)
  })

  it('should calculate score correctly for mixed lesions', () => {
    const lesions = [
      createTestLesion({ lesionType: 'nodule' }),    // 1
      createTestLesion({ lesionType: 'nodule' }),    // 1
      createTestLesion({ lesionType: 'abscess' }),   // 2
      createTestLesion({ lesionType: 'draining_tunnel' }), // 4
    ]
    const result = calculateCurrentIHS4(lesions)
    expect(result.score).toBe(8) // 2×1 + 1×2 + 1×4
    expect(result.severity).toBe('moderate')
    expect(result.breakdown.nodules).toBe(2)
    expect(result.breakdown.abscesses).toBe(1)
    expect(result.breakdown.drainingTunnels).toBe(1)
    expect(result.lesionIds).toHaveLength(4)
  })

  it('should exclude healed lesions from calculation', () => {
    const lesions = [
      createTestLesion({ lesionType: 'nodule', status: 'active' }),
      createTestLesion({ lesionType: 'nodule', status: 'healed' }),
      createTestLesion({ lesionType: 'abscess', status: 'scarred' }),
    ]
    const result = calculateCurrentIHS4(lesions)
    expect(result.score).toBe(1) // Only the active nodule
    expect(result.breakdown.nodules).toBe(1)
    expect(result.breakdown.abscesses).toBe(0)
    expect(result.lesionIds).toHaveLength(1)
  })

  it('should include healing lesions in calculation', () => {
    const lesions = [
      createTestLesion({ lesionType: 'nodule', status: 'active' }),
      createTestLesion({ lesionType: 'nodule', status: 'healing' }),
    ]
    const result = calculateCurrentIHS4(lesions)
    expect(result.score).toBe(2)
    expect(result.lesionIds).toHaveLength(2)
  })
})

describe('calculateIHS4ForDate', () => {
  it('should only count lesions that existed on the target date', () => {
    const lesions = [
      createTestLesion({
        lesionType: 'nodule',
        onsetDate: '2024-01-01',
        status: 'active',
      }),
      createTestLesion({
        lesionType: 'nodule',
        onsetDate: '2024-01-15', // After target date
        status: 'active',
      }),
    ]

    const result = calculateIHS4ForDate(lesions, '2024-01-10')
    expect(result.score).toBe(1) // Only the first lesion
    expect(result.lesionIds).toHaveLength(1)
  })

  it('should exclude lesions that were healed before the target date', () => {
    const lesions = [
      createTestLesion({
        lesionType: 'abscess',
        onsetDate: '2024-01-01',
        healedDate: '2024-01-05', // Healed before target
        status: 'healed',
      }),
      createTestLesion({
        lesionType: 'nodule',
        onsetDate: '2024-01-01',
        status: 'active',
      }),
    ]

    const result = calculateIHS4ForDate(lesions, '2024-01-10')
    expect(result.score).toBe(1) // Only the nodule
    expect(result.breakdown.abscesses).toBe(0)
    expect(result.breakdown.nodules).toBe(1)
  })

  it('should exclude lesions healed on the target date (healed = no longer active)', () => {
    const lesions = [
      createTestLesion({
        lesionType: 'abscess',
        onsetDate: '2024-01-01',
        healedDate: '2024-01-10', // Healed on target date
        status: 'healed',
      }),
    ]

    // Healed lesions should not count even on the day they healed
    const result = calculateIHS4ForDate(lesions, '2024-01-10')
    expect(result.score).toBe(0)
    expect(result.breakdown.abscesses).toBe(0)
  })

  it('should include lesions healed after the target date', () => {
    const lesions = [
      createTestLesion({
        lesionType: 'abscess',
        onsetDate: '2024-01-01',
        healedDate: '2024-01-15', // Healed after target date
        status: 'healed',
      }),
    ]

    // Should count because it wasn't healed yet on target date
    const result = calculateIHS4ForDate(lesions, '2024-01-10')
    expect(result.score).toBe(2)
    expect(result.breakdown.abscesses).toBe(1)
  })
})

describe('validateIHS4Score', () => {
  it('should validate correct IHS4 calculations', () => {
    // 3 nodules only = 3
    expect(validateIHS4Score(3, 0, 0, 3)).toBe(true)

    // 2 nodules + 1 abscess = 4
    expect(validateIHS4Score(2, 1, 0, 4)).toBe(true)

    // 1 nodule + 2 tunnels = 9
    expect(validateIHS4Score(1, 0, 2, 9)).toBe(true)

    // 1 abscess + 3 tunnels = 14
    expect(validateIHS4Score(0, 1, 3, 14)).toBe(true)

    // Complex: 2 nodules + 1 abscess + 1 tunnel = 2 + 2 + 4 = 8
    expect(validateIHS4Score(2, 1, 1, 8)).toBe(true)
  })

  it('should reject incorrect IHS4 calculations', () => {
    expect(validateIHS4Score(3, 0, 0, 5)).toBe(false)
    expect(validateIHS4Score(0, 1, 0, 4)).toBe(false) // Should be 2
    expect(validateIHS4Score(1, 1, 1, 10)).toBe(false) // Should be 7
  })
})

describe('calculateIHS4Impact', () => {
  it('should calculate impact of adding a nodule', () => {
    const result = calculateIHS4Impact(5, 'nodule')
    expect(result.newScore).toBe(6)
    expect(result.change).toBe(1)
    expect(result.newSeverity).toBe('moderate')
    expect(result.severityChanged).toBe(false)
  })

  it('should calculate impact of adding an abscess', () => {
    const result = calculateIHS4Impact(5, 'abscess')
    expect(result.newScore).toBe(7)
    expect(result.change).toBe(2)
  })

  it('should calculate impact of adding a draining tunnel', () => {
    const result = calculateIHS4Impact(5, 'draining_tunnel')
    expect(result.newScore).toBe(9)
    expect(result.change).toBe(4)
  })

  it('should detect severity change from mild to moderate', () => {
    const result = calculateIHS4Impact(3, 'nodule')
    expect(result.newScore).toBe(4)
    expect(result.severityChanged).toBe(true)
    expect(result.newSeverity).toBe('moderate')
  })

  it('should detect severity change from moderate to severe', () => {
    const result = calculateIHS4Impact(10, 'nodule')
    expect(result.newScore).toBe(11)
    expect(result.severityChanged).toBe(true)
    expect(result.newSeverity).toBe('severe')
  })
})

describe('getIHS4History', () => {
  it('should extract history from daily entries', () => {
    const entries: DailyHSEntry[] = [
      createTestDailyEntry('2024-01-01', { score: 3, severity: 'mild', breakdown: { nodules: 3, abscesses: 0, drainingTunnels: 0 }, lesionIds: [] }),
      createTestDailyEntry('2024-01-02', { score: 5, severity: 'moderate', breakdown: { nodules: 3, abscesses: 1, drainingTunnels: 0 }, lesionIds: [] }),
      createTestDailyEntry('2024-01-03', { score: 9, severity: 'moderate', breakdown: { nodules: 3, abscesses: 1, drainingTunnels: 1 }, lesionIds: [] }),
    ]

    const history = getIHS4History(entries)
    expect(history).toHaveLength(3)
    expect(history[0].date).toBe('2024-01-01')
    expect(history[0].score).toBe(3)
    expect(history[2].score).toBe(9)
  })

  it('should sort history by date', () => {
    const entries: DailyHSEntry[] = [
      createTestDailyEntry('2024-01-03', { score: 9, severity: 'moderate', breakdown: { nodules: 3, abscesses: 1, drainingTunnels: 1 }, lesionIds: [] }),
      createTestDailyEntry('2024-01-01', { score: 3, severity: 'mild', breakdown: { nodules: 3, abscesses: 0, drainingTunnels: 0 }, lesionIds: [] }),
      createTestDailyEntry('2024-01-02', { score: 5, severity: 'moderate', breakdown: { nodules: 3, abscesses: 1, drainingTunnels: 0 }, lesionIds: [] }),
    ]

    const history = getIHS4History(entries)
    expect(history[0].date).toBe('2024-01-01')
    expect(history[1].date).toBe('2024-01-02')
    expect(history[2].date).toBe('2024-01-03')
  })
})

describe('getIHS4Change', () => {
  const history = [
    { date: '2024-01-01', score: 5, severity: 'moderate' as const },
    { date: '2024-01-02', score: 8, severity: 'moderate' as const },
    { date: '2024-01-03', score: 4, severity: 'moderate' as const },
  ]

  it('should calculate positive change (worsening)', () => {
    const change = getIHS4Change(history, '2024-01-01', '2024-01-02')
    expect(change).not.toBeNull()
    expect(change!.absoluteChange).toBe(3)
    expect(change!.trend).toBe('worsening')
  })

  it('should calculate negative change (improving)', () => {
    const change = getIHS4Change(history, '2024-01-02', '2024-01-03')
    expect(change).not.toBeNull()
    expect(change!.absoluteChange).toBe(-4)
    expect(change!.trend).toBe('improving')
  })

  it('should return null for missing dates', () => {
    const change = getIHS4Change(history, '2024-01-01', '2024-01-05')
    expect(change).toBeNull()
  })
})

describe('getIHS4Average', () => {
  it('should calculate average over history', () => {
    const history = [
      { date: '2024-01-01', score: 4, severity: 'moderate' as const },
      { date: '2024-01-02', score: 6, severity: 'moderate' as const },
      { date: '2024-01-03', score: 8, severity: 'moderate' as const },
    ]

    const average = getIHS4Average(history)
    expect(average).toBe(6) // (4 + 6 + 8) / 3
  })

  it('should limit to last N days', () => {
    const history = [
      { date: '2024-01-01', score: 10, severity: 'moderate' as const },
      { date: '2024-01-02', score: 4, severity: 'moderate' as const },
      { date: '2024-01-03', score: 6, severity: 'moderate' as const },
    ]

    const average = getIHS4Average(history, 2)
    expect(average).toBe(5) // (4 + 6) / 2 - last 2 entries
  })

  it('should return null for empty history', () => {
    expect(getIHS4Average([])).toBeNull()
  })
})

describe('getWorstIHS4InPeriod', () => {
  const history = [
    { date: '2024-01-01', score: 5, severity: 'moderate' as const },
    { date: '2024-01-02', score: 12, severity: 'severe' as const },
    { date: '2024-01-03', score: 7, severity: 'moderate' as const },
    { date: '2024-01-04', score: 3, severity: 'mild' as const },
  ]

  it('should find worst score in period', () => {
    const worst = getWorstIHS4InPeriod(history, '2024-01-01', '2024-01-04')
    expect(worst).not.toBeNull()
    expect(worst!.score).toBe(12)
    expect(worst!.date).toBe('2024-01-02')
  })

  it('should respect date range', () => {
    const worst = getWorstIHS4InPeriod(history, '2024-01-03', '2024-01-04')
    expect(worst).not.toBeNull()
    expect(worst!.score).toBe(7)
  })

  it('should return null for empty range', () => {
    const worst = getWorstIHS4InPeriod(history, '2024-02-01', '2024-02-10')
    expect(worst).toBeNull()
  })
})

describe('createEmptyIHS4Result', () => {
  it('should create valid empty result', () => {
    const result = createEmptyIHS4Result()
    expect(result.score).toBe(0)
    expect(result.severity).toBe('mild')
    expect(result.breakdown.nodules).toBe(0)
    expect(result.breakdown.abscesses).toBe(0)
    expect(result.breakdown.drainingTunnels).toBe(0)
    expect(result.lesionIds).toEqual([])
  })
})

describe('formatIHS4Score', () => {
  it('should format score as integer string', () => {
    expect(formatIHS4Score(5)).toBe('5')
    expect(formatIHS4Score(12)).toBe('12')
    expect(formatIHS4Score(0)).toBe('0')
  })

  it('should round decimal scores', () => {
    expect(formatIHS4Score(5.5)).toBe('6')
    expect(formatIHS4Score(5.4)).toBe('5')
  })
})

describe('IHS4 Clinical Examples', () => {
  // Test cases from spec Appendix D

  it('should calculate: 3 nodules only = 3 (Mild)', () => {
    const lesions = [
      createTestLesion({ lesionType: 'nodule' }),
      createTestLesion({ lesionType: 'nodule' }),
      createTestLesion({ lesionType: 'nodule' }),
    ]
    const result = calculateCurrentIHS4(lesions)
    expect(result.score).toBe(3)
    expect(result.severity).toBe('mild')
  })

  it('should calculate: 2 nodules + 1 abscess = 4 (Moderate)', () => {
    const lesions = [
      createTestLesion({ lesionType: 'nodule' }),
      createTestLesion({ lesionType: 'nodule' }),
      createTestLesion({ lesionType: 'abscess' }),
    ]
    const result = calculateCurrentIHS4(lesions)
    expect(result.score).toBe(4)
    expect(result.severity).toBe('moderate')
  })

  it('should calculate: 1 nodule + 2 tunnels = 9 (Moderate)', () => {
    const lesions = [
      createTestLesion({ lesionType: 'nodule' }),
      createTestLesion({ lesionType: 'draining_tunnel' }),
      createTestLesion({ lesionType: 'draining_tunnel' }),
    ]
    const result = calculateCurrentIHS4(lesions)
    expect(result.score).toBe(9)
    expect(result.severity).toBe('moderate')
  })

  it('should calculate: 1 abscess + 3 tunnels = 14 (Severe)', () => {
    const lesions = [
      createTestLesion({ lesionType: 'abscess' }),
      createTestLesion({ lesionType: 'draining_tunnel' }),
      createTestLesion({ lesionType: 'draining_tunnel' }),
      createTestLesion({ lesionType: 'draining_tunnel' }),
    ]
    const result = calculateCurrentIHS4(lesions)
    expect(result.score).toBe(14)
    expect(result.severity).toBe('severe')
  })
})
