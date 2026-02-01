
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { DoctorSidebar } from "@/components/doctor/doctor-sidebar";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.push('/login');
    } else if (user?.role !== 'hospital') {
      logout(); // Logout if role is incorrect
    }
  }, [user, router, logout]);

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <DoctorSidebar />
      <SidebarInset>
        <div className="flex justify-end p-2 sm:hidden">
          <SidebarTrigger />
        </div>
        <main className="min-h-screen p-6 sm:p-8 lg:p-12">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
