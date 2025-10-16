import MainLayout from "@/components/MainLayout";

export default function AlertsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout 
      title="Alert & Warnings" 
      subtitle="Manage and monitor your alert rules"
    >
      {children}
    </MainLayout>
  );
}
