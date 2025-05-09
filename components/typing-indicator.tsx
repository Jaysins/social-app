"use client"

import { useEffect, useState } from "react"
import type { TypingData } from "@/lib/socket"

export function TypingIndicator({
  conversationId,
  currentUserId,
  typingUsers,
}: {
  conversationId: string | number
  currentUserId: string
  typingUsers: TypingData[]
}) {

  console.log(typingUsers, 'we are active')
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    // Filter typing users for this conversation
    const activeTypers = typingUsers.filter((user) => user.chatId === conversationId && user.isTyping)
    console.log(activeTypers, 'we are active')
    if (activeTypers.length === 0) {
      setMessage("")
    } else if (activeTypers.length === 1) {
      setMessage(
        activeTypers[0].userId !== currentUserId
          ? `${activeTypers[0].username} is typing...`
          : ""
      )
    } else if (activeTypers.length === 2) {
      setMessage(`${activeTypers[0].username} and ${activeTypers[1].username} are typing...`)
    } else {
      setMessage("Several people are typing...")
    }
  }, [typingUsers, conversationId])

  if (!message) return null

  return <div className="text-xs text-muted-foreground italic px-4 py-1">{message}</div>
}

