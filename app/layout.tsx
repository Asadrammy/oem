import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/app/context/auth-context";
import { Toaster } from "@/components/ui/toaster";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "OEM Platform",
  description: "Fleet Management Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
