
"use client";

import { Home, FileText, Pill, User, Plus } from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/dashboard/reports", icon: FileText, label: "Reports" },
    { href: "/dashboard/add-prescription", icon: Plus, label: "Add" },
    { href: "/dashboard/med-tracker", icon: Pill, label: "Meds" },
    { href: "/dashboard/profile", icon: User, label: "Profile" },
];

export function BottomNavbar() {
    const pathname = usePathname();

    return (
        <div className="sm:hidden fixed bottom-0 left-0 z-50 w-full h-20 bg-card border-t border-border">
            <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    if (item.label === 'Add') {
                        return (
                            <div key={item.label} className="inline-flex flex-col items-center justify-center -mt-8">
                                <Link href="/dashboard/add-prescription" className="flex items-center justify-center h-16 w-16 bg-gradient-to-br from-cyan-400 to-green-400 text-white rounded-full shadow-lg">
                                    <Plus className="h-8 w-8" />
                                </Link>
                             </div>
                        )
                    }

                    return (
                        <Link key={item.label} href={item.href} className={cn(
                            "inline-flex flex-col items-center justify-center px-5 hover:bg-muted group",
                            isActive ? "text-primary" : "text-muted-foreground"
                        )}>
                            <item.icon className="w-6 h-6 mb-1" />
                            <span className="text-xs">{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
}
