import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export async function apiFetch(endpoint: string, options: RequestInit = {}, token: string | undefined | null = null) {
  // Retrieve token and define default headers
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    defaultHeaders['Authorization'] = token;
  }
  console.log(token)
  // Merge default headers with any headers passed in via options
  options.headers = {
    ...defaultHeaders,
    ...(options.headers || {}),
  };

  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, options);
    let responseData;
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
    
    if (!response.ok) {
      const errorMessage = responseData?.error || `Request failed with status ${response.status}`;
      return { error: errorMessage, data: null };
    }
    return { error: null, data: responseData };
  } catch (err) {
    console.error("API request error:", err);
    return { error: "Something went wrong. Please try again later.", data: null };
  }
}
