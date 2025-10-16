import MainLayout from "@/components/MainLayout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout 
      title="Fleet Dashboard" 
      subtitle="Real-time diagnostics and fleet management"
    >
      {children}
    </MainLayout>
  );
}
