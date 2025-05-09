'use client'; // in Next.js 13+ with app dir

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, UserPlus, Users } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  // This would normally be fetched from a database
  const stats = {
    friends: 24,
    pendingRequests: 3,
    unreadMessages: 5,
  }

  // Mock recent activity
  const recentActivity = [
    { id: 1, type: "friend_request", user: "Jane Smith", time: "2 hours ago" },
    { id: 2, type: "message", user: "Mike Johnson", time: "4 hours ago" },
    { id: 3, type: "friend_accept", user: "Sarah Williams", time: "Yesterday" },
  ]

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
            <div className="text-2xl font-bold">{stats.friends}</div>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Friend Requests</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
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
            <div className="text-2xl font-bold">{stats.unreadMessages}</div>
            <Link href="/dashboard/messages" className="text-xs text-primary hover:underline">
              View messages
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest interactions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 rounded-lg border p-3">
                <div className="rounded-full bg-primary/10 p-2">
                  {activity.type === "friend_request" && <UserPlus className="h-4 w-4 text-primary" />}
                  {activity.type === "message" && <MessageSquare className="h-4 w-4 text-primary" />}
                  {activity.type === "friend_accept" && <Users className="h-4 w-4 text-primary" />}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.user}
                    {activity.type === "friend_request" && " sent you a friend request"}
                    {activity.type === "message" && " sent you a message"}
                    {activity.type === "friend_accept" && " accepted your friend request"}
                  </p>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
                {activity.type === "friend_request" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Ignore
                    </Button>
                    <Button size="sm">Accept</Button>
                  </div>
                )}
                {activity.type === "message" && <Button size="sm">Reply</Button>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

