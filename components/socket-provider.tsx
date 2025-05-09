"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { Socket } from "socket.io-client"
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket"

type SocketContextType = {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
})

export const useSocket = () => useContext(SocketContext)

export function SocketProvider({
  children,
  token,
}: {
  children: ReactNode
  token: string | null
}) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Only connect if we have a userId
    console.log('found token',token)
    if (!token) return

    // Connect to socket
    connectSocket(token)
    const socketInstance = getSocket()
    setSocket(socketInstance)

    // Set up connection status listeners
    const onConnect = () => setIsConnected(true)
    const onDisconnect = () => setIsConnected(false)

    socketInstance.on("connect", onConnect)
    socketInstance.on("disconnect", onDisconnect)

    // Set initial connection status
    setIsConnected(socketInstance.connected)

    // Cleanup on unmount
    return () => {
      socketInstance.off("connect", onConnect)
      socketInstance.off("disconnect", onDisconnect)
      disconnectSocket()
    }
  }, [token])

  return <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
}

