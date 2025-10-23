// "use client";

// import { Separator } from "@/components/ui/separator";
// import { Bell, Settings } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { SidebarTrigger } from "@/components/ui/sidebar";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { useAuth } from "@/app/context/auth-context";
// import { useRouter } from "next/navigation";

// interface HeaderProps {
//   title: string;
//   subtitle?: string;
//   notifications?: number;
// }

// export function Header({ title, subtitle, notifications = 0 }: HeaderProps) {
//   const { user, logout } = useAuth();
//   const router = useRouter();

//   const handleLogout = () => {
//     logout();
//     router.push("/login"); // redirect to login page
//   };

//   return (
//     <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white">
//       <SidebarTrigger className="-ml-1" />
//       <Separator orientation="vertical" className="mr-2 h-4" />

//       {/* Title + Subtitle */}
//       <div className="flex-1">
//         <h1 className="font-semibold text-gray-900">{title}</h1>
//         {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
//       </div>

//       {/* Right Side */}
//       <div className="flex items-center gap-2">
//         <Button variant="ghost" size="sm" className="relative">
//           <Bell className="w-4 h-4" />
//           {notifications > 0 && (
//             <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center">
//               {notifications}
//             </Badge>
//           )}
//         </Button>

//         {user && (
//           <div className="flex items-center gap-2">
//             <Avatar className="h-8 w-8">
//               <AvatarFallback>
//                 {user.username.charAt(0).toUpperCase()}
//               </AvatarFallback>
//             </Avatar>
//             <span className="text-sm font-medium text-gray-700">
//               {user.username}
//             </span>
//             <Button
//               size="sm"
//               variant="outline"
//               onClick={handleLogout}
//               className="text-xs"
//             >
//               Logout
//             </Button>
//           </div>
//         )}
//       </div>
//     </header>
//   );
"use client";

import { Separator } from "@/components/ui/separator";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/app/context/auth-context";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import Link from "next/link";

interface HeaderProps {
  title: string;
  subtitle?: string;
  notifications?: number;
}

export function Header({ title, subtitle, notifications = 0 }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = useCallback(() => {
    try {
      logout();
      // The logout function now handles the redirect
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback redirect if logout fails
      router.push("/login");
    }
  }, [logout, router]);

  const goProfile = useCallback(() => {
    router.push("/user-profile");
  }, [router]);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <div className="flex-1">
        <h1 className="font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="relative" asChild>
          <Link href="/all-alerts">
            <Bell className="w-4 h-4" />
            {notifications > 0 && (
              <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center">
                {notifications}
              </Badge>
            )}
          </Link>
        </Button>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">
                  {user.username}
                </span>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={goProfile} className="cursor-pointer">
                My Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer font-medium"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
