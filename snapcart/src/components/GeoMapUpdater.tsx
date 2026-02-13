'use client'
import { getSocket } from '@/lib/socket';
import React, { useEffect } from 'react'

function GeoMapUpdater({userId}:{userId:string}) {
  let socket = getSocket();
  socket.emit("identity",userId)
  useEffect(()=>{
    if(!userId)return
    if(!navigator.geolocation)return
      const watchId = navigator.geolocation.watchPosition((pos)=>{
      const latitude=pos.coords.latitude;
      const longitude=pos.coords.longitude;
      socket.emit("updateLocation",{
        userId,
        latitude,
        longitude
      })
  },(err)=>{
    console.error("Failed to get location",err)
  },{enableHighAccuracy:true})
    return ()=>navigator.geolocation.clearWatch(watchId)
  },[userId])
  return null
   
}

export default GeoMapUpdater