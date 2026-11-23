'use client'
import { getSocket } from '@/lib/socket';
import { useEffect } from 'react'

/**
 * GeoMapUpdater
 * Streams the user's GPS position to the socket server ("updateLocation").
 * For delivery boys this powers live order tracking and the "nearby delivery boys" search.
 * (Telling the server who the user is happens in InitUser, on every page.)
 */
function GeoMapUpdater({ userId }: { userId: string }) {
  useEffect(() => {
    if (!userId) return
    if (!navigator.geolocation) return
    const socket = getSocket();
    const watchId = navigator.geolocation.watchPosition((pos) => {
      socket.emit("updateLocation", {
        userId,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      })
    }, (err) => {
      console.error("Failed to get location", err)
    }, { enableHighAccuracy: true })
    return () => navigator.geolocation.clearWatch(watchId)
  }, [userId])
  return null
}

export default GeoMapUpdater
