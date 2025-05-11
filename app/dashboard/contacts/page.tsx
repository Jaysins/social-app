"use client"

import { useCallback, useEffect, useState } from "react"
import { Clock, Search, UserPlus, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { addFriend, respondToFriendRequest, getContacts, getUsers, getFriendRequests } from "@/lib/actions"
import { getLoggedInToken } from "@/lib/client-utils"
import { useApi } from "@/hooks/use-api"
import { Friend, People } from "@/lib/types"


export default function ContactsPage() {
  const token = getLoggedInToken()
  const userString = localStorage.getItem('user')

  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [contacts, setContacts] = useState<Friend[]>([])
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([])
  const [searchResults, setSearchResults] = useState<People[]>([])

  // API hooks
  const getContactsApi = useApi(getContacts)
  const addFriendApi = useApi(addFriend)
  const getFriendRequestsApi = useApi(getFriendRequests)
  const respondToFriendRequestApi = useApi(respondToFriendRequest)
  const getUsersApi = useApi(getUsers)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!userString) return

      try {
        const user = JSON.parse(userString)
        setCurrentUserId(user.id)
      } catch (error) {
        console.error("Error decoding token:", error)
      }
  }, [userString])


  // Data fetching
  const fetchContacts = useCallback(async () => {
    if (!token) return
    const response = await getContactsApi.execute(token, {})
    if (response?.success) setContacts(response.data.data)
  }, [token])

  const fetchFriendRequests = useCallback(async () => {
    if (!token) return
    const response = await getFriendRequestsApi.execute(token, {})
    if (response?.success) setPendingRequests(response.data.data)
  }, [token])

  useEffect(() => {
    fetchContacts()
    fetchFriendRequests()
  }, [fetchContacts, fetchFriendRequests, token])

  // Search handlers
  const handleSearch = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await getUsersApi.execute(token, { query: searchQuery })
      if (response?.success) setSearchResults(response.data.data)
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsSearching(false)
    }
  }, [searchQuery, token])

  // Friend request handlers
  const handleAddFriend = useCallback(async (userId: string) => {
    try {
      const response = await addFriendApi.execute(token, { target: userId })
      if (response?.success) {
        setSearchResults(prev => prev.map(user => 
          user.id === userId ? { ...user, friendStatus: "pending-sent" } : user
        ))
      }
    } catch (error) {
      console.error("Add friend failed:", error)
    }
  }, [token])

  const handleRespondToRequest = useCallback(async (requestId: string, accept: boolean) => {
    try {
      const response = await respondToFriendRequestApi.execute(token, { id: requestId, accept })
      if (response?.success) {
        setPendingRequests(prev => prev.filter(request => request.id !== requestId))
        setSearchResults(prev => prev.map(user => 
          user.id === response.data.userId ? { ...user, friendStatus: accept ? "accepted" : "none" } : user
        ))
        fetchContacts()
      }
    } catch (error) {
      console.error("Request response failed:", error)
    }
  }, [fetchContacts, token])


  const getRelationship = useCallback((friend: Friend) => {
    if (!currentUserId) return { otherParty: friend.target, isCurrentUserRequester: false }
    
    return {
      otherParty: friend.user.id === currentUserId ? friend.target : friend.user,
      isCurrentUserRequester: friend.user.id === currentUserId
    }
  }, [currentUserId])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
        <p className="text-muted-foreground">Manage your friends and connections</p>
      </header>

      <Tabs defaultValue="friends">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends">Friends</TabsTrigger>
          <TabsTrigger value="requests">Requests ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="find">Find People</TabsTrigger>
        </TabsList>

{/* Friends Tab */}
<TabsContent value="friends" className="mt-6">
  <Card>
    <CardHeader>
      <CardTitle>Your Friends</CardTitle>
      <CardDescription>You have {contacts.length} friends</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {contacts.map((contact) => {
        const { otherParty } = getRelationship(contact)
        return (
          <div key={contact.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={otherParty.profileImage} alt={otherParty.username} />
                <AvatarFallback>{otherParty.username[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{otherParty.username}</p>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className={`h-2 w-2 rounded-full ${
                    otherParty.status === 'online' ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  {otherParty.status === 'online' ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="sm">Message</Button>
          </div>
        )
      })}
    </CardContent>
  </Card>
</TabsContent>

{/* Requests Tab */}
<TabsContent value="requests" className="mt-6">
  <Card>
    <CardHeader>
      <CardTitle>Friend Requests</CardTitle>
      <CardDescription>Pending connection requests</CardDescription>
    </CardHeader>
    <CardContent>
      {pendingRequests.length === 0 ? (
        <p className="py-4 text-center text-muted-foreground">No pending requests</p>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map((request) => {
            const { otherParty, isCurrentUserRequester } = getRelationship(request)
            return (
              <div key={request.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={otherParty.profileImage} alt={otherParty.username} />
                    <AvatarFallback>{otherParty.username[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{otherParty.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {isCurrentUserRequester ? "Your request" : "Wants to connect"}
                    </p>
                  </div>
                </div>
                {!isCurrentUserRequester ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" 
                      onClick={() => handleRespondToRequest(request.id, false)}>
                      <X className="mr-1 h-4 w-4" /> Decline
                    </Button>
                    <Button size="sm" 
                      onClick={() => handleRespondToRequest(request.id, true)}>
                      <Check className="mr-1 h-4 w-4" /> Accept
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" disabled>
                    <Clock className="mr-1 h-4 w-4" /> Pending
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </CardContent>
  </Card>
</TabsContent>
        {/* Find People Tab */}
        <TabsContent value="find" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Find People</CardTitle>
              <CardDescription>Search for new connections</CardDescription>
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

              <div className="space-y-4">
                {searchResults.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.profileImage} alt={user.username} />
                        <AvatarFallback>{user.username[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.username}</p>
                        {user.bio && <p className="text-sm text-muted-foreground">{user.bio}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {user.friendStatus === 'pending-received' && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleRespondToRequest(user.id, false)}>
                            <X className="mr-1 h-4 w-4" /> Decline
                          </Button>
                          <Button size="sm" onClick={() => handleRespondToRequest(user.id, true)}>
                            <Check className="mr-1 h-4 w-4" /> Accept
                          </Button>
                        </>
                      )}
                      {user.friendStatus === 'pending-sent' && (
                        <Button size="sm" variant="outline" disabled>
                          <Clock className="mr-1 h-4 w-4" /> Request Sent
                        </Button>
                      )}
                      {user.friendStatus === 'none' && (
                        <Button size="sm" onClick={() => handleAddFriend(user.id)}>
                          <UserPlus className="mr-1 h-4 w-4" /> Add
                        </Button>
                      )}
                    </div>
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