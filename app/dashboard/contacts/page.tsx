"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, UserPlus, Check, X } from "lucide-react"
import { addFriend, acceptFriendRequest, rejectFriendRequest } from "@/lib/actions"

export default function ContactsPage() {
  // This would normally be fetched from a database
  const [contacts, setContacts] = useState([
    { id: 1, name: "Jane Smith", avatar: "/placeholder.svg?height=40&width=40", status: "online" },
    { id: 2, name: "Mike Johnson", avatar: "/placeholder.svg?height=40&width=40", status: "offline" },
    { id: 3, name: "Sarah Williams", avatar: "/placeholder.svg?height=40&width=40", status: "online" },
    { id: 4, name: "David Brown", avatar: "/placeholder.svg?height=40&width=40", status: "offline" },
  ])

  const [pendingRequests, setPendingRequests] = useState([
    { id: 101, name: "Alex Turner", avatar: "/placeholder.svg?height=40&width=40" },
    { id: 102, name: "Emma Wilson", avatar: "/placeholder.svg?height=40&width=40" },
    { id: 103, name: "Robert Davis", avatar: "/placeholder.svg?height=40&width=40" },
  ])

  const [searchResults, setSearchResults] = useState([
    { id: 201, name: "Chris Martin", avatar: "/placeholder.svg?height=40&width=40" },
    { id: 202, name: "Lisa Anderson", avatar: "/placeholder.svg?height=40&width=40" },
  ])

  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  async function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSearching(true)

    try {
      // In a real app, this would search the database
      // For now, we'll just use our mock data
      console.log(`Searching for: ${searchQuery}`)
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      console.error(error)
    } finally {
      setIsSearching(false)
    }
  }

  async function handleAddFriend(userId: number) {
    try {
      await addFriend(userId)
      // In a real app, this would update the database
      // For now, we'll just remove from search results
      setSearchResults(searchResults.filter((user) => user.id !== userId))
    } catch (error) {
      console.error(error)
    }
  }

  async function handleAcceptRequest(userId: number) {
    try {
      await acceptFriendRequest(userId)
      // In a real app, this would update the database
      // For now, we'll just update our state
      const acceptedUser = pendingRequests.find((user) => user.id === userId)
      if (acceptedUser) {
        setContacts([...contacts, { ...acceptedUser, status: "offline" }])
        setPendingRequests(pendingRequests.filter((user) => user.id !== userId))
      }
    } catch (error) {
      console.error(error)
    }
  }

  async function handleRejectRequest(userId: number) {
    try {
      await rejectFriendRequest(userId)
      // In a real app, this would update the database
      setPendingRequests(pendingRequests.filter((user) => user.id !== userId))
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
        <p className="text-muted-foreground">Manage your friends and connections</p>
      </div>

      <Tabs defaultValue="friends">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends">Friends</TabsTrigger>
          <TabsTrigger value="requests">Requests ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="find">Find People</TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Friends</CardTitle>
              <CardDescription>You have {contacts.length} friends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={contact.avatar} alt={contact.name} />
                        <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {contact.status === "online" ? (
                            <span className="flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-green-500"></span> Online
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-gray-300"></span> Offline
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Message
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Friend Requests</CardTitle>
              <CardDescription>People who want to connect with you</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No pending friend requests</p>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={request.avatar} alt={request.name} />
                          <AvatarFallback>{request.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{request.name}</p>
                          <p className="text-xs text-muted-foreground">Wants to connect with you</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleRejectRequest(request.id)}>
                          <X className="h-4 w-4 mr-1" /> Decline
                        </Button>
                        <Button size="sm" onClick={() => handleAcceptRequest(request.id)}>
                          <Check className="h-4 w-4 mr-1" /> Accept
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="find" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Find People</CardTitle>
              <CardDescription>Search for new friends to connect with</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="Search by name or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={isSearching}>
                  {isSearching ? "Searching..." : <Search className="h-4 w-4" />}
                </Button>
              </form>

              <div className="space-y-4 mt-4">
                {searchResults.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleAddFriend(user.id)}>
                      <UserPlus className="h-4 w-4 mr-1" /> Add Friend
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

