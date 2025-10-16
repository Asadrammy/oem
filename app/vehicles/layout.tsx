import MainLayout from "@/components/MainLayout";

export default function VehiclesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout 
      title="Fleet Vehicles" 
      subtitle="Manage and monitor your vehicle fleet"
    >
      {children}
    </MainLayout>
  );
}
