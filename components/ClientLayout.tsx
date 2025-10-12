"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { logout } from "@/lib/api";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    // Only redirect to /login if token is missing and not already on /login
    if (!token && pathname !== "/login") {
      router.replace("/login");
    }

    const handleUnauthorized = () => {
      logout();
      router.push("/login");
    };

    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, [pathname, router]);

  useEffect(() => {
    // On every browser refresh, redirect to /login
    router.replace("/login");
  }, [router]);

  return <>{children}</>;
}
