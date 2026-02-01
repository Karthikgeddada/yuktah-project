'use client';

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { HospitalSidebar } from "@/components/hospital/hospital-sidebar";

export default function HospitalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <HospitalSidebar />
            <SidebarInset>
                <main className="min-h-screen bg-slate-50/50 p-4 sm:p-8 lg:p-12">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
