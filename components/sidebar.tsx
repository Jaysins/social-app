"use client"
import { Home, User, Users, MessageSquare, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { disconnectSocket } from "@/lib/socket";
import { useRouter } from "next/navigation"

export default function Sidebar() {
  const router = useRouter()

  const handleLogout = () => {
    disconnectSocket()
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  } 

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-muted/40">
      <div className="p-6">
        <h2 className="text-2xl font-bold">SocialConnect</h2>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        <Link href="/dashboard">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Home size={18} />
            Dashboard
          </Button>
        </Link>
        <Link href="/dashboard/profile">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <User size={18} />
            Profile
          </Button>
        </Link>
        <Link href="/dashboard/contacts">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Users size={18} />
            Contacts
          </Button>
        </Link>
        <Link href="/dashboard/messages">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <MessageSquare size={18} />
            Messages
          </Button>
        </Link>
        <Link href="/dashboard/profile">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Settings size={18} />
            Settings
          </Button>
        </Link>
      </nav>
      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground"           onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </Button>
      </div>
    </aside>
  );
}
