'use client'

import { Suspense, useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { Canvas, ThreeEvent, useFrame } from '@react-three/fiber'
import { useGLTF, Html, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { HS_REGIONS_3D, Region3D, getRotationForRegion } from '@/lib/bodyMap/regions3D'
import { get3DPositionForLesion, Position3D } from '@/lib/bodyMap/regionMapping'
import type { HSLesion, LesionType, LESION_DISPLAY_CONFIG } from '@/lib/hs/types'

// Lesion marker colors (colorblind-safe palette matching 2D)
const LESION_COLORS: Record<LesionType, string> = {
  nodule: '#E69F00',        // Orange
  abscess: '#CC79A7',       // Pink/Magenta
  draining_tunnel: '#882255', // Purple
}

// Custom shader material that highlights regions on the body surface
// Uses LOCAL position (not world) so regions rotate with the model
const regionHighlightVertexShader = `
  varying vec3 vLocalPosition;
  varying vec3 vNormal;

  void main() {
    // Pass the raw local position - this stays fixed relative to the mesh
    vLocalPosition = position;
    vNormal = normalMatrix * normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const regionHighlightFragmentShader = `
  uniform vec3 baseColor;
  uniform vec3 regionColors[16];
  uniform vec3 regionPositions[16];
  uniform float regionRadii[16];
  uniform int regionCount;
  uniform int highlightedRegion;
  uniform float time;

  varying vec3 vLocalPosition;
  varying vec3 vNormal;

  void main() {
    // Base body color with simple lighting
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.5));
    float light = max(dot(normalize(vNormal), lightDir), 0.0) * 0.6 + 0.4;
    vec3 color = baseColor * light;


    // Check each region and blend colors
    for (int i = 0; i < 16; i++) {
      if (i >= regionCount) break;

      float dist = distance(vLocalPosition, regionPositions[i]);
      float radius = regionRadii[i];

      if (dist < radius) {
        // Soft falloff from center
        float strength = 1.0 - smoothstep(0.0, radius, dist);

        // Pulse effect for highlighted region
        float pulse = 1.0;
        if (i == highlightedRegion) {
          pulse = 0.8 + 0.2 * sin(time * 3.0);
          strength = min(strength * 1.5, 1.0);
        }

        // Blend region color with base - make it more visible
        color = mix(color, regionColors[i] * pulse, strength * 0.85);
      }
    }

    gl_FragColor = vec4(color, 1.0);
  }
`

/**
 * 3D Lesion Marker component
 * Renders a lesion as a colored sphere on the body surface
 */
interface LesionMarker3DProps {
  lesion: HSLesion
  position: Position3D
  isSelected?: boolean
  onClick?: () => void
}

function LesionMarker3D({ lesion, position, isSelected, onClick }: LesionMarker3DProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const color = LESION_COLORS[lesion.lesionType]
  const baseSize = 0.025
  const size = isSelected ? baseSize * 1.3 : baseSize

  // Pulse animation for selected lesion
  useFrame((state) => {
    if (meshRef.current && isSelected) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.15
      meshRef.current.scale.setScalar(scale)
    }
  })

  // Different shapes for different lesion types
  const geometry = useMemo(() => {
    switch (lesion.lesionType) {
      case 'nodule':
        return new THREE.SphereGeometry(size, 16, 16)
      case 'abscess':
        // Slightly larger, irregular shape
        return new THREE.SphereGeometry(size * 1.2, 12, 12)
      case 'draining_tunnel':
        // Elongated capsule shape
        return new THREE.CapsuleGeometry(size * 0.8, size * 0.6, 8, 8)
      default:
        return new THREE.SphereGeometry(size, 16, 16)
    }
  }, [lesion.lesionType, size])

  return (
    <mesh
      ref={meshRef}
      position={[position.x, position.z, position.y]} // Swap Y/Z for Three.js coordinate system
      geometry={geometry}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
    >
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={isSelected ? 0.5 : 0.2}
        roughness={0.4}
        metalness={0.1}
      />
    </mesh>
  )
}

/**
 * Lesion markers container - renders all lesions
 */
interface LesionMarkersProps {
  lesions: HSLesion[]
  selectedLesionId?: string | null
  onLesionClick?: (lesion: HSLesion) => void
  modelOffset: THREE.Vector3
}

function LesionMarkers({ lesions, selectedLesionId, onLesionClick, modelOffset }: LesionMarkersProps) {
  // Compute 3D positions for all lesions
  const lesionPositions = useMemo(() => {
    return lesions.map(lesion => {
      // If lesion already has 3D position, use it
      if (lesion.coordinates.position3D) {
        return {
          lesion,
          position: lesion.coordinates.position3D,
        }
      }

      // Otherwise compute from 2D coordinates
      const position = get3DPositionForLesion(lesion.regionId, {
        x: lesion.coordinates.x,
        y: lesion.coordinates.y,
      })

      return {
        lesion,
        position,
      }
    }).filter(item => item.position !== null) as { lesion: HSLesion; position: Position3D }[]
  }, [lesions])

  return (
    <group position={[-modelOffset.x, -modelOffset.y, -modelOffset.z]}>
      {lesionPositions.map(({ lesion, position }) => (
        <LesionMarker3D
          key={lesion.guid}
          lesion={lesion}
          position={position}
          isSelected={lesion.guid === selectedLesionId}
          onClick={() => onLesionClick?.(lesion)}
        />
      ))}
    </group>
  )
}

interface HumanModelProps {
  onRegionClick?: (region: Region3D) => void
  onLoaded?: (modelHeight: number, modelOffset: THREE.Vector3) => void
  rotation: number
  zoom: number
  highlightedRegion?: string | null
  lesions?: HSLesion[]
  selectedLesionId?: string | null
  onLesionClick?: (lesion: HSLesion) => void
}

function HumanModel({
  onRegionClick,
  onLoaded,
  rotation,
  zoom,
  highlightedRegion,
  lesions = [],
  selectedLesionId,
  onLesionClick,
}: HumanModelProps) {
  const { scene } = useGLTF('/models/female_base_mesh.glb')
  const groupRef = useRef<THREE.Group>(null)
  const materialRef = useRef<THREE.ShaderMaterial | null>(null)
  const clickMeshRef = useRef<THREE.Mesh>(null)
  const [model, setModel] = useState<THREE.Object3D | null>(null)
  const [offset, setOffset] = useState<THREE.Vector3>(new THREE.Vector3())
  const [modelBounds, setModelBounds] = useState<{ min: THREE.Vector3; max: THREE.Vector3; size: THREE.Vector3 } | null>(null)

  // Create shader material with region highlighting
  const shaderMaterial = useMemo(() => {
    // Convert region data to shader uniforms
    const regionColors: THREE.Vector3[] = []
    const regionPositions: THREE.Vector3[] = []
    const regionRadii: number[] = []

    HS_REGIONS_3D.forEach(region => {
      const color = new THREE.Color(region.color)
      regionColors.push(new THREE.Vector3(color.r, color.g, color.b))
      regionPositions.push(region.position.clone())
      regionRadii.push(region.radius)
    })

    // Pad arrays to 16 elements (shader expects fixed size)
    while (regionColors.length < 16) {
      regionColors.push(new THREE.Vector3(0, 0, 0))
      regionPositions.push(new THREE.Vector3(0, 0, 0))
      regionRadii.push(0)
    }

    const material = new THREE.ShaderMaterial({
      vertexShader: regionHighlightVertexShader,
      fragmentShader: regionHighlightFragmentShader,
      uniforms: {
        baseColor: { value: new THREE.Vector3(0.75, 0.7, 0.68) }, // Skin tone
        regionColors: { value: regionColors },
        regionPositions: { value: regionPositions },
        regionRadii: { value: regionRadii },
        regionCount: { value: HS_REGIONS_3D.length },
        highlightedRegion: { value: -1 },
        time: { value: 0 },
      },
    })

    materialRef.current = material
    return material
  }, [])

  // Update highlighted region uniform
  useEffect(() => {
    if (materialRef.current) {
      const index = highlightedRegion
        ? HS_REGIONS_3D.findIndex(r => r.id === highlightedRegion)
        : -1
      materialRef.current.uniforms.highlightedRegion.value = index
    }
  }, [highlightedRegion])

  // Animate time uniform for pulse effect
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime
    }
  })

  useEffect(() => {
    if (scene) {
      const clonedScene = scene.clone()

      // Calculate the center and size of the model
      const box = new THREE.Box3().setFromObject(clonedScene)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      const min = box.min.clone()
      const max = box.max.clone()

      // Apply the shader material to all meshes
      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = shaderMaterial
        }
      })

      setOffset(center)
      setModelBounds({ min, max, size })
      setModel(clonedScene)
      onLoaded?.(size.y, center)
    }
  }, [scene, onLoaded, shaderMaterial])

  // Handle click - detect which region was clicked
  // With fixed views, we know exactly what angle we're at, simplifying the math
  const handleClick = useCallback((event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()

    if (!modelBounds) return

    // Get the click point in world space
    const clickPoint = event.point.clone()

    // Determine which fixed view we're closest to
    const currentViewAngle = getClosestView(rotation)

    // Get current zoom level for predictable coordinate math
    const zoomLevel = getClosestZoom(zoom)
    const actualZoom = ZOOM_LEVELS[zoomLevel]

    // Debug logging for coordinate troubleshooting
    console.log(`Click: view=${currentViewAngle}, zoom=${zoomLevel}, clickPt=(${clickPoint.x.toFixed(2)}, ${clickPoint.y.toFixed(2)}), offset=(${offset.x.toFixed(2)}, ${offset.y.toFixed(2)}, ${offset.z.toFixed(2)})`)

    // Step 1: Undo group scale using the fixed zoom level value
    // This ensures consistent behavior at each zoom level
    const unscaledPoint = clickPoint.clone().divideScalar(actualZoom)

    // Step 2: Map click coordinates to model local coordinates based on view
    //
    // Three.js world (after capsule rotation + group rotation):
    //   - Click X = horizontal on screen (left-right)
    //   - Click Y = vertical on screen (up-down)
    //   - Click Z = depth (toward/away from camera)
    //
    // Model file coordinates (used in regions3D.ts):
    //   - Model X = left-right (same as click X from front)
    //   - Model Y = front-back depth
    //   - Model Z = vertical height (0=feet, 2=head)
    //
    // offset.y = ~1.0 (model vertical center in Three.js Y)
    // Click Y maps to model Z (height)
    // Click X maps to model X or model Y depending on view rotation

    let localX: number, localY: number, localZ: number

    // Click Y (screen vertical) → Model Z (height)
    // unscaledPoint.y is in range roughly -0.2 to 0.2 (after /zoom)
    // offset.y is ~1.0 (model vertical center)
    // Model Z should be in range 0-2, with 1.0 at center
    localZ = unscaledPoint.y + offset.y  // This gives us height in model coords

    // Map X based on which view we're at
    switch (currentViewAngle) {
      case 'front':
        // Looking at front: click X = model X (left-right), model Y = front surface
        localX = unscaledPoint.x + offset.x
        localY = 0.08  // Assume front surface (positive Y in model = front)
        break
      case 'back':
        // Looking at back: click X = -model X (mirrored), model Y = back surface
        localX = -unscaledPoint.x + offset.x
        localY = -0.12  // Assume back surface (negative Y in model = back)
        break
      case 'left':
        // Looking at left side: click X maps to model Y (depth/front-back)
        // Left side of body = positive X in model coords
        localX = 0.18  // Left armpit is at x=0.18
        localY = -unscaledPoint.x  // Click X (screen left-right) = model Y (front-back), negated
        break
      case 'right':
        // Looking at right side: click X maps to model Y (depth/front-back)
        // Right side of body = negative X in model coords
        localX = -0.18  // Right armpit is at x=-0.18
        localY = unscaledPoint.x  // Click X (screen left-right) = model Y (front-back)
        break
    }

    const localPoint = new THREE.Vector3(localX, localY, localZ)
    console.log(`  -> localPt=(${localX.toFixed(2)}, ${localY.toFixed(2)}, ${localZ.toFixed(2)})`)

    // Find which region was clicked
    // Only consider regions visible from current view
    let closestRegion: Region3D | null = null
    let closestDistance = Infinity

    for (const region of HS_REGIONS_3D) {
      // Filter by view - only match regions visible from current angle
      const regionVisible = (
        (currentViewAngle === 'front' && (region.side === 'front' || region.side === 'left' || region.side === 'right')) ||
        (currentViewAngle === 'back' && (region.side === 'back' || region.side === 'left' || region.side === 'right')) ||
        (currentViewAngle === 'left' && (region.side === 'left' || region.side === 'front' || region.side === 'back')) ||
        (currentViewAngle === 'right' && (region.side === 'right' || region.side === 'front' || region.side === 'back'))
      )

      if (!regionVisible) continue

      const regionPos = region.position
      // For matching, primarily compare height (Z) and the axis perpendicular to view
      const distance = localPoint.distanceTo(regionPos)
      const hitRadius = region.radius * 3 // Larger hit area for easier selection

      if (distance < hitRadius && distance < closestDistance) {
        closestDistance = distance
        closestRegion = region
      }
    }

    if (closestRegion) {
      console.log(`Selected: ${closestRegion.name}`)
      onRegionClick?.(closestRegion)
    }
  }, [modelBounds, offset, onRegionClick, zoom, rotation])

  if (!model || !modelBounds) return null

  return (
    <group ref={groupRef} rotation={[0, rotation, 0]} scale={zoom}>
      {/* The body model with shader material */}
      <primitive
        object={model}
        position={[-offset.x, -offset.y, -offset.z]}
      />

      {/* Invisible box mesh for click detection - covers full body including arms/sides */}
      {/* Box dimensions: width=0.8 (covers arms), depth=0.5 (front-back), height=2.0 (full body) */}
      <mesh
        ref={clickMeshRef}
        position={[0, 0, 0]}
        onClick={handleClick}
      >
        <boxGeometry args={[0.8, 2.0, 0.5]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Lesion markers */}
      {lesions.length > 0 && (
        <LesionMarkers
          lesions={lesions}
          selectedLesionId={selectedLesionId}
          onLesionClick={onLesionClick}
          modelOffset={offset}
        />
      )}
    </group>
  )
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto mb-2"></div>
        <p className="text-gray-400 text-sm">Loading model...</p>
      </div>
    </Html>
  )
}

interface BodyMap3DProps {
  className?: string
  onRegionSelect?: (region: Region3D) => void
  lesions?: HSLesion[]
  selectedLesionId?: string | null
  onLesionClick?: (lesion: HSLesion) => void
}

// Fixed view angles (in radians) - model faces -Z, so PI = front view
type ViewName = 'front' | 'right' | 'back' | 'left'
const VIEW_ANGLES: Record<ViewName, number> = {
  front: Math.PI,           // 180° - model facing camera
  right: Math.PI / 2,       // 90° - right side visible
  back: 0,                  // 0° - back visible
  left: 3 * Math.PI / 2,    // 270° - left side visible
}

const VIEW_ORDER: ViewName[] = ['front', 'right', 'back', 'left']

// Fixed zoom levels - discrete steps for predictable coordinate math
type ZoomLevel = 'overview' | 'regional' | 'detail'
const ZOOM_LEVELS: Record<ZoomLevel, number> = {
  overview: 4.5,    // Full body visible
  regional: 6,      // Regional focus
  detail: 7.5,      // Close-up detail
}

const ZOOM_ORDER: ZoomLevel[] = ['overview', 'regional', 'detail']

function getClosestZoom(zoom: number): ZoomLevel {
  let closest: ZoomLevel = 'overview'
  let minDiff = Infinity

  for (const [name, value] of Object.entries(ZOOM_LEVELS)) {
    const diff = Math.abs(zoom - value)
    if (diff < minDiff) {
      minDiff = diff
      closest = name as ZoomLevel
    }
  }

  return closest
}

function getNextZoom(current: ZoomLevel, direction: 'in' | 'out'): ZoomLevel {
  const currentIndex = ZOOM_ORDER.indexOf(current)
  if (direction === 'in') {
    return ZOOM_ORDER[Math.min(currentIndex + 1, ZOOM_ORDER.length - 1)]
  } else {
    return ZOOM_ORDER[Math.max(currentIndex - 1, 0)]
  }
}

function getClosestView(rotation: number): ViewName {
  // Normalize rotation to 0-2PI
  const normalized = ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)

  let closest: ViewName = 'front'
  let minDiff = Infinity

  for (const [name, angle] of Object.entries(VIEW_ANGLES)) {
    // Calculate angular difference (handle wraparound)
    let diff = Math.abs(normalized - angle)
    if (diff > Math.PI) diff = 2 * Math.PI - diff

    if (diff < minDiff) {
      minDiff = diff
      closest = name as ViewName
    }
  }

  return closest
}

function getNextView(current: ViewName, direction: 'left' | 'right'): ViewName {
  const currentIndex = VIEW_ORDER.indexOf(current)
  const nextIndex = direction === 'right'
    ? (currentIndex + 1) % 4
    : (currentIndex + 3) % 4  // +3 is same as -1 in mod 4
  return VIEW_ORDER[nextIndex]
}

export function BodyMap3D({
  className = '',
  onRegionSelect,
  lesions = [],
  selectedLesionId,
  onLesionClick,
}: BodyMap3DProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState<ViewName>('front')
  const [rotation, setRotation] = useState(VIEW_ANGLES.front)
  const [targetRotation, setTargetRotation] = useState<number | null>(null)
  const [currentZoomLevel, setCurrentZoomLevel] = useState<ZoomLevel>('overview')
  const [zoom, setZoom] = useState(ZOOM_LEVELS.overview)
  const [targetZoom, setTargetZoom] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [lastX, setLastX] = useState(0)
  const [selectedRegion, setSelectedRegion] = useState<Region3D | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Navigate to a specific zoom level
  const navigateToZoom = useCallback((level: ZoomLevel) => {
    setCurrentZoomLevel(level)
    setTargetZoom(ZOOM_LEVELS[level])
  }, [])

  // Handle wheel zoom with snap to discrete levels
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let scrollTimeout: NodeJS.Timeout | null = null

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()

      // Update zoom freely while scrolling
      setTargetZoom(null)
      setZoom(prev => Math.max(3, Math.min(9, prev - e.deltaY * 0.008)))

      // Clear existing timeout
      if (scrollTimeout) clearTimeout(scrollTimeout)

      // Snap to nearest level after scrolling stops
      scrollTimeout = setTimeout(() => {
        setZoom(prev => {
          const closestLevel = getClosestZoom(prev)
          setCurrentZoomLevel(closestLevel)
          setTargetZoom(ZOOM_LEVELS[closestLevel])
          return prev
        })
      }, 150)
    }

    // Add as non-passive to allow preventDefault
    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      container.removeEventListener('wheel', handleWheel)
      if (scrollTimeout) clearTimeout(scrollTimeout)
    }
  }, [])

  // Animate rotation with proper wraparound handling
  useEffect(() => {
    if (targetRotation !== null) {
      const animate = () => {
        setRotation(prev => {
          // Find the shortest path around the circle
          let diff = targetRotation - prev

          // Handle wraparound (take shortest path)
          if (diff > Math.PI) diff -= 2 * Math.PI
          if (diff < -Math.PI) diff += 2 * Math.PI

          if (Math.abs(diff) < 0.01) {
            setTargetRotation(null)
            // Normalize to 0-2PI range
            return ((targetRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
          }
          return prev + diff * 0.15  // Slightly faster animation
        })
      }
      const id = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(id)
    }
  }, [targetRotation, rotation])

  // Navigate to a specific view
  const navigateToView = useCallback((view: ViewName) => {
    setCurrentView(view)
    setTargetRotation(VIEW_ANGLES[view])
  }, [])

  // Navigate to next/previous view
  const navigateDirection = useCallback((direction: 'left' | 'right') => {
    const nextView = getNextView(currentView, direction)
    navigateToView(nextView)
  }, [currentView, navigateToView])

  // Keyboard navigation for rotation and zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        navigateDirection('left')
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        navigateDirection('right')
      } else if (e.key === '+' || e.key === '=' || e.key === 'ArrowUp') {
        e.preventDefault()
        const nextLevel = getNextZoom(currentZoomLevel, 'in')
        navigateToZoom(nextLevel)
      } else if (e.key === '-' || e.key === '_' || e.key === 'ArrowDown') {
        e.preventDefault()
        const nextLevel = getNextZoom(currentZoomLevel, 'out')
        navigateToZoom(nextLevel)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigateDirection, currentZoomLevel, navigateToZoom])

  useEffect(() => {
    if (targetZoom !== null) {
      const animate = () => {
        setZoom(prev => {
          const diff = targetZoom - prev
          if (Math.abs(diff) < 0.01) {
            setTargetZoom(null)
            return targetZoom
          }
          return prev + diff * 0.1
        })
      }
      const id = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(id)
    }
  }, [targetZoom, zoom])

  const handleModelLoaded = () => {
    setIsLoading(false)
  }

  const handleRegionClick = (region: Region3D) => {
    setSelectedRegion(region)

    // Rotate to face the region
    const targetRot = getRotationForRegion(region)
    setTargetRotation(targetRot)

    // Zoom to regional level
    navigateToZoom('regional')

    // Notify parent
    onRegionSelect?.(region)
  }

  // Track if we actually dragged (vs just clicked)
  const [hasDragged, setHasDragged] = useState(false)
  const [pointerDownPos, setPointerDownPos] = useState<{ x: number; y: number } | null>(null)

  // Mouse/touch handlers for rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    // Don't capture - let Three.js also receive events
    setIsDragging(true)
    setHasDragged(false)
    setLastX(e.clientX)
    setPointerDownPos({ x: e.clientX, y: e.clientY })
    setTargetRotation(null) // Cancel any animation
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    const deltaX = e.clientX - lastX

    // Only count as drag if moved more than 5 pixels
    if (pointerDownPos) {
      const totalMove = Math.abs(e.clientX - pointerDownPos.x) + Math.abs(e.clientY - pointerDownPos.y)
      if (totalMove > 5) {
        setHasDragged(true)
      }
    }

    setRotation(prev => prev + deltaX * 0.01)
    setLastX(e.clientX)
  }

  const handlePointerUp = () => {
    setIsDragging(false)
    setPointerDownPos(null)

    // Snap to nearest view on release
    if (hasDragged) {
      const closestView = getClosestView(rotation)
      navigateToView(closestView)
    }
  }

  // Count lesions by type for legend
  const lesionCounts = useMemo(() => {
    const counts = { nodule: 0, abscess: 0, draining_tunnel: 0 }
    lesions.forEach(l => {
      if (l.status === 'active' || l.status === 'healing') {
        counts[l.lesionType]++
      }
    })
    return counts
  }, [lesions])

  const totalLesions = lesionCounts.nodule + lesionCounts.abscess + lesionCounts.draining_tunnel

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ touchAction: 'none', cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-10 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading 3D model...</p>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 15], fov: 50 }}
        className="rounded-lg"
        style={{ height: '600px', background: 'linear-gradient(to bottom, #1e293b, #0f172a)' }}
        onPointerMissed={() => { /* Empty space clicked */ }}
        onPointerDown={(e) => {
          setIsDragging(true)
          setHasDragged(false)
          setLastX(e.clientX)
          setPointerDownPos({ x: e.clientX, y: e.clientY })
          setTargetRotation(null)
        }}
        onPointerMove={(e) => {
          if (!isDragging) return
          const deltaX = e.clientX - lastX
          if (pointerDownPos) {
            const totalMove = Math.abs(e.clientX - pointerDownPos.x) + Math.abs(e.clientY - pointerDownPos.y)
            if (totalMove > 5) setHasDragged(true)
          }
          setRotation(prev => prev + deltaX * 0.01)
          setLastX(e.clientX)
        }}
        onPointerUp={() => {
          const wasD = hasDragged
          setIsDragging(false)
          setPointerDownPos(null)
          // Snap to nearest view on release
          if (wasD) {
            const closestView = getClosestView(rotation)
            navigateToView(closestView)
          }
        }}
        onPointerLeave={() => {
          const wasD = hasDragged
          setIsDragging(false)
          setPointerDownPos(null)
          // Snap to nearest view on leave
          if (wasD) {
            const closestView = getClosestView(rotation)
            navigateToView(closestView)
          }
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} />
        <directionalLight position={[-5, 10, -5]} intensity={1} />
        <directionalLight position={[0, -5, 5]} intensity={0.5} />

        {/* The 3D Human Model */}
        <Suspense fallback={<LoadingFallback />}>
          <HumanModel
            onLoaded={handleModelLoaded}
            onRegionClick={handleRegionClick}
            rotation={rotation}
            zoom={zoom}
            highlightedRegion={selectedRegion?.id}
            lesions={lesions.filter(l => l.status === 'active' || l.status === 'healing')}
            selectedLesionId={selectedLesionId}
            onLesionClick={onLesionClick}
          />
        </Suspense>
      </Canvas>

      {/* View Navigation Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
        {/* Left arrow */}
        <button
          onClick={() => navigateDirection('left')}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="Previous view (Left arrow)"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* View buttons */}
        {VIEW_ORDER.map((view) => (
          <button
            key={view}
            onClick={() => navigateToView(view)}
            className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
              currentView === view
                ? 'bg-indigo-500 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}

        {/* Right arrow */}
        <button
          onClick={() => navigateDirection('right')}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="Next view (Right arrow)"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-3 rounded-full">
        {/* Zoom in */}
        <button
          onClick={() => navigateToZoom(getNextZoom(currentZoomLevel, 'in'))}
          disabled={currentZoomLevel === 'detail'}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Zoom in (+)"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12" />
          </svg>
        </button>

        {/* Zoom level indicator */}
        <div className="flex flex-col items-center gap-1 my-1">
          {ZOOM_ORDER.slice().reverse().map((level) => (
            <button
              key={level}
              onClick={() => navigateToZoom(level)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentZoomLevel === level
                  ? 'bg-indigo-500 w-3 h-3'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
              title={level.charAt(0).toUpperCase() + level.slice(1)}
            />
          ))}
        </div>

        {/* Zoom out */}
        <button
          onClick={() => navigateToZoom(getNextZoom(currentZoomLevel, 'out'))}
          disabled={currentZoomLevel === 'overview'}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Zoom out (-)"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h12" />
          </svg>
        </button>
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-xs text-gray-400 bg-black/40 px-3 py-1 rounded">
        Drag to rotate • Arrow keys to navigate • +/- to zoom
      </div>

      {/* Selected region info */}
      {selectedRegion && (
        <div
          className="absolute top-4 left-4 text-sm text-white px-3 py-2 rounded-lg"
          style={{ backgroundColor: selectedRegion.color + 'E6' }}
        >
          <p className="font-medium">{selectedRegion.name}</p>
          <p className="text-xs opacity-80">HS Priority Region</p>
        </div>
      )}

      {/* Lesion legend (only show if there are lesions) */}
      {totalLesions > 0 && (
        <div className="absolute top-4 right-4 text-sm text-white bg-black/60 px-3 py-2 rounded-lg">
          <p className="font-medium mb-2">Active Lesions ({totalLesions})</p>
          <div className="space-y-1 text-xs">
            {lesionCounts.nodule > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: LESION_COLORS.nodule }}></span>
                <span>Nodules: {lesionCounts.nodule}</span>
              </div>
            )}
            {lesionCounts.abscess > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: LESION_COLORS.abscess }}></span>
                <span>Abscesses: {lesionCounts.abscess}</span>
              </div>
            )}
            {lesionCounts.draining_tunnel > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: LESION_COLORS.draining_tunnel }}></span>
                <span>Tunnels: {lesionCounts.draining_tunnel}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default BodyMap3D
export type { Region3D } from '@/lib/bodyMap/regions3D'
