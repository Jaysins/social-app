"use server"
import { apiFetch } from "./utils";

// These are mock server actions that would normally interact with a database
// In a real application, you would connect to a database and perform these operations

// lib/actions.ts
export async function createUser(data: {username: string, email: string, password: string}) {


  const result = await apiFetch('auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (result.error) {
    // Return a response object with an error field
    return { success: false, error: result.error };
  }

  console.log("User created:", result.data);
  return { success: true, data: result.data };
}


export async function loginUser(data: {email: string, password: string} ) {
  // Simulate API delay

  console.log("Logging in user:", data)
  const result = await apiFetch('auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (result.error) {
    // Return a response object with an error field
    return { success: false, error: result.error };
  }

  console.log("User logged in:", result.data);
  return { success: true, data: result.data };
}


export async function getProfile(token: string) {
  // Simulate API delay or log credentials as needed
  console.log("fetcjomg iser profile in user:");
  const result = await apiFetch('auth/profile', {
    method: 'GET',
  }, token);

  if (result.error) {
    return { success: false, error: result.error };
  }

  console.log("User logged in:", result.data);
  return { success: true, data: result.data };
}

// Profile management
export async function updateProfile(data: {username?: string, bio?: string, location?: string, token?: string}) {
  // Simulate API delay
  console.log(data)
  const { token, ...profileData } = data;
  console.log("Updating profile:", profileData)
  const result = await apiFetch('auth/profile/update', {
    method: 'POST',
    body: JSON.stringify(profileData),
  }, token);
  if (result.error) {
    return { success: false, error: result.error };
  }

  console.log("User updated in:", result.data);
  return { success: true, data: result.data };
}

// actions.ts
export async function getConversations(token: string) {
  // Call the chats/all endpoint using your apiFetch helper.
  const result = await apiFetch('chats/all', { method: 'GET' }, token);

  if (result.error) {
    return { success: false, error: result.error };
  }

  // Return the conversations as provided by the backend.
  // The result.data is expected to be an array of conversation objects.
  return { success: true, data: result.data };
}


// Friend/contact management
export async function addFriend(userId: number) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  console.log("Adding friend with ID:", userId)
  return { success: true }
}

export async function acceptFriendRequest(requestId: number) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  console.log("Accepting friend request:", requestId)
  return { success: true }
}

export async function rejectFriendRequest(requestId: number) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  console.log("Rejecting friend request:", requestId)
  return { success: true }
}

// Messaging
export async function sendMessage(messageData: { conversationId: string | number; content: string }) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  console.log("Sending message:", messageData)
  return { success: true, messageId: 10 }
}

export async function createGroupChat(groupData: { name: string; members: number[] }) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  console.log("Creating group chat:", groupData)
  return { success: true, groupId: 10 }
}

