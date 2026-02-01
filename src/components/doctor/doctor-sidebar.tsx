
"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarContent,
} from "@/components/ui/sidebar";
import {
  Users,
  ClipboardPlus,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/icons/logo";

const menuItems = [
  { href: "/doctor", icon: Users, label: "Patients" },
  { href: "/doctor/upload", icon: ClipboardPlus, label: "Upload Prescription" },
];

export function DoctorSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <Logo className="h-10 group-data-[collapsible=icon]:hidden" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="mt-8">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.label}
                  isActive={pathname.startsWith(item.href) && (item.href !== '/doctor' || pathname === '/doctor')}
                  className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="flex-col items-center gap-2 group-data-[collapsible=icon]:-ml-2">
        <div className="flex items-center gap-3 p-2 rounded-md w-full group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:justify-center">
           <Avatar className="h-9 w-9">
              <AvatarImage src={`https://picsum.photos/seed/doc-avatar/100/100`} alt={user?.name} data-ai-hint="person portrait" />
              <AvatarFallback>{user ? getInitials(user.name) : <User />}</AvatarFallback>
            </Avatar>
            <div className="flex-grow overflow-hidden group-data-[collapsible=icon]:hidden">
              <p className="font-semibold text-sm truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground">Practitioner</p>
            </div>
        </div>
        <SidebarMenu className="w-full">
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="Logout" onClick={logout} className="w-full justify-center">
                    <LogOut />
                    <span className="group-data-[collapsible=icon]:hidden">Logout</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
