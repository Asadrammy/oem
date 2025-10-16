import MainLayout from "@/components/MainLayout";

export default function OBDDeviceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout 
      title="OBD Devices" 
      subtitle="Manage onboard devices"
    >
      {children}
    </MainLayout>
  );
}
