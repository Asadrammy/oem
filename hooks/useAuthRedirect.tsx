// src/app/hooks/useAuthRedirect.ts
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { logout } from "@/lib/api";

export const useAuthRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      router.push("/login");
    };

    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, [router]);
};
