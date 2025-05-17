"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { v4 as uuidv4 } from 'uuid'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { PlusCircle, Send } from "lucide-react"

import {
  createChat,
  getContacts,
  getConversations
} from "@/lib/actions"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useSocket } from "@/components/socket-provider"
import { TypingIndicator } from "@/components/typing-indicator"
import { useApi } from "@/hooks/use-api"
import { getLoggedInToken } from "@/lib/client-utils"
import type { MessageData, TypingData, UserStatusData } from "@/lib/socket"

import type {
  Conversation,
  Friend,
  UIMessage,
  Participant
} from "@/lib/types"

export default function MessagesPage() {
  // Retrieve user
  const token = getLoggedInToken()
  const storedUser = localStorage.getItem('user')
  const currentUser = storedUser ? JSON.parse(storedUser) : null
  if (!token || !currentUser) return null

  const currentUserId = currentUser._id

  // API hooks
  const conversationsApi = useApi(getConversations)
  const contactsApi = useApi(getContacts)
  const createChatApi = useApi(createChat)

  // Socket
  const { socket, isConnected } = useSocket()

  // State
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [typingUsers, setTypingUsers] = useState<TypingData[]>([])

  const [contacts, setContacts] = useState<Friend[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [chatType, setChatType] = useState<'direct'>('direct')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Helpers
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    const res = await contactsApi.execute(token, {})
    if (res?.success) setContacts(res.data.data)
  }, [token])

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    const res = await conversationsApi.execute(token)
    if (res?.success) {
      const convos = res.data.data.map((chat: any) => {
        const other = chat.participants.find((p: any) => p.user !== currentUserId)
        const last = chat.lastMessages?.slice(-1)[0]
        const lastMessage = last
          ? `${last.sender.user === currentUserId ? 'You' : last.sender.username}: ${last.content}`
          : 'No messages yet'

        return {
          id: chat._id,
          type: 'direct',
          participants: chat.participants,
          target: other,
          lastMessage,
          messages: chat.lastMessages || []
        } as Conversation
      })
      setConversations(convos)
      if (!selectedConversation && convos.length) {
        setSelectedConversation(convos[0])
      }
    }
  }, [token, currentUserId])

  // Load data on mount
  useEffect(() => { fetchContacts() }, [fetchContacts])
  useEffect(() => { fetchConversations() }, [fetchConversations])

  // Map messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      const uiMsgs = selectedConversation.messages?.map((m: any) => ({
        id: m._id,
        sender: m.sender,
        content: m.content,
        createdAt: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMine: m.sender.user === currentUserId,
        read: true
      }))
      setMessages(uiMsgs || [])
    } else {
      setMessages([])
    }
  }, [selectedConversation])

  // Socket events
  useEffect(() => {
    if (!socket || !isConnected || !selectedConversation) return

    socket.emit('conversation:join', selectedConversation.id)

    const onReceive = (data: any) => {
      console.log(data, 'sksksapodnd')
      setMessages(prev => {
        console.log(data.tempId, prev, "nanann")
        const exists = prev.find(msg => msg.tempId === data.tempId)
        const incoming: UIMessage = {
          id: data.message.id,
          tempId: data.tempId,
          sender: data.message.sender,
          content: data.message.content,
          createdAt: new Date(data.message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMine: data.message.sender.user === currentUserId,
          read: false,
          temp: false
        }

        console.log(incoming, "ncominfgg")
        if (exists) {
          return prev.map(msg => msg.tempId === data.tempId ? incoming : msg)
        }
        return [...prev, incoming]
      })
      scrollToBottom()
    }

    const onTyping = (typing: any) => {

      console.log(typing, 'overhere')
      setTypingUsers(users =>
        typing.isTyping
          ? [...users.filter(u => u.userId !== typing.userId), typing]
          : users.filter(u => u.userId !== typing.userId)
      )
    }

    socket.on('message:receive', onReceive)
    socket.on('typing:update', onTyping)

    return () => {
      socket.emit('conversation:leave', selectedConversation.id)
      socket.off('message:receive', onReceive)
      socket.off('typing:update', onTyping)
    }
  }, [socket, isConnected, selectedConversation])

  useEffect(scrollToBottom, [messages])

  // Typing
  const handleTyping = () => {
    if (!socket || !selectedConversation) return
    socket.emit('typing:start', { chatId: selectedConversation.id, userId: currentUserId, username: currentUser.username })
    setTimeout(() => {
      socket.emit('typing:stop', { chatId: selectedConversation.id, userId: currentUserId, username: currentUser.username })
    }, 2000)
  }

  // Send
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !socket || !selectedConversation) return
    setIsSending(true)

    const tempId = uuidv4()
    const timestamp = new Date().toISOString()

    const optimistic: UIMessage = {
      id: tempId,
      tempId: tempId,
      sender: { user: currentUserId, username: currentUser.username },
      content: newMessage,
      createdAt: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
      read: false,
      temp: true
    }

    setMessages(prev => [...prev, optimistic])
    setNewMessage("") 
    socket.emit('message:send', { tempId, chatId: selectedConversation.id, content: optimistic.content, timestamp })

    setIsSending(false)
  }

  // Chat creation
  const handleCreateChat = async () => {
    if (selectedUsers.length !== 1) return
    const res = await createChatApi.execute(token, { participantUserId: selectedUsers[0] })
    if (res?.success) {
      const newChat = res.data.data
      const formatted: Conversation = {
        id: newChat._id,
        type: 'direct',
        participants: newChat.participants,
        target: newChat.participants.find((p: Participant) => p.user !== currentUserId),
        lastMessage: '',
        messages: []
      }
      setConversations([formatted, ...conversations])
      setSelectedConversation(formatted)
    }
    setSelectedUsers([])
    setIsDialogOpen(false)
  }

  console.log("misketeers", !newMessage.trim(), !isConnected, isSending)
  // Render
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Messages</h1>
      </header>

      <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
        {/* Sidebar */}
        <Card className="md:col-span-1 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-medium">Conversations</h3>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost"><PlusCircle /></Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Conversation</DialogTitle>
                  <DialogDescription>Select a user to start chat</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Label>Select User</Label>
                  <div className="grid gap-2 max-h-60 overflow-auto">
                    {contacts.map(f => {
                      const other = f.user.id === currentUserId ? f.target : f.user
                      return (
                        <div key={other.id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedUsers.includes(other.id)}
                            onCheckedChange={val => setSelectedUsers(val ? [other.id] : [])}
                          />
                          <Label>{other.username}</Label>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <DialogFooter>
                  <Button disabled={selectedUsers.length !== 1} onClick={handleCreateChat}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex-1 overflow-auto">
            {conversations.length === 0 ? (
              <p className="p-4 text-muted-foreground">No conversations.</p>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.id}
                  className={`flex items-center p-3 cursor-pointer ${selectedConversation?.id === conv.id ? 'bg-muted' : ''}`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <Avatar>
                    <AvatarFallback>{conv.target.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3 truncate">
                    <p className="font-medium truncate">{conv.target.username}</p>
                    <p className="text-xs truncate">{conv.lastMessage}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Chat window */}
        <Card className="md:col-span-2 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="flex items-center p-4 border-b">
                <Avatar>
                  <AvatarFallback>{selectedConversation.target.username.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="font-medium">{selectedConversation.target.username}</p>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4 space-y-4">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}> 
                    <div className={`max-w-[70%] rounded-lg p-3 ${msg.isMine ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      {!msg.isMine && <p className="text-xs font-medium">{msg.sender.username}</p>}
                      <p>{msg.content}</p>
                      <div className="flex justify-end text-xs opacity-70 mt-1">
                        <span>{msg.createdAt}</span>
                        {msg.isMine && <span className="ml-2">{msg.read ? 'Read' : 'Delivered'}</span>}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <TypingIndicator conversationId={selectedConversation.id} typingUsers={typingUsers} currentUserId={currentUserId} />

              <form onSubmit={handleSend} className="flex items-center p-4 border-t gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={e => { setNewMessage(e.target.value); handleTyping() }}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim() || !isConnected || isSending}>
                  <Send />
                </Button>
              </form>
            </>
          ) : (
            <p className="p-4 text-center text-muted-foreground">Select a conversation to start chatting.</p>
          )}
        </Card>
      </div>
    </div>
  )
}
