'use client'
import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Default Leaflet marker icons point at files that don't bundle correctly
// with Next.js — rebuild them from CDN URLs instead.
const deliveryIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const destinationIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: 'hue-rotate-[120deg]',
})

interface Props {
  deliveryLocation?: { latitude: number; longitude: number } | null
  destination?: { latitude: number; longitude: number } | null
  height?: string
}

function LiveTrackingMap({ deliveryLocation, destination, height = '320px' }: Props) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const deliveryMarkerRef = useRef<L.Marker | null>(null)
  const destMarkerRef = useRef<L.Marker | null>(null)
  // Delivery partner aur delivery address ke darmiyan seedhi, moti, green
  // line — taa k ek nazar mein pata chal sake ke fasla kitna aur kis taraf hai
  const routeLineRef = useRef<L.Polyline | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const initialCenter: [number, number] = deliveryLocation
      ? [deliveryLocation.latitude, deliveryLocation.longitude]
      : destination
      ? [destination.latitude, destination.longitude]
      : [33.6844, 73.0479] // fallback: Islamabad/Rawalpindi

    const map = L.map(containerRef.current).setView(initialCenter, 14)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      deliveryMarkerRef.current = null
      destMarkerRef.current = null
      routeLineRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (destination) {
      if (destMarkerRef.current) {
        destMarkerRef.current.setLatLng([destination.latitude, destination.longitude])
      } else {
        destMarkerRef.current = L.marker([destination.latitude, destination.longitude], {
          icon: destinationIcon,
        })
          .addTo(map)
          .bindPopup('Delivery Address')
      }
    }

    if (deliveryLocation) {
      if (deliveryMarkerRef.current) {
        deliveryMarkerRef.current.setLatLng([deliveryLocation.latitude, deliveryLocation.longitude])
      } else {
        deliveryMarkerRef.current = L.marker(
          [deliveryLocation.latitude, deliveryLocation.longitude],
          { icon: deliveryIcon }
        )
          .addTo(map)
          .bindPopup('Delivery Partner')
      }
      map.panTo([deliveryLocation.latitude, deliveryLocation.longitude])
    }

    if (deliveryLocation && destination) {
      const routeCoords: [number, number][] = [
        [deliveryLocation.latitude, deliveryLocation.longitude],
        [destination.latitude, destination.longitude],
      ]

      if (routeLineRef.current) {
        routeLineRef.current.setLatLngs(routeCoords)
      } else {
        routeLineRef.current = L.polyline(routeCoords, {
          color: '#16a34a', // green-600 — dono markers (red partner, blue destination) ke darmiyan
          weight: 5,
          opacity: 0.85,
          dashArray: '8, 8',
          lineCap: 'round',
        }).addTo(map)
      }

      const bounds = L.latLngBounds(routeCoords)
      map.fitBounds(bounds, { padding: [40, 40] })
    }
  }, [deliveryLocation, destination])

  return <div ref={containerRef} style={{ height, width: '100%' }} className="rounded-2xl overflow-hidden z-0" />
}

export default LiveTrackingMap
