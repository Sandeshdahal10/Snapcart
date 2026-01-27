'use client'
import { LatLngExpression } from 'leaflet'
import React from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import "leaflet/dist/leaflet.css"

function Map({position}:{position:[number,number] | null}) {
  if(!position)return null
  return (
    <MapContainer center={position as LatLngExpression} zoom={13} scrollWheelZoom={false} className='w-full h-[400px]'>
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    
     
    
  </MapContainer>
  )
}

export default Map