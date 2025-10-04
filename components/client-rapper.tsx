"use client"; // 👈 हे महत्त्वाचं

import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  useAuthRedirect();
  return <>{children}</>;
}
