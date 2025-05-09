import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, MessageSquare, Users, UserRound } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-2xl font-bold">SocialConnect</h1>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 bg-gradient-to-b from-background to-muted">
          <div className="container flex flex-col items-center text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Connect with friends and the world around you
            </h2>
            <p className="mt-6 text-xl text-muted-foreground max-w-3xl">
              SocialConnect helps you stay in touch with friends, share moments, and build meaningful connections.
            </p>
            <div className="mt-10">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 border rounded-lg">
                <div className="p-3 rounded-full bg-primary/10 mb-4">
                  <UserRound className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Personalized Profiles</h3>
                <p className="text-muted-foreground">Create and customize your profile to showcase your personality.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 border rounded-lg">
                <div className="p-3 rounded-full bg-primary/10 mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Connect with Friends</h3>
                <p className="text-muted-foreground">Find and add friends to build your personal network.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 border rounded-lg">
                <div className="p-3 rounded-full bg-primary/10 mb-4">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Messaging</h3>
                <p className="text-muted-foreground">Chat with friends individually or create group conversations.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
          <p className="text-sm text-muted-foreground">© 2025 SocialConnect. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

