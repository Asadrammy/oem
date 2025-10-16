
import MainLayout from "@/components/MainLayout";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout 
      title="User Management" 
      subtitle="Manage system users and their profiles"
    >
      {children}
    </MainLayout>
  );
}
