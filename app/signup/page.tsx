"use client"

import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { createUser } from "@/lib/actions"
import { useApi } from "@/hooks/use-api"

export default function SignupPage() {
  const router = useRouter();

  const signup = useApi(createUser);

  async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const result = await signup.execute({ username, email, password });

    if (result) {
      // Success: result is the response from your API
      router.push("/login");
    } 
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            Enter your details below to create your account
          </p>
        </div>

        <Card>
          <form onSubmit={handleSignup}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="username" name="username" placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                {/* {signup.error && <p className="text-sm text-destructive">{signup.error}</p>} */}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={signup.isLoading}>
                {signup.isLoading ? "Creating account..." : "Sign up"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="px-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="underline underline-offset-4 hover:text-primary">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
