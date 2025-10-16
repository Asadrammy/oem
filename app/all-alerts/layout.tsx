import MainLayout from "@/components/MainLayout";

export default function AllAlertsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout 
      title="Alerts" 
      subtitle="Manage and monitor your alerts"
    >
      {children}
    </MainLayout>
  );
}