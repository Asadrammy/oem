// import type { Metadata } from "next";
// import "./globals.css";
// import { AuthProvider } from "@/app/context/auth-context";
// import { Toaster } from "@/components/ui/toaster"; // ✅ only Toaster

// export const metadata: Metadata = {
//   title: "OEM Platform",
//   description: "Fleet Management Dashboard",
// };

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <body>
//         <AuthProvider>
//           {children}
//           <Toaster /> {/* ✅ Only once in the whole app */}
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import "./globals.css";
import { AuthProvider } from "@/app/context/auth-context";
import { Toaster } from "@/components/ui/toaster";
import { logout } from "@/lib/api";

export default function RootLayout({
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
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
