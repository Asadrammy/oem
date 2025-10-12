// components/AuthGuard.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { refreshAccessToken } from "@/lib/api";

function isTokenExpired(token: string): boolean {
  try {
    const [, payloadBase64] = token.split(".");
    const payload = JSON.parse(atob(payloadBase64));
    if (!payload.exp) return false;
    // Use a fixed timestamp to avoid hydration issues
    const now = Math.floor((typeof window !== 'undefined' ? Date.now() : 0) / 1000);
    return payload.exp < now;
  } catch {
    return true;
  }
}

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        localStorage.removeItem("refresh_token");
        router.replace("/login");
        return;
      }

      if (isTokenExpired(token)) {
        // Try to refresh the token
        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            setReady(true);
            return;
          }
        } catch (error) {
          console.error("Token refresh failed:", error);
        }
        
        // If refresh fails, redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.replace("/login");
      } else {
        setReady(true);
      }
    };

    checkAuth();
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="animate-pulse text-gray-600">Checking authentication…</div>
      </div>
    );
  }
  return <>{children}</>;
}
