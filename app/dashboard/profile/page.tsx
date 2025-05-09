"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getProfile, updateProfile } from "@/lib/actions";
import { getLoggedInToken } from "@/lib/client-utils";
import { useApi } from "@/hooks/use-api";

export default function ProfilePage() {
  // Retrieve token from client utility (ensure this function checks for window availability)
  const token = getLoggedInToken();

  const tokenObj = {token: getLoggedInToken()}

  // Profile state
  const [profile, setProfile] = useState({
    _id: "",
    username: "",
    email: "",
    bio: "",
    location: "",
    createdAt: "",
    updatedAt: "",
    avatar: "/placeholder.svg?height=100&width=100",
    
  });

  // API hooks for getProfile and updateProfile
  const getProfileApi = useApi(getProfile);
  const updateProfileApi = useApi(updateProfile);

  // Fetch profile when token is available
  useEffect(() => {
    async function fetchProfile() {
      if (!token) return;
      const response = await getProfileApi.execute(token);
      if (response && response.success) {
        const data = response.data.data; // Adjust based on your API response structure
        console.log(data)
        const user = data
        setProfile(user);
        console.log('did i get here??')
        localStorage.setItem('user', JSON.stringify(user))
      }
    }
    fetchProfile();
  }, [token]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    const formData = new FormData(event.currentTarget);
    const updatedProfile = {
      username: formData.get("username") as string,
      bio: formData.get("bio") as string,
      location: formData.get("location") as string,
    };

    // Call updateProfile to update the profile data
    const response = await updateProfileApi.execute(token, updatedProfile);
    if (response && response.success) {
      setProfile((prev) => ({ ...prev, ...updatedProfile }));
      console.log('i gor heee?')
      localStorage.setItem('user', JSON.stringify(response.data.data))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your profile information
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" defaultValue={profile.username} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={profile.email}
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  Your email cannot be changed
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  defaultValue={profile.bio}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  defaultValue={profile.location}
                />
              </div>
            </CardContent>
            <CardFooter className="flex items-center">
              {updateProfileApi.error ? (
                <p className="text-sm text-destructive mr-auto">
                  {updateProfileApi.error}
                </p>
              ) : updateProfileApi.success ? (
                <p className="text-sm text-green-600 mr-auto">
                  Profile updated successfully!
                </p>
              ) : null}
              <Button type="submit" disabled={updateProfileApi.isLoading}>
                {updateProfileApi.isLoading ? "Saving..." : "Save changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Update your profile picture</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src={profile.avatar} alt={profile.username} />
              <AvatarFallback>
                {profile.username ? profile.username.charAt(0) : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="avatar">Upload new picture</Label>
              <Input id="avatar" type="file" accept="image/*" />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Upload</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
