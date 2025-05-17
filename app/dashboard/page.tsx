'use client'
import { useCallback, useEffect, useState } from "react"
import { MessageSquare, UserPlus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { getNotifications, getStats } from "@/lib/actions"
import { getLoggedInToken } from "@/lib/client-utils"
import { useApi } from "@/hooks/use-api"
import { formatDistanceToNow } from 'date-fns'

type Notification = {
  id: string
  type: "friend_request" | "message" | "friend_accept"
  payload: any
  message: string
  createdAt: string
}

type Stat = {
  friends: number
  pendingRequests: number
  unreadMessages: number
}

export default function DashboardPage() {
  const token = getLoggedInToken()


  // notifications state
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<Stat>()

  // API hook
  const getNotificationsApi = useApi(getNotifications)
  const getStatsApi = useApi(getStats)

  // fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!token) return
    const response = await getNotificationsApi.execute(token, {})
    if (response?.success) {
      setNotifications(response.data.data)
    } else if (response?.error) {
      console.error("Failed to load notifications:", response.error)
    }
  }, [token])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

    // fetch notifications
  const fetchStats = useCallback(async () => {
    if (!token) return
    const response = await getStatsApi.execute(token, {})
    if (response?.success) {
      setStats(response.data.data)
    } else if (response?.error) {
      console.error("Failed to load Stats:", response.error)
    }
  }, [token])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Friends</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.friends ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Friend Requests</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingRequests ?? 0}</div>
            <Link href="/dashboard/contacts" className="text-xs text-primary hover:underline">
              View pending requests
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.unreadMessages ?? 0}</div>
            <Link href="/dashboard/messages" className="text-xs text-primary hover:underline">
              View messages
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">No new notifications</p>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className="flex items-center gap-4 rounded-lg border p-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    {notif.type === "friend_request" && <UserPlus className="h-4 w-4 text-primary" />}
                    {notif.type === "message"         && <MessageSquare className="h-4 w-4 text-primary" />}
                    {notif.type === "friend_accept"   && <Users className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {notif.message}
                    </p>
                      

                    <p className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</p>
                  </div>
                  {notif.type === "friend_request" && (
                    <div className="flex gap-2">

                        <Link href="/dashboard/contacts">
                        <Button size="sm">Respond</Button>
                        </Link>
                    </div>
                  )}
                  {notif.type === "message" && (
                      <Link href="/dashboard/messages">
                        <Button size="sm">Reply</Button>
                        </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
