'use client'

import { BodyMapLocation, Symptom } from '@/lib/db'
import { getSeverityColor } from '@/lib/bodyMap/coordinateUtils'
import { VIEW_BOX } from '@/lib/bodyMap/bodyMapSVGs'

interface SymptomMarkerProps {
  location: BodyMapLocation
  symptom?: Symptom
  onClick?: (location: BodyMapLocation) => void
}

export function SymptomMarker({ location, symptom, onClick }: SymptomMarkerProps) {
  const severityColor = getSeverityColor(location.severity)
  const x = location.coordinateX * VIEW_BOX.width
  const y = location.coordinateY * VIEW_BOX.height

  return (
    <g
      onClick={() => onClick?.(location)}
      className={onClick ? 'cursor-pointer' : ''}
      role="button"
      aria-label={`${symptom?.name || 'Symptom'} at ${location.bodyRegion}, severity ${location.severity}`}
    >
      {/* Outer pulse ring */}
      <circle
        cx={x}
        cy={y}
        r={14}
        fill={severityColor}
        opacity={0.2}
      />
      {/* Inner circle */}
      <circle
        cx={x}
        cy={y}
        r={10}
        fill={severityColor}
        stroke="white"
        strokeWidth={2}
        className="transition-all hover:r-12"
      />
      {/* Severity number */}
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize={10}
        fontWeight="bold"
      >
        {location.severity}
      </text>
      {/* Tooltip */}
      <title>
        {symptom?.name || 'Symptom'}
        {'\n'}
        Location: {location.bodyRegion}
        {'\n'}
        Severity: {location.severity}/10
        {'\n'}
        {new Date(location.timestamp).toLocaleString()}
      </title>
    </g>
  )
}

interface SymptomMarkersLayerProps {
  locations: BodyMapLocation[]
  symptomsMap: Map<string, Symptom>
  onMarkerClick?: (location: BodyMapLocation) => void
  filterSymptomId?: string
}

export function SymptomMarkersLayer({
  locations,
  symptomsMap,
  onMarkerClick,
  filterSymptomId,
}: SymptomMarkersLayerProps) {
  const filteredLocations = filterSymptomId
    ? locations.filter((loc) => loc.symptomId === filterSymptomId)
    : locations

  return (
    <g role="group" aria-label="Symptom markers">
      {filteredLocations.map((location) => (
        <SymptomMarker
          key={location.guid}
          location={location}
          symptom={symptomsMap.get(location.symptomId)}
          onClick={onMarkerClick}
        />
      ))}
    </g>
  )
}
