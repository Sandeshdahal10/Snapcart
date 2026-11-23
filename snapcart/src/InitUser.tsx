'use client'
import axios from 'axios'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import useGetMe from './hooks/useGetMe'
import { getSocket } from './lib/socket'
import { RootState } from './redux/store'

/**
 * Mounted once in the root layout:
 * - loads the logged-in user into Redux
 * - tells the socket server who this user is, on every page and after every reconnect,
 *   so events meant only for this user (e.g. the delivery code) reach them
 */
function InitUser() {
  useGetMe()
  const { userData } = useSelector((state: RootState) => state.user)
  const userId = userData?._id ? String(userData._id) : ""

  useEffect(() => {
    if (!userId) return
    const socket = getSocket()
    let cancelled = false
    // A signed token proves to the socket server that this browser really is this user
    const sendIdentity = async () => {
      try {
        const result = await axios.get("/api/socket/token")
        if (!cancelled) socket.emit("identity", { userId, token: result.data.token })
      } catch (error) {
        console.log("socket identity error", error)
      }
    }
    if (socket.connected) sendIdentity()
    socket.on("connect", sendIdentity)
    return () => {
      cancelled = true
      socket.off("connect", sendIdentity)
    }
  }, [userId])

  return null
}

export default InitUser
