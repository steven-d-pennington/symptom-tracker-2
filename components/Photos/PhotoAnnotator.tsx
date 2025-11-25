'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { PhotoAttachment } from '@/lib/db'
import { getFullImageUrl, updatePhoto } from '@/lib/photos/uploadPhoto'

interface Annotation {
  id: string
  type: 'arrow' | 'circle' | 'freehand' | 'text'
  color: string
  points: { x: number; y: number }[]
  text?: string
  fontSize?: number
}

interface PhotoAnnotatorProps {
  photo: PhotoAttachment | null
  isOpen: boolean
  onClose: () => void
  onSaved?: () => void
}

const COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ffffff', // white
  '#000000', // black
]

const TOOLS = [
  { id: 'arrow', icon: '↗', label: 'Arrow' },
  { id: 'circle', icon: '○', label: 'Circle' },
  { id: 'freehand', icon: '✎', label: 'Draw' },
  { id: 'text', icon: 'T', label: 'Text' },
] as const

export function PhotoAnnotator({ photo, isOpen, onClose, onSaved }: PhotoAnnotatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedTool, setSelectedTool] = useState<(typeof TOOLS)[number]['id']>('freehand')
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null)
  const [history, setHistory] = useState<Annotation[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isDrawing, setIsDrawing] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null)
  const [scale, setScale] = useState(1)

  // Load image and existing annotations
  useEffect(() => {
    if (!photo || !isOpen) {
      setImageUrl(null)
      setAnnotations([])
      return
    }

    setIsLoading(true)

    // Load existing annotations
    if (photo.annotations) {
      try {
        const parsed = JSON.parse(photo.annotations)
        setAnnotations(parsed)
        setHistory([parsed])
        setHistoryIndex(0)
      } catch {
        setAnnotations([])
        setHistory([[]])
        setHistoryIndex(0)
      }
    } else {
      setAnnotations([])
      setHistory([[]])
      setHistoryIndex(0)
    }

    getFullImageUrl(photo)
      .then((url) => {
        setImageUrl(url)
        if (url) {
          const img = new Image()
          img.onload = () => {
            setImageElement(img)
            setIsLoading(false)
          }
          img.src = url
        }
      })
      .catch(() => {
        setIsLoading(false)
      })

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl)
      }
    }
  }, [photo, isOpen])

  // Calculate scale and render canvas
  useEffect(() => {
    if (!canvasRef.current || !imageElement || !containerRef.current) return

    const container = containerRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Calculate scale to fit image in container
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight
    const imageRatio = imageElement.width / imageElement.height
    const containerRatio = containerWidth / containerHeight

    let newScale: number
    if (imageRatio > containerRatio) {
      newScale = containerWidth / imageElement.width
    } else {
      newScale = containerHeight / imageElement.height
    }

    setScale(newScale)

    canvas.width = imageElement.width * newScale
    canvas.height = imageElement.height * newScale

    // Draw image
    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height)

    // Draw annotations
    renderAnnotations(ctx, [...annotations, currentAnnotation].filter(Boolean) as Annotation[])
  }, [imageElement, annotations, currentAnnotation])

  const renderAnnotations = (ctx: CanvasRenderingContext2D, annots: Annotation[]) => {
    annots.forEach((annot) => {
      ctx.strokeStyle = annot.color
      ctx.fillStyle = annot.color
      ctx.lineWidth = 3

      switch (annot.type) {
        case 'freehand':
          if (annot.points.length > 1) {
            ctx.beginPath()
            ctx.moveTo(annot.points[0].x * scale, annot.points[0].y * scale)
            for (let i = 1; i < annot.points.length; i++) {
              ctx.lineTo(annot.points[i].x * scale, annot.points[i].y * scale)
            }
            ctx.stroke()
          }
          break

        case 'arrow':
          if (annot.points.length === 2) {
            const [start, end] = annot.points
            const sx = start.x * scale
            const sy = start.y * scale
            const ex = end.x * scale
            const ey = end.y * scale

            // Line
            ctx.beginPath()
            ctx.moveTo(sx, sy)
            ctx.lineTo(ex, ey)
            ctx.stroke()

            // Arrowhead
            const angle = Math.atan2(ey - sy, ex - sx)
            const headLength = 15
            ctx.beginPath()
            ctx.moveTo(ex, ey)
            ctx.lineTo(
              ex - headLength * Math.cos(angle - Math.PI / 6),
              ey - headLength * Math.sin(angle - Math.PI / 6)
            )
            ctx.moveTo(ex, ey)
            ctx.lineTo(
              ex - headLength * Math.cos(angle + Math.PI / 6),
              ey - headLength * Math.sin(angle + Math.PI / 6)
            )
            ctx.stroke()
          }
          break

        case 'circle':
          if (annot.points.length === 2) {
            const [center, edge] = annot.points
            const cx = center.x * scale
            const cy = center.y * scale
            const ex = edge.x * scale
            const ey = edge.y * scale
            const radius = Math.sqrt(Math.pow(ex - cx, 2) + Math.pow(ey - cy, 2))

            ctx.beginPath()
            ctx.arc(cx, cy, radius, 0, Math.PI * 2)
            ctx.stroke()
          }
          break

        case 'text':
          if (annot.points.length > 0 && annot.text) {
            const fontSize = (annot.fontSize || 16) * scale
            ctx.font = `${fontSize}px sans-serif`
            ctx.fillText(annot.text, annot.points[0].x * scale, annot.points[0].y * scale)
          }
          break
      }
    })
  }

  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return null

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()

    let clientX: number, clientY: number
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    return {
      x: (clientX - rect.left) / scale,
      y: (clientY - rect.top) / scale,
    }
  }

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCanvasCoordinates(e)
    if (!coords) return

    if (selectedTool === 'text') {
      setTextPosition(coords)
      return
    }

    setIsDrawing(true)
    const newAnnotation: Annotation = {
      id: `annot_${Date.now()}`,
      type: selectedTool as Annotation['type'],
      color: selectedColor,
      points: [coords],
    }
    setCurrentAnnotation(newAnnotation)
  }

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !currentAnnotation) return

    const coords = getCanvasCoordinates(e)
    if (!coords) return

    if (currentAnnotation.type === 'freehand') {
      setCurrentAnnotation({
        ...currentAnnotation,
        points: [...currentAnnotation.points, coords],
      })
    } else {
      // For arrow and circle, update the second point
      setCurrentAnnotation({
        ...currentAnnotation,
        points: [currentAnnotation.points[0], coords],
      })
    }
  }

  const handleMouseUp = () => {
    if (!isDrawing || !currentAnnotation) return

    setIsDrawing(false)

    // Only add if there are enough points
    if (
      (currentAnnotation.type === 'freehand' && currentAnnotation.points.length > 1) ||
      (['arrow', 'circle'].includes(currentAnnotation.type) && currentAnnotation.points.length === 2)
    ) {
      const newAnnotations = [...annotations, currentAnnotation]
      setAnnotations(newAnnotations)
      addToHistory(newAnnotations)
    }

    setCurrentAnnotation(null)
  }

  const handleTextSubmit = () => {
    if (!textPosition || !textInput.trim()) {
      setTextPosition(null)
      setTextInput('')
      return
    }

    const textAnnotation: Annotation = {
      id: `annot_${Date.now()}`,
      type: 'text',
      color: selectedColor,
      points: [textPosition],
      text: textInput,
      fontSize: 16,
    }

    const newAnnotations = [...annotations, textAnnotation]
    setAnnotations(newAnnotations)
    addToHistory(newAnnotations)

    setTextPosition(null)
    setTextInput('')
  }

  const addToHistory = (newAnnotations: Annotation[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newAnnotations)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setAnnotations(history[historyIndex - 1])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setAnnotations(history[historyIndex + 1])
    }
  }

  const handleClear = () => {
    if (confirm('Clear all annotations?')) {
      setAnnotations([])
      addToHistory([])
    }
  }

  const handleSave = async () => {
    if (!photo) return

    setIsSaving(true)
    try {
      await updatePhoto(photo.guid, {
        annotations: JSON.stringify(annotations),
      })
      onSaved?.()
      onClose()
    } catch (error) {
      console.error('Error saving annotations:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = () => {
    if (!canvasRef.current) return

    const link = document.createElement('a')
    link.download = `annotated_${photo?.fileName || 'photo'}`
    link.href = canvasRef.current.toDataURL('image/jpeg', 0.95)
    link.click()
  }

  if (!isOpen || !photo) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Annotate Photo</h2>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
          >
            Export
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        {/* Tools */}
        <div className="flex items-center gap-1">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className={`w-10 h-10 flex items-center justify-center rounded text-lg ${
                selectedTool === tool.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } transition-colors`}
              title={tool.label}
            >
              {tool.icon}
            </button>
          ))}
        </div>

        {/* Colors */}
        <div className="flex items-center gap-1">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-8 h-8 rounded-full border-2 ${
                selectedColor === color ? 'border-white' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Undo"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Redo"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"
              />
            </svg>
          </button>
          <button
            onClick={handleClear}
            className="p-2 text-red-400 hover:text-red-300 transition-colors"
            title="Clear All"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden p-4"
      >
        {isLoading ? (
          <div className="text-white text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
            <p>Loading image...</p>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            className="max-w-full max-h-full cursor-crosshair touch-none"
            style={{ touchAction: 'none' }}
          />
        )}
      </div>

      {/* Text Input Modal */}
      {textPosition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-gray-800 rounded-lg p-4 w-80">
            <h3 className="text-white font-medium mb-3">Add Text</h3>
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
              placeholder="Enter text..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white mb-3"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setTextPosition(null)
                  setTextInput('')
                }}
                className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTextSubmit}
                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
