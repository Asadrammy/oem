// components/AuthGuard.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";

function isTokenExpired(token: string): boolean {
  try {
    const [, payloadBase64] = token.split(".");
    const payload = JSON.parse(atob(payloadBase64));
    if (!payload.exp) return false;
    // Use a fixed timestamp to avoid hydration issues
    const now = Math.floor(Date.now() / 1000);
    // Add a 30 second buffer to check expiration early
    return payload.exp < (now + 30);
  } catch {
    return true;
  }
}

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Only check auth after loading is complete
    if (loading) return;
    
    // Only run on client side to avoid hydration issues
    if (typeof window === 'undefined') return;
    
    // Enforce login
    if (!user || !user.token) {
      console.log("🚪 No user or token found, redirecting to login");
      router.replace("/login");
      return;
    }

    if (isTokenExpired(user.token)) {
      // Token is expired, logout and redirect to login
      console.log("⏰ Token expired, logging out and redirecting");
      logout();
      return; // logout() already redirects to /login
    }

    setIsChecking(false);
  }, [user, logout, router, loading]);

  // Periodic token expiration check (every 30 seconds)
  useEffect(() => {
    if (loading || !user?.token) return;

    const checkInterval = setInterval(() => {
      if (user?.token && isTokenExpired(user.token)) {
        console.log("⏰ Token expired (periodic check), logging out");
        clearInterval(checkInterval);
        logout();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkInterval);
  }, [user, logout, loading]);

  // Show loading while checking authentication
  if (loading || isChecking) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    );
  }

  // If no user or no token, show loading (will redirect)
  if (!user || !user.token) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="animate-pulse text-gray-600">Redirecting to login...</div>
      </div>
    );
  }

  // If token is expired, show loading (will redirect)
  if (isTokenExpired(user.token)) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="animate-pulse text-gray-600">Session expired, redirecting...</div>
      </div>
    );
  }

  return <>{children}</>;
}
