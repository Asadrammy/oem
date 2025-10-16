import MainLayout from "@/components/MainLayout";

export default function OBDTelemetryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout 
      title="OBD Telemetry" 
      subtitle="Monitor OBD device telemetry data"
    >
      {children}
    </MainLayout>
  );
}
