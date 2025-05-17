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
  const result = await apiFetch('auth/profile', {
    method: 'GET',
  }, token);

  if (result.error) {
    return { success: false, error: result.error };
  }

  return { success: true, data: result.data };
}

export async function updateProfile(data: {username?: string, bio?: string, location?: string, token: string}) {
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

export async function getConversations(token: string) {
  const result = await apiFetch('chats/all', { method: 'GET' }, token);

  if (result.error) {
    return { success: false, error: result.error };
  }

  return { success: true, data: result.data };
}


export async function getUsers(data: {token: string, query?: string}) {
  const { token, query } = data;

  const path = query ? `users/all?q=${query}` : "users/all"

  const result = await apiFetch(path, { method: 'GET' }, token);

  if (result.error) {
    return { success: false, error: result.error };
  }

  return { success: true, data: result.data };
}

export async function getContacts(data: {token: string, query?: string}) {
  const { token, query } = data;

  const path = query ? `friends/all?q=${query}` : "friends/all"

  const result = await apiFetch(path, { method: 'GET' }, token);

  if (result.error) {
    return { success: false, error: result.error };
  }

  return { success: true, data: result.data };
}


export async function getFriendRequests(data: {token: string, query?: string}) {
  const { token, query } = data;

  const path = query ? `friends/requests?q=${query}` : "friends/requests"

  const result = await apiFetch(path, { method: 'GET' }, token);

  if (result.error) {
    return { success: false, error: result.error };
  }

  return { success: true, data: result.data };
}

export async function addFriend(data: {target: string, token: string}) {
  const { token, ...requestData } = data;
  console.log("sending friend request:", requestData)
  const result = await apiFetch('friends/requests', {
    method: 'POST',
    body: JSON.stringify(requestData),
  }, token);
  if (result.error) {
    return { success: false, error: result.error };
  }
  console.log("friend request sent:", result.data);
  return { success: true, data: result.data };
}


export async function respondToFriendRequest(data: {id: string, accept: boolean, token: string}) {
  const { token, id, ...requestData } = data;
  console.log("responding to friend request:", requestData)
  const result = await apiFetch(`friends/requests/${id}/respond`, {
    method: 'POST',
    body: JSON.stringify(requestData),
  }, token);
  if (result.error) {
    return { success: false, error: result.error };
  }
  console.log("friend request responded:", result.data);
  return { success: true, data: result.data };
}


export async function createChat(data: { participantUserId: string; token: string}) {
  const { token, ...requestData } = data;
  console.log("responding to friend request:", requestData)
  const result = await apiFetch("chats/create", {
    method: 'POST',
    body: JSON.stringify(requestData),
  }, token);
  if (result.error) {
    return { success: false, error: result.error };
  }
  console.log("friend request responded:", result.data);
  return { success: true, data: result.data };
}



export async function createGroupChat(groupData: { name: string; members: string[] }) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  console.log("Creating group chat:", groupData)
  return { success: true, groupId: 10 }
}



export async function getNotifications(data: {token: string, unread?: boolean;}) {
  const { token, unread } = data;

  const path = unread ?  "notifications/all?unread=true" : `notifications/all`

  const result = await apiFetch(path, { method: 'GET' }, token);

  if (result.error) {
    return { success: false, error: result.error };
  }

  return { success: true, data: result.data };
}


export async function getStats(data: {token: string}) {
  const { token } = data;

  const result = await apiFetch('stats/dashboard', { method: 'GET' }, token);

  if (result.error) {
    return { success: false, error: result.error };
  }

  return { success: true, data: result.data };
}