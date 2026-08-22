'use client'
import { LatLngExpression } from 'leaflet'
import React, { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, useMap,  } from 'react-leaflet'
import L from 'leaflet'
import {motion} from 'motion/react'
import { LocateFixed } from 'lucide-react'
const markerIcon=new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/14831/14831599.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
})

const DragableMarker: React.FC<{ position: [number, number]; setPosition: (pos: [number, number]) => void }> = ({ position, setPosition }) => {
    const map=useMap()
   useEffect(()=>{
    map.flyTo(position as LatLngExpression, map.getZoom(), {
        animate: true,
    })
   },[position])
    return (
        <Marker
            icon={markerIcon}
            position={position}
            draggable={true}
            eventHandlers={{
                dragend: (e: L.LeafletEvent) => {
                    const marker = e.target as L.Marker;
                    const { lat, lng } = marker.getLatLng();
                    setPosition([lat, lng]);
                },
            }}
        />
    );
};

function MapView({ position, setPosition }: { position: [number, number] | null; setPosition: (pos: [number, number]) => void }) {
    if (!position) return (
        <p className='text-center text-xl text-green-700 mt-8'>
            Position nahi mili...<br />Please Allow Location
        </p>
    );

    const handleCurrentLocation=()=>{
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
               const { latitude, longitude } = pos.coords
               setPosition([latitude, longitude])
              },
              (err) => {
                console.log('Location error',err)},{enableHighAccuracy: true, maximumAge: 0, timeout: 10000}
              
            )
          }
    }
    return (
        // ✅ Yeh div relative parent hai button ka + corners ka
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '0.75rem', overflow: 'hidden' }}>
            <MapContainer
                center={position as LatLngExpression}
                zoom={13}
                scrollWheelZoom={true}
                style={{ width: '100%', height: '100%' }} // ✅ hardcoded height hatao
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <DragableMarker position={position} setPosition={setPosition} />
            </MapContainer>

            {/* ✅ Button ab is div ka child hai — absolute sahi kaam karega */}
            <motion.button
                onClick={handleCurrentLocation}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                whileTap={{ scale: 0.95 }}
                style={{ position: 'absolute', right: '1rem', bottom: '1rem', zIndex: 1000, backgroundColor: 'rgba(34, 197, 94, 0.9)',
                
                 }} // ✅ thoda transparent background
                className=' text-white hover:bg-green-800 shadow-lg rounded-full p-3 transition-all flex items-center justify-center cursor-pointer'
            >
                <LocateFixed />
            </motion.button>
        </div>
    );
}

export default MapView
