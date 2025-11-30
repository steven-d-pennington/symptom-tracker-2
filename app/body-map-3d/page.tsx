'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { Region3D } from '@/components/BodyMap3D/BodyMap3D'

// Dynamic import to avoid SSR issues with Three.js
const BodyMap3D = dynamic(
  () => import('@/components/BodyMap3D/BodyMap3D').then(mod => mod.BodyMap3D),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading 3D viewer...</p>
        </div>
      </div>
    )
  }
)

export default function BodyMap3DPage() {
  const handleRegionSelect = (region: Region3D) => {
    console.log('Selected region:', region.id, region.name)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/hs"
            className="text-indigo-600 dark:text-indigo-400 hover:underline mb-2 inline-block"
          >
            &larr; Back to HS Tracker
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            3D Body Map (Experimental)
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Interactive 3D body model for lesion tracking
          </p>
        </div>

        {/* 3D Body Map */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <BodyMap3D
            className="w-full"
            onRegionSelect={handleRegionSelect}
          />
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <h2 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
            Experimental Feature
          </h2>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            This 3D body map is a proof-of-concept. Future versions will allow you to:
          </p>
          <ul className="text-sm text-amber-700 dark:text-amber-300 mt-2 list-disc list-inside space-y-1">
            <li>Click directly on body regions to mark lesions</li>
            <li>View lesions from any angle</li>
            <li>See lesion history overlaid on the 3D model</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
