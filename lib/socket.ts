import { io, type Socket } from "socket.io-client"

// Socket.io client singleton
let socket: Socket | null = null

export type MessageData = {
  chatId: string;
  tempId: string;
  message: {
    sender: { user: string; username: string };
    content: string;
    timestamp: string;
    chatId: string;
  };
};

export type TypingData = {
  chatId: string
  userId: string
  username: string
  isTyping: boolean
}

export type ReadReceiptData = {
  conversationId: number
  userId: number
  messageId: number
}

export type UserStatusData = {
  userId: string
  status: "online" | "offline"
}

export function getSocket(): Socket {
  if (!socket) {
    // Initialize socket connection to the standalone Socket.IO server
    // For local development, this will be localhost:3001
    // For production, you'll need to set up a separate Socket.IO server
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001"

    socket = io(socketUrl, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: false,
    })
  }
  return socket
}

export function connectSocket(token: string): void {
  const socket = getSocket()

  if (!socket.connected) {
    socket.auth = { token }
    socket.connect()

    // Setup event listeners
    socket.on("connect", () => {
      console.log("Socket connected")
    })

    socket.on("disconnect", () => {
      console.log("Socket disconnected")
    })

    socket.on("connect_error", (err) => {
      console.error("Connection error:", err)
    })
  }
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
  }
}

