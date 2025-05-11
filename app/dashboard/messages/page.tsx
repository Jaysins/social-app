"use client"
import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"

import { v4 as uuidv4 } from 'uuid'; // if you install uuid library

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PlusCircle, Send } from "lucide-react"
import { createChat, getContacts, getConversations } from "@/lib/actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useSocket } from "@/components/socket-provider"
import { TypingIndicator } from "@/components/typing-indicator"
import type { MessageData, TypingData, UserStatusData } from "@/lib/socket"
import { useApi } from "@/hooks/use-api"
import { getLoggedInToken } from "@/lib/client-utils"
import { Conversation, Friend, UIMessage } from "@/lib/types";

// Define the conversation shape expected by the UI.

export default function MessagesPage() {
  // Retrieve current user data.
  const stringedUser = localStorage.getItem('user')
  if (!stringedUser){
    return null
  }
  const currentUser = JSON.parse(stringedUser)

  const currentUserId = currentUser._id
  const currentUsername = currentUser.username

  // API hook for fetching conversations.
  const getConversationsApi = useApi(getConversations)
  const token = getLoggedInToken()

  // State for conversations and selected conversation.
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  // State for messages shown in the conversation.
  const [messages, setMessages] = useState<UIMessage[]>([])

  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [typingUsers, setTypingUsers] = useState<TypingData[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [chatType, setChatType] = useState<"direct" | "group">("direct")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [contacts, setContacts] = useState<Friend[]>([])

  const getContactsApi = useApi(getContacts)
  const createChatApi = useApi(createChat)
  
  // Get socket from context.
  const { socket, isConnected } = useSocket()

  // Helper: scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

    // Data fetching
    const fetchContacts = useCallback(async () => {
      if (!token) return
      const response = await getContactsApi.execute(token, {})
      if (response?.success) setContacts(response.data.data)
    }, [token])

    useEffect(() => {
      fetchContacts()
    }, [fetchContacts, token])

    const fetchConversations = useCallback(async () => {
      if (!token) return
      const response = await getConversationsApi.execute(token)
      if (response && response.success && Array.isArray(response.data.data)) {
        // Map API response into UI-ready conversation objects.
        const convos = response.data.data.map((chat: any) => {
          let name = ""
          if (chat.type === "individual") { 
            // For individual chats, use the participant whose user id is not the current user's.
            const otherParticipant = chat.participants.find((p: any) => p.user !== currentUserId)
            name = otherParticipant ? otherParticipant.username : "Unknown User"
          } 
          // Map the first message (if available) for conversation list display.
          console.log(chat.lastMessages, 'alarst', chat.lastMessages[-1])
          const lastMsg =
            chat.lastMessages && chat.lastMessages.length > 0
              ? `${chat.lastMessages[chat.lastMessages.length-1].sender.user === currentUserId
                  ? "You"
                  : chat.lastMessages[chat.lastMessages.length-1].sender.username}: ${chat.lastMessages[chat.lastMessages.length-1].content}`
              : "No messages yet"
          return {
            id: chat._id,
            lastMessage: lastMsg,
            type: "direct",
            participants: chat.participants,
            target: chat.participants.find((p: any) => p.user !== currentUserId),
            messages: chat.lastMessages || [], // Store raw lastMessages
          } as Conversation
        })
        setConversations(convos)
        if (convos.length > 0) {
          setSelectedConversation(convos[0])
        }
      }
    }, [token])

  // Fetch conversations from /chats/all when token is available.
  useEffect(() => {
    fetchConversations()
  }, [token])

  // When selected conversation changes, update messages state using the conversation's messages.
  useEffect(() => {
    if (selectedConversation && selectedConversation.messages) {
      const mappedMessages = selectedConversation.messages.map((m: any): UIMessage => {
        const isMine = m.sender.user === currentUserId
        return {
          id: m._id,
          sender: isMine ? "You" : m.sender.username,
          content: m.content,
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isMine,
          read: true, // default as read; adjust if API provides read status
        }
      })
      setMessages(mappedMessages)
    } else {
      setMessages([])
    }
  }, [selectedConversation, currentUserId])

  // Join conversation room and mark messages as read.
  useEffect(() => {
    if (!socket || !isConnected || !selectedConversation) return

    socket.emit("conversation:join", selectedConversation.id)

    // Mark unread messages as read.
    const unreadMessages = messages.filter((msg) => !msg.read && !msg.isMine)
    console.log('selecting conversation====>', selectedConversation)
    console.log(unreadMessages)
    unreadMessages.forEach((msg) => {
      console.log(msg, selectedConversation, currentUserId)
      socket.emit("message:read", {
        chatId: selectedConversation.id,
        userId: currentUserId,
        messageId: msg.id,
      })
    })
    if (unreadMessages.length > 0) {
      setMessages(messages.map((msg) => (!msg.read && !msg.isMine ? { ...msg, read: true } : msg)))
    }

    return () => {
      socket.emit("conversation:leave", selectedConversation.id)
    }
  }, [selectedConversation, socket, isConnected, messages, currentUserId])

  // Set up socket event listeners.
  useEffect(() => {
    if (!socket || !isConnected) return

    const handleNewMessage = (
      data: {
        chatId: string;
        tempId: string;
        message: {
          sender: { user: string; username: string };
          content: string;
          timestamp: string;
          chatId: string;
        };
      }
    ) => {
      const isMine = data.message.sender.user === currentUserId;

      // Update messages state, checking for an existing optimistic message by tempId.
      setMessages((prevMessages) => {
        const index = prevMessages.findIndex((msg) => msg.tempId === data.tempId);
        const finalMsg: UIMessage = {
          id: data.tempId, // You may update this with a final server id if available.
          tempId: data.tempId,
          sender: data.message.sender,
          content: data.message.content,
          time: new Date(data.message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isMine,
          // Preserve read state if already marked.
          read: index !== -1 ? prevMessages[index].read : false,
        };

        if (index !== -1) {
          const updatedMessages = [...prevMessages];
          updatedMessages[index] = finalMsg;
          return updatedMessages;
        }
        return [...prevMessages, finalMsg];
      });

      // Update the conversation's last message and unread flag.
      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.id === data.chatId
            ? {
                ...conv,
                lastMessage: `${isMine ? "You" : data.message.sender.username}: ${data.message.content}`,
                unread: !isMine,
              }
            : conv
        )
      );

      if (data.chatId === selectedConversation?.id && !isMine) {
        socket.emit("message:read", {
          chatId: data.chatId,
          userId: currentUserId,
          messageId: data.tempId,
        });
      }
      scrollToBottom();
    };

    const handleTypingUpdate = (data: TypingData) => {

      console.log(data)
      setTypingUsers((prev) => {
        const existingIndex = prev.findIndex(
          (user) => user.userId === data.userId && user.chatId === data.chatId,
        );
        console.log(existingIndex, 'brahhh')
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = data;
          return updated;
        } else if (data.isTyping) {
          return [...prev, data];
        }
        return prev;
      });
    };

    const handleReadReceipt = (data: { conversationId: number; userId: number; messageId: number | string }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id <= data.messageId && msg.isMine ? { ...msg, read: true } : msg)),
      );
    };

    const handleUserStatus = (data: UserStatusData) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.type === "direct" && conv.userId === data.userId ? { ...conv, status: data.status } : conv,
        ),
      );
    };

    socket.on("message:receive", handleNewMessage);
    socket.on("typing:update", handleTypingUpdate);
    socket.on("message:readDone", handleReadReceipt);
    socket.on("user:status", handleUserStatus);

    return () => {
      socket.off("message:receive", handleNewMessage);
      socket.off("typing:update", handleTypingUpdate);
      socket.off("message:readDone", handleReadReceipt);
      socket.off("user:status", handleUserStatus);
    };
  }, [socket, isConnected, selectedConversation, currentUserId]);

  // Auto-scroll when messages change.
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle typing indicator.
  const handleTyping = () => {
    if (!socket || !isConnected || !selectedConversation) return;

    if (typingTimeout) {
      console.log('clearing timeout---<', typingTimeout)
      clearTimeout(typingTimeout);
    }

    socket.emit("typing:start", {
      chatId: selectedConversation.id,
      userId: currentUserId,
      username: currentUsername,
    });

    const timeout = setTimeout(() => {
      socket.emit("typing:stop", {
        chatId: selectedConversation.id,
        userId: currentUserId,
        username: currentUsername,
      });
    }, 2000);
    setTypingTimeout(timeout);
  };

  async function handleSendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !isConnected || !selectedConversation) return;
    setIsSending(true);

    try {
      // Stop typing if user was typing.
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
        socket.emit("typing:stop", {
          conversationId: selectedConversation.id,
          userId: currentUserId,
          username: currentUsername,
        });
      }

      // Generate a unique temporary ID for optimistic UI.
      const tempId = uuidv4();

      const messageData = {
        id: tempId,
        tempId,
        chatId: selectedConversation.id,
        content: newMessage,
        timestamp: new Date().toISOString(),
      };

      // Add to messages UI optimistically.
      const optimisticMessage: UIMessage = {
        id: tempId,
        sender: {user: currentUserId, username: currentUsername},
        content: messageData.content,
        time: new Date(messageData.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isMine: true,
        tempId,
        temp: true,
        read: false,
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      // Update last message in conversation list.
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation.id ? { ...conv, lastMessage: `You: ${newMessage}` } : conv,
        ),
      );

      // Send the message to the server.
      socket.emit("message:send", messageData);

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  }
  
  async function handleCreateChat() {
    try {
      if (chatType === "direct" && selectedUsers.length === 1) {
        const response = await createChatApi.execute(token, {participantUserId: selectedUsers[0]})
        console.log(response?.data, 'creating chatt')
        if (response?.success) {
          const newConversation = response.data.data;
          const exists = conversations.some(
            (c) => c.id === newConversation._id
          );

          if (exists) {
            const existingConversation = conversations.find(
              (c) => c.id === newConversation._id
            );
            if (existingConversation) {
              setSelectedConversation(existingConversation);
            }
          } else {
            const formattedConversation = {
              id: newConversation._id,
              lastMessage: "",
              type: "direct",
              participants: newConversation.participants,
              target: newConversation.participants.find((p: any) => p.user !== currentUserId),
              messages: newConversation.lastMessages || [],
            } as Conversation;

    setConversations([formattedConversation, ...conversations]);
    setSelectedConversation(formattedConversation);
  }
}
      } 
      setSelectedUsers([]); 
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
    }
  }

  const getRelationship = useCallback((friend: Friend) => {
    if (!currentUserId) return { otherParty: friend.target, isCurrentUserRequester: false }
    
    return {
      otherParty: friend.user.id === currentUserId ? friend.target : friend.user,
      isCurrentUserRequester: friend.user.id === currentUserId
    }
  }, [currentUserId])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">Chat with your friends and groups</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
        <Card className="md:col-span-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-medium">Conversations</h3>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <PlusCircle className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Conversation</DialogTitle>
                  <DialogDescription>Create a new direct message or group chat</DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant={chatType === "direct" ? "default" : "outline"}
                      onClick={() => setChatType("direct")}
                      className="flex-1"
                    >
                      Direct Message
                    </Button>

                  </div>


                  <div className="space-y-2">
                    <Label>Select User</Label>
                    <div className="border rounded-md p-3 space-y-2">
                      {contacts.map((contact) => {
                        const {  otherParty } = getRelationship(contact)
                        return(
                        <div key={otherParty.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`user-${otherParty.id}`}
                            checked={selectedUsers.includes(otherParty.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                if (chatType === "direct") {
                                  setSelectedUsers([otherParty.id])
                                } else {
                                  setSelectedUsers([...selectedUsers, otherParty.id])
                                }
                              } else {
                                setSelectedUsers(selectedUsers.filter((id) => id !== otherParty.id))
                              }
                            }}
                          />
                          <Label htmlFor={`user-${otherParty.id}`} className="cursor-pointer">
                            {otherParty.username}
                          </Label>
                        </div>
                      )})}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    onClick={handleCreateChat}
                    disabled={
                      (chatType === "direct" && selectedUsers.length !== 1)
                                        }
                  >
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex-1 overflow-auto">
            {conversations.length === 0 ? (
              <p className="p-4 text-muted-foreground">No conversations available.</p>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 ${
                    selectedConversation && selectedConversation.id === conversation.id ? "bg-muted" : ""
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="relative">
                    <Avatar>
                      {/* <AvatarImage src={conversation.avatar} alt={conversation.name} /> */}
                      <AvatarFallback>{conversation.target.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {conversation.type === "direct" && conversation.target.status === "online" && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-medium truncate">{conversation.target.username}</p>
                      {/* {conversation.unread && <span className="h-2 w-2 rounded-full bg-primary"></span>} */}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{conversation.lastMessage}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="md:col-span-2 overflow-hidden flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar>
                  {/* <AvatarImage src={selectedConversation?.target.profilePicture} alt={selectedConversation?.target.username} /> */}
                  <AvatarFallback>{selectedConversation?.target.username.charAt(0)}</AvatarFallback>
                </Avatar>
                {selectedConversation?.type === "direct" && selectedConversation?.target.status === "online" && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
                )}
              </div>
              <div>
                <h3 className="font-medium">{selectedConversation?.target.username}</h3>
                {selectedConversation?.type === "direct" && selectedConversation?.target.status === "online" && (
                  <p className="text-xs text-green-500">Online</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] ${message.isMine ? "bg-primary text-primary-foreground" : "bg-muted"} rounded-lg p-3`}>
                  {!message.isMine && <p className="text-xs font-medium mb-1">{message.sender.username}</p>}
                  <p>{message.content}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <p className="text-xs opacity-70">{message.time}</p>
                    {message.isMine && <span className="text-xs opacity-70">{message.read ? "Read" : "Delivered"}</span>}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <TypingIndicator conversationId={selectedConversation?.id || 0} typingUsers={typingUsers} currentUserId={currentUserId} />

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
              <Button type="submit" size="icon" disabled={isSending || !newMessage.trim() || !isConnected}>
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
    </div>
  )
}