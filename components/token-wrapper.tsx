// token-wrapper.tsx
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { SocketProvider } from "@/components/socket-provider";

interface ClientOnlySocketProviderProps {
  children: ReactNode;
}

export function ClientOnlySocketProvider({
  children,
}: ClientOnlySocketProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // A helper function to update the token from localStorage.
  const updateToken = () => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
    setLoading(false);
  };

  useEffect(() => {
    // Load token on mount.
    updateToken();

    // Listen for storage events that may update the token.
    const handleStorageChange = (event: StorageEvent) => {
      // Check if the "token" key was changed.
      if (event.key === "token") {
        updateToken();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Cleanup listener on unmount.
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  if (loading) {
    // Optionally render a loading state while fetching the token.
    return <div>Loading...</div>;
  }

  return <SocketProvider token={token}>{children}</SocketProvider>;
}
