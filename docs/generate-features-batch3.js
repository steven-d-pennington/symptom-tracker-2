#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const features = [
  // ANALYTICS DASHBOARD (F050-F056)
  {
    id: 'F050',
    title: 'Analytics Dashboard Landing',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Medium',
    effort: '4-5 hours',
    overview: 'Main analytics dashboard with key metrics, recent insights, and navigation to detailed analysis views.',
    requirements: 'Overview cards with active flares count, top triggers, recent correlations. Quick access to detailed views.',
    files: 'app/analytics/page.tsx, components/Analytics/MetricCard.tsx',
    dbOps: 'Aggregate queries for counts, recent correlations, trends.',
    acceptance: [
      'Active flares count',
      'Total symptoms logged (this month)',
      'Top 3 triggers',
      'Latest food-symptom correlations',
      'Problem areas preview',
      'Navigation cards to detailed views',
      'Date range selector',
      'Export analytics button'
    ],
    dependencies: 'Database schema (F003✅), Correlation engine (F009✅)',
    specRef: 'F-009: Analytics Dashboard'
  },
  {
    id: 'F051',
    title: 'Problem Areas Heat Map',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Medium',
    effort: '5-6 hours',
    overview: 'Body map visualization with heat map showing flare frequency by region. Color-coded intensity.',
    requirements: 'Analyze flare history per region. Color code regions by frequency (green→yellow→red). Show stats on hover.',
    files: 'components/Analytics/ProblemAreasHeatMap.tsx, lib/analytics/calculateProblemAreas.ts',
    dbOps: 'Query db.flares, group by bodyRegion, count occurrences, calculate average severity and duration.',
    acceptance: [
      'Body map with color-coded regions',
      'Heat map intensity based on flare frequency',
      'Hover shows region stats',
      'Ranked list of problem regions',
      'Stats: flare count, avg duration, avg severity',
      'Date range filter',
      'Export problem areas report'
    ],
    dependencies: 'Body map (F020), Flare management (F024-F028)',
    specRef: 'Workflow 7: Identifying Problem Areas'
  },
  {
    id: 'F052',
    title: 'Food-Symptom Correlation Reports',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Medium',
    effort: '5-6 hours',
    overview: 'Display food-symptom correlations with statistical significance, lag windows, and confidence levels.',
    requirements: 'Show positive correlations (foods that increase symptoms). Negative correlations (foods that help). Sort by correlation strength.',
    files: 'app/analytics/correlations/page.tsx, components/Analytics/CorrelationTable.tsx',
    dbOps: 'Run correlation analysis, query FoodCombinationCorrelation results.',
    acceptance: [
      'List of positive correlations (sorted by strength)',
      'List of negative correlations',
      'Shows: food name, symptom, correlation score, p-value',
      'Confidence level indicator',
      'Best lag window displayed',
      'Sample size shown',
      'Filter by symptom',
      'Filter by confidence level',
      'Timeline visualization of correlation',
      'Export correlation report'
    ],
    dependencies: 'Correlation engine (F009✅), Food logging (F039)',
    specRef: 'Workflow 6: Discovering Food-Symptom Correlations'
  },
  {
    id: 'F053',
    title: 'Synergistic Food Insights',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Medium',
    effort: '4-5 hours',
    overview: 'Highlight food combinations with synergistic effects (combination correlation > individual + threshold).',
    requirements: 'Detect when food combination correlation exceeds individual food correlations by 0.15+. Show which combinations amplify effects.',
    files: 'components/Analytics/SynergyInsights.tsx',
    dbOps: 'Query FoodCombinationCorrelation where isSynergistic = true.',
    acceptance: [
      'List of synergistic combinations',
      'Shows: food combo, symptom, combo correlation, individual max correlation',
      'Synergy strength indicator',
      'Example: "Tomato + Egg together worse than individually"',
      'Filter by symptom',
      'Sort by synergy strength',
      'Recommendations to avoid combinations'
    ],
    dependencies: 'Correlation engine (F009✅)',
    specRef: 'Correlation Analysis Rules: Food Combination Analysis'
  },
  {
    id: 'F054',
    title: 'Flare Metrics Charts',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Medium',
    effort: '4-5 hours',
    overview: 'Visualize flare metrics: total flares, average duration, severity trends, resolution rates.',
    requirements: 'Line charts for flares over time. Bar charts for average duration by region. Trend indicators.',
    files: 'components/Analytics/FlareMetrics.tsx, lib/analytics/calculateFlareMetrics.ts',
    dbOps: 'Aggregate flares by date, region. Calculate averages.',
    acceptance: [
      'Total flares count (active vs resolved)',
      'Flares over time chart (line)',
      'Average flare duration by region (bar)',
      'Severity trends (improving/worsening)',
      'Intervention effectiveness chart',
      'Date range selector',
      'Export flare metrics'
    ],
    dependencies: 'Flare management (F024-F028)',
    specRef: 'F-009: Analytics Dashboard - Flare metrics'
  },
  {
    id: 'F055',
    title: 'Symptom Trends Visualization',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Medium',
    effort: '4-5 hours',
    overview: 'Charts showing symptom frequency and severity trends over time.',
    requirements: 'Line charts for symptom frequency. Severity trend lines. Compare multiple symptoms.',
    files: 'components/Analytics/SymptomTrends.tsx',
    dbOps: 'Query SymptomInstance, group by symptom and date, aggregate severity.',
    acceptance: [
      'Symptom frequency over time (line chart)',
      'Severity trends per symptom',
      'Compare multiple symptoms (multi-line)',
      'Most frequent symptoms list',
      'Time-of-day pattern analysis',
      'Day-of-week pattern analysis',
      'Date range selector'
    ],
    dependencies: 'Symptom tracking (F029-F031)',
    specRef: 'F-009: Analytics Dashboard - Symptom analytics'
  },
  {
    id: 'F056',
    title: 'Trigger Impact Analysis',
    status: 'TODO',
    priority: 'LOW',
    complexity: 'Medium',
    effort: '4-5 hours',
    overview: 'Analyze which triggers correlate with increased symptoms or flares.',
    requirements: 'Calculate correlation between trigger events and symptom/flare occurrences. Rank triggers by impact.',
    files: 'components/Analytics/TriggerImpact.tsx, lib/analytics/analyzeTriggerImpact.ts',
    dbOps: 'Correlate TriggerEvent timestamps with SymptomInstance and Flare creation times.',
    acceptance: [
      'List of triggers ranked by impact',
      'Shows: trigger name, correlation strength, occurrences',
      'Timeline showing trigger vs symptom correlation',
      'Most impactful triggers highlighted',
      'Avoidance recommendations',
      'Filter by symptom type'
    ],
    dependencies: 'Trigger tracking (F037-F038)',
    specRef: 'F-009: Analytics Dashboard - Trigger impact'
  },

  // DATA EXPORT (F057-F062)
  {
    id: 'F057',
    title: 'JSON Export (Full Backup)',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Medium',
    effort: '3-4 hours',
    overview: 'Export complete database as JSON file for backup and migration.',
    requirements: 'Export all tables (users, flares, symptoms, medications, foods, etc.). Include encryption keys for photos.',
    files: 'lib/export/exportJSON.ts',
    dbOps: 'Read all tables from database, serialize to JSON.',
    acceptance: [
      'Exports all database tables',
      'Includes encryption keys',
      'Valid JSON format',
      'Includes metadata (export date, version)',
      'Download as .json file',
      'File size indicator',
      'Can be used for data migration'
    ],
    dependencies: 'Database schema (F003✅)',
    specRef: 'Data Retention Rules: Export & Backup'
  },
  {
    id: 'F058',
    title: 'CSV Export',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Low',
    effort: '3-4 hours',
    overview: 'Export specific data types to CSV format for spreadsheet analysis.',
    requirements: 'Export symptoms, medications, foods, flares, daily entries separately as CSV. User selects which tables.',
    files: 'lib/export/exportCSV.ts',
    dbOps: 'Query selected tables, format as CSV.',
    acceptance: [
      'Select which tables to export',
      'Date range filter',
      'Proper CSV formatting',
      'Column headers included',
      'Download as .csv file',
      'Opens in Excel/Google Sheets',
      'Supports large datasets'
    ],
    dependencies: 'Database schema (F003✅)',
    specRef: 'F-010: Data Export & Sharing - CSV export'
  },
  {
    id: 'F059',
    title: 'PDF Medical Report Generator',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'High',
    effort: '8-10 hours',
    overview: 'Generate formatted PDF medical report for healthcare providers.',
    requirements: 'Professional formatting. Includes patient info, flare history, symptom logs, medication adherence, correlations.',
    files: 'lib/export/generatePDF.ts, templates/medicalReport.ts',
    dbOps: 'Aggregate all relevant data for date range.',
    acceptance: [
      'Professional medical report format',
      'Patient information section',
      'Executive summary',
      'Flare history with charts',
      'Symptom log summary',
      'Medication adherence report',
      'Food-symptom correlations',
      'Problem areas analysis',
      'Optionally include photos',
      'Download as PDF',
      'Print-ready formatting'
    ],
    dependencies: 'All tracking features',
    specRef: 'Workflow 8: Exporting Data for Medical Consultation'
  },
  {
    id: 'F060',
    title: 'Flare Summary PDF',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Medium',
    effort: '4-5 hours',
    overview: 'Generate PDF report focused on flare history and progression.',
    requirements: 'Flare timeline, severity charts, body map visualization, intervention effectiveness.',
    files: 'lib/export/flareSummaryPDF.ts',
    dbOps: 'Query flares and flareEvents, format for PDF.',
    acceptance: [
      'Flare summary statistics',
      'Body map with flare locations',
      'Flare timeline chart',
      'Severity progression charts',
      'Intervention effectiveness table',
      'Problem areas heat map',
      'Date range selector',
      'Download as PDF'
    ],
    dependencies: 'Flare management (F024-F028)',
    specRef: 'F-010: Data Export & Sharing - Flare summary report'
  },
  {
    id: 'F061',
    title: 'Correlation Analysis PDF',
    status: 'TODO',
    priority: 'LOW',
    complexity: 'Medium',
    effort: '4-5 hours',
    overview: 'PDF report of food-symptom correlations with charts and recommendations.',
    requirements: 'Correlation tables, charts, statistical details, dietary recommendations.',
    files: 'lib/export/correlationPDF.ts',
    dbOps: 'Query correlation results, format for PDF.',
    acceptance: [
      'Top positive correlations table',
      'Top negative correlations table',
      'Synergistic combinations',
      'Correlation strength charts',
      'Statistical details (p-value, sample size)',
      'Dietary recommendations',
      'Download as PDF'
    ],
    dependencies: 'Correlation reports (F052-F053)',
    specRef: 'F-010: Data Export & Sharing - Correlation report'
  },
  {
    id: 'F062',
    title: 'Data Import Functionality',
    status: 'TODO',
    priority: 'LOW',
    complexity: 'High',
    effort: '6-8 hours',
    overview: 'Import data from JSON backup file. Validate and merge with existing data.',
    requirements: 'Parse JSON backup. Validate schema. Handle GUID conflicts. Merge or replace data.',
    files: 'lib/import/importJSON.ts',
    dbOps: 'Parse JSON, validate, insert into database with conflict resolution.',
    acceptance: [
      'Upload JSON file',
      'Validate file format',
      'Schema version check',
      'Handle GUID conflicts',
      'Merge option (keep existing)',
      'Replace option (overwrite)',
      'Progress indicator',
      'Error handling and rollback',
      'Success confirmation',
      'Import summary (records added)'
    ],
    dependencies: 'JSON export (F057)',
    specRef: 'F-010: Data Export & Sharing - Data import'
  },

  // SETTINGS (F063-F067)
  {
    id: 'F063',
    title: 'Settings Page Layout',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Low',
    effort: '3-4 hours',
    overview: 'Main settings page with organized sections for preferences, privacy, data management.',
    requirements: 'Sectioned layout with navigation. Theme, notifications, privacy, data, about.',
    files: 'app/settings/page.tsx, components/Settings/SettingsSection.tsx',
    dbOps: 'Query and update User preferences.',
    acceptance: [
      'Organized settings sections',
      'Theme settings',
      'Notification settings',
      'Privacy settings',
      'Data management',
      'About section (version, license)',
      'Search settings',
      'Responsive layout'
    ],
    dependencies: 'Database schema (F003✅)',
    specRef: 'User preferences and settings'
  },
  {
    id: 'F064',
    title: 'Theme Settings',
    status: 'TODO',
    priority: 'LOW',
    complexity: 'Low',
    effort: '2-3 hours',
    overview: 'Theme selector: light, dark, or system preference.',
    requirements: 'Radio buttons for theme selection. Preview. Persist to database. Apply immediately.',
    files: 'components/Settings/ThemeSelector.tsx',
    dbOps: 'Update User.theme.',
    acceptance: [
      'Light theme option',
      'Dark theme option',
      'System preference option',
      'Theme preview',
      'Immediate application',
      'Persists to database',
      'Works across all pages'
    ],
    dependencies: 'Database schema (F003✅)',
    specRef: 'User preferences - Theme'
  },
  {
    id: 'F065',
    title: 'Notification Preferences',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Medium',
    effort: '3-4 hours',
    overview: 'Configure notification settings for medication reminders, daily reflection prompts.',
    requirements: 'Enable/disable notifications. Set reminder times. Configure notification sounds.',
    files: 'components/Settings/NotificationSettings.tsx',
    dbOps: 'Update User.notificationSettings.',
    acceptance: [
      'Enable/disable all notifications',
      'Medication reminder settings',
      'Daily reflection reminder',
      'Notification sound options',
      'Quiet hours configuration',
      'Test notification button',
      'Permission request if needed'
    ],
    dependencies: 'Database schema (F003✅)',
    specRef: 'User preferences - Notification settings'
  },
  {
    id: 'F066',
    title: 'Privacy Settings & Data Management',
    status: 'TODO',
    priority: 'MEDIUM',
    complexity: 'Medium',
    effort: '4-5 hours',
    overview: 'Privacy controls and data management options. View data storage size, clear cache, export data.',
    requirements: 'Show storage usage. Clear photo cache. View privacy policy. Data retention settings.',
    files: 'components/Settings/PrivacySettings.tsx',
    dbOps: 'Calculate database size, clear cached data.',
    acceptance: [
      'Display total data size',
      'Storage breakdown by type',
      'Clear photo cache button',
      'Clear all data (confirmation required)',
      'Privacy policy link',
      'Data retention settings',
      'UX analytics opt-in/out',
      'View stored data inventory'
    ],
    dependencies: 'Database schema (F003✅)',
    specRef: 'PS-006: Secure Data Deletion'
  },
  {
    id: 'F067',
    title: 'Account Deletion Workflow',
    status: 'TODO',
    priority: 'LOW',
    complexity: 'Medium',
    effort: '3-4 hours',
    overview: 'Permanently delete all user data with confirmation and warning.',
    requirements: 'Multi-step confirmation. Warning about data loss. Delete all database records. Reset app.',
    files: 'components/Settings/DeleteAccount.tsx, lib/settings/deleteAllData.ts',
    dbOps: 'Delete all records from all tables. Clear IndexedDB.',
    acceptance: [
      'Clear warning message',
      'Multi-step confirmation',
      'Type "DELETE" to confirm',
      'Deletes all database records',
      'Deletes all photos and encryption keys',
      'No recovery possible',
      'Redirects to onboarding after deletion',
      'Export data option before deletion'
    ],
    dependencies: 'Database schema (F003✅)',
    specRef: 'PS-006: Secure Data Deletion - Hard deletes'
  }
]

// Generate feature documents
const featuresDir = path.join(__dirname, 'features')

features.forEach(feature => {
  const content = `# ${feature.id} - ${feature.title}

**Status:** 🚀 ${feature.status}
**Priority:** ${feature.priority}
**Complexity:** ${feature.complexity}
**Estimated Effort:** ${feature.effort}

---

## Overview

${feature.overview}

---

## Requirements (from spec)

${feature.requirements}

---

## Technical Approach

### File Structure
\`\`\`
${feature.files}
\`\`\`

### Database Operations
${feature.dbOps}

---

## Acceptance Criteria

${feature.acceptance.map(c => `- [ ] ${c}`).join('\n')}

---

## Dependencies

${feature.dependencies}

---

## References

- Specification: ${feature.specRef}
`

  const filename = path.join(featuresDir, `${feature.id}-${feature.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`)
  fs.writeFileSync(filename, content)
  console.log(`Created ${filename}`)
})

console.log(`\n✅ Generated ${features.length} feature documents`)
