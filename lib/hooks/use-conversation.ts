"use client"

import { useState, useEffect } from "react"
import { useSocket } from "@/components/socket-provider"
import type { MessageData, TypingData, ReadReceiptData } from "@/lib/socket"

export function useConversation(conversationId: number) {
  const { socket, isConnected } = useSocket()
  const [messages, setMessages] = useState<any[]>([])
  const [typingUsers, setTypingUsers] = useState<TypingData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Join conversation room when component mounts
  useEffect(() => {
    if (!socket || !isConnected) return

    setIsLoading(true)

    // Join the conversation room
    socket.emit("conversation:join", conversationId)

    // Fetch conversation history (in a real app, this would be an API call)
    // For now, we'll simulate a delay
    const timer = setTimeout(() => {
      // This would be replaced with actual data from your API
      setMessages([])
      setIsLoading(false)
    }, 500)

    // Leave the conversation room when component unmounts
    return () => {
      clearTimeout(timer)
      socket.emit("conversation:leave", conversationId)
    }
  }, [conversationId, socket, isConnected])

  // Set up socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return

    // Handle incoming messages
    const handleNewMessage = (messageData: MessageData) => {
      if (messageData.conversationId !== conversationId) return

      const isMine = messageData.sender === "You" // In a real app, compare with current user ID

      const newMsg = {
        id: messageData.id,
        sender: messageData.sender,
        content: messageData.content,
        time: new Date(messageData.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isMine,
        read: false,
      }

      setMessages((prev) => [...prev, newMsg])

      // If this is not our message, mark as read
      if (!isMine) {
        socket.emit("message:read", {
          conversationId,
          userId: 123, // This would be the current user's ID
          messageId: messageData.id,
        })
      }
    }

    // Handle typing indicators
    const handleTypingUpdate = (data: TypingData) => {
      if (data.conversationId !== conversationId) return

      setTypingUsers((prev) => {
        // Find if user is already in the typing list
        const existingIndex = prev.findIndex((user) => user.userId === data.userId)

        if (existingIndex >= 0) {
          // Update existing user
          const updated = [...prev]
          updated[existingIndex] = data
          return updated
        } else if (data.isTyping) {
          // Add new typing user
          return [...prev, data]
        }

        return prev
      })
    }

    // Handle read receipts
    const handleReadReceipt = (data: ReadReceiptData) => {
      if (data.conversationId !== conversationId) return

      // Update messages to mark them as read
      setMessages((prev) => prev.map((msg) => (msg.id <= data.messageId && msg.isMine ? { ...msg, read: true } : msg)))
    }

    // Register event listeners
    socket.on("message:receive", handleNewMessage)
    socket.on("typing:update", handleTypingUpdate)
    socket.on("message:read", handleReadReceipt)

    // Cleanup on unmount
    return () => {
      socket.off("message:receive", handleNewMessage)
      socket.off("typing:update", handleTypingUpdate)
      socket.off("message:read", handleReadReceipt)
    }
  }, [socket, isConnected, conversationId])

  // Function to send a message
  const sendMessage = async (content: string) => {
    if (!socket || !isConnected || !content.trim()) return false

    try {
      // Create message data
      const messageData = {
        id: Date.now(),
        conversationId,
        sender: "You", // In a real app, this would be the user's name
        content,
        timestamp: new Date().toISOString(),
      }

      // Send message via socket
      socket.emit("message:send", messageData)

      // Add message to local state
      const newMessageObj = {
        id: messageData.id,
        sender: messageData.sender,
        content: messageData.content,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isMine: true,
        read: false,
      }

      setMessages((prev) => [...prev, newMessageObj])

      return true
    } catch (error) {
      console.error("Error sending message:", error)
      return false
    }
  }

  // Function to send typing indicator
  const sendTypingIndicator = (isTyping: boolean) => {
    if (!socket || !isConnected) return

    const event = isTyping ? "typing:start" : "typing:stop"

    socket.emit(event, {
      conversationId,
      userId: 123, // This would be the current user's ID
      username: "You", // This would be the current user's name
    })
  }

  return {
    messages,
    typingUsers,
    isLoading,
    sendMessage,
    sendTypingIndicator,
    isConnected,
  }
}

