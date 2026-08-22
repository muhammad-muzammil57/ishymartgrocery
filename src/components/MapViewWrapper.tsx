'use client'
import dynamic from 'next/dynamic'

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => <p className='text-center text-xl text-green-700 mt-8'>Map load ho raha hai...</p>
})

export default function MapViewWrapper({ position, setPosition }: { position: [number, number] | null, setPosition: (pos: [number, number]) => void }) {
  return <MapView position={position} setPosition={setPosition} />
}