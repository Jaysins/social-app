"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send } from "lucide-react"
import { TypingIndicator } from "@/components/typing-indicator"
import { useConversation } from "@/lib/hooks/use-conversation"

export default function ConversationPage() {
  const params = useParams()
  const conversationId = Number(params.id)
  const [newMessage, setNewMessage] = useState("")
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // This would normally be fetched from a database
  const [conversation, setConversation] = useState({
    id: conversationId,
    name: "Loading...",
    avatar: "/placeholder.svg?height=40&width=40",
    type: "direct",
    status: "offline" as "online" | "offline",
  })

  const { messages, typingUsers, isLoading, sendMessage, sendTypingIndicator, isConnected } =
    useConversation(conversationId)

  // Fetch conversation details
  useEffect(() => {
    // In a real app, this would be an API call
    // For now, we'll simulate a delay
    const timer = setTimeout(() => {
      setConversation({
        id: conversationId,
        name: "Jane Smith",
        avatar: "/placeholder.svg?height=40&width=40",
        type: "direct",
        status: "online" as "online" | "offline",
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [conversationId])

  // Scroll to bottom on initial load and when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle typing indicator
  const handleTyping = () => {
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    // Send typing start
    sendTypingIndicator(true)

    // Set timeout to stop typing indicator after 2 seconds of inactivity
    const timeout = setTimeout(() => {
      sendTypingIndicator(false)
    }, 2000)

    setTypingTimeout(timeout)
  }

  async function handleSendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!newMessage.trim() || !isConnected) return

    // Clear typing indicator
    if (typingTimeout) {
      clearTimeout(typingTimeout)
      sendTypingIndicator(false)
    }

    // Send message
    const success = await sendMessage(newMessage)

    if (success) {
      setNewMessage("")
    }
  }
  console.log('i am a ssso')
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">Conversation with {conversation.name}</p>
      </div>

      <Card className="overflow-hidden flex flex-col h-[calc(100vh-220px)]">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar>
                <AvatarImage src={conversation.avatar} alt={conversation.name} />
                <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {conversation.type === "direct" && conversation.status === "online" && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
              )}
            </div>
            <div>
              <h3 className="font-medium">{conversation.name}</h3>
              {conversation.type === "direct" && conversation.status === "online" && (
                <p className="text-xs text-green-500">Online</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-muted-foreground">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-muted-foreground">No messages yet. Start a conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] ${message.isMine ? "bg-primary text-primary-foreground" : "bg-muted"} rounded-lg p-3`}
                >
                  {!message.isMine && <p className="text-xs font-medium mb-1">{message.sender}</p>}
                  <p>{message.content}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <p className="text-xs opacity-70">{message.time}</p>
                    {message.isMine && (
                      <span className="text-xs opacity-70">{message.read ? "Read" : "Delivered"}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <TypingIndicator conversationId={conversationId} typingUsers={typingUsers} />

        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value)
                handleTyping()
              }}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim() || !isConnected}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          {!isConnected && (
            <p className="text-xs text-destructive mt-1">
              You are currently offline. Messages will be sent when you reconnect.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}

