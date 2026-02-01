
"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { ArrowLeft, Bell, ChevronRight, HelpCircle, LogOut, Moon, QrCode, Shield, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useMedicine } from "@/context/medicine-context";
import { useEmergencyInfo } from "@/context/emergency-info-context";
import { QRCodeDisplay } from "@/components/qr-code-display";
import { getEmergencyUrl } from "@/lib/emergency-token";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const { medicines } = useMedicine();
    const { emergencyInfo, generateAndStoreToken, emergencyToken } = useEmergencyInfo();

    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [adherence, setAdherence] = useState(0);
    const [monthlyStreak, setMonthlyStreak] = useState(0);

    useEffect(() => {
        const takenCount = medicines.filter(m => m.taken === true).length;
        const skippedCount = medicines.filter(m => m.taken === false).length;
        const totalDecided = takenCount + skippedCount;
        const newAdherence = totalDecided > 0 ? Math.round((takenCount / totalDecided) * 100) : 0;
        setAdherence(newAdherence);

        // For demo purposes, we'll calculate a mock monthly streak.
        // In a real app, this would involve checking historical data.
        const dayOfMonth = new Date().getDate();
        // Simulate a streak that is roughly 1/3rd of the month.
        const streak = Math.floor(dayOfMonth / 3) + (newAdherence > 90 ? 2 : 0);
        setMonthlyStreak(streak);

    }, [medicines]);

    const getEmail = (name: string | undefined) => {
        if (!name) return "";
        return `${name.toLowerCase().replace(' ', '.')}@email.com`;
    }

    const bloodGroupText = emergencyInfo.bloodGroup === 'Other' ? emergencyInfo.bloodGroupOther : emergencyInfo.bloodGroup;
    const allergiesText = emergencyInfo.allergies === 'Other' ? emergencyInfo.allergiesOther : emergencyInfo.allergies;
    const medicationsText = emergencyInfo.medications === 'Other' ? emergencyInfo.medicationsOther : emergencyInfo.medications;
    const hasData = bloodGroupText || allergiesText || medicationsText || emergencyInfo.emergencyContact;

    // Generate token on demand if not already present
    const getOrCreateToken = () => {
        if (emergencyToken) {
            return emergencyToken;
        }
        return generateAndStoreToken();
    }

    const handleDeleteAccount = async () => {
        try {
            const response = await fetch('/api/auth/delete-account', {
                method: 'DELETE',
            });

            if (response.ok) {
                // Force logout and redirect
                await logout(); // Context logout handles cleanup
                router.push('/');
            } else {
                console.error('Failed to delete account');
                // Ideally show a toast here
            }
        } catch (error) {
            console.error('Error deleting account:', error);
        }
    };

    const token = emergencyToken || '';
    const emergencyUrl = token ? getEmergencyUrl(token) : '';

    const settingsItems = [
        { icon: QrCode, title: "Emergency QR", description: "View and share your code", href: "/dashboard/emergency-qr" },
        { icon: Bell, title: "Notifications", description: "Medicine reminders and alerts", action: <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} /> },
        { icon: Users, title: "Family Members", description: "Manage caregiver access", href: "/dashboard/family" },
        { icon: Shield, title: "Privacy & Security", description: "Data protection settings", href: "#" },
        { icon: HelpCircle, title: "Help & Support", description: "FAQs and contact support", href: "#" },
    ]

    return (
        <div className="bg-card sm:bg-transparent min-h-screen">
            <header className="p-4 flex items-center gap-4 border-b sm:hidden sticky top-0 bg-card z-10">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft />
                </Button>
                <h2 className="font-semibold text-lg">Profile & Settings</h2>
            </header>

            <main className="max-w-xl mx-auto p-0 sm:p-4 md:p-6 space-y-6 sm:space-y-8 pb-24 sm:pb-8">
                {/* Profile Header */}
                <div className="flex items-center gap-4 p-6 sm:p-0">
                    <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-background ring-2 ring-primary">
                        <AvatarImage src={`https://picsum.photos/seed/user-avatar/100/100`} alt={user?.name} data-ai-hint="person portrait" />
                        <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold font-headline">{user?.name}</h1>
                        <p className="text-muted-foreground text-sm sm:text-base">{getEmail(user?.name)}</p>
                    </div>
                </div>

                {/* Quick Stats */}
                <Card className="shadow-none sm:shadow-soft">
                    <CardContent className="p-4">
                        <h3 className="font-semibold font-headline mb-4 px-2">Quick Stats</h3>
                        <div className="grid grid-cols-3 text-center">
                            <div>
                                <p className="text-2xl font-bold text-primary">{adherence}%</p>
                                <p className="text-xs text-muted-foreground">Adherence</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-primary">{medicines.length}</p>
                                <p className="text-xs text-muted-foreground">Active Meds</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-primary">{monthlyStreak}</p>
                                <p className="text-xs text-muted-foreground">Day Streak</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* QR Code Card */}
                {hasData && (
                    <Card className="shadow-none sm:shadow-soft">
                        <CardContent className="p-4">
                            <h3 className="font-semibold font-headline mb-4 px-2">Emergency QR Code</h3>
                            <div className="flex flex-col items-center gap-4">
                                {emergencyToken ? (
                                    <>
                                        <QRCodeDisplay
                                            qrData={emergencyUrl}
                                            size={200}
                                            copyableUrl={emergencyUrl}
                                        />
                                        <p className="text-xs text-muted-foreground text-center">
                                            First responders can scan this code to instantly view your emergency information.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <Button onClick={getOrCreateToken} className="w-full">
                                            Generate Emergency QR Code
                                        </Button>
                                        <p className="text-xs text-muted-foreground text-center">
                                            Create a unique QR code for first responders to access your medical information.
                                        </p>
                                    </>
                                )}
                                <Button asChild variant="secondary" className="w-full">
                                    <Link href="/dashboard/emergency-qr">
                                        Manage QR Code
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}


                {/* Settings */}
                <Card className="shadow-none sm:shadow-soft">
                    <CardContent className="p-4 sm:p-6">
                        <h3 className="font-semibold font-headline mb-4 px-2">Settings</h3>
                        <div className="space-y-2">
                            {settingsItems.map(item => {
                                const ItemWrapper = item.href ? Link : 'div';
                                return (
                                    <ItemWrapper href={item.href || '#'} key={item.title} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="bg-primary/10 text-primary p-2 rounded-full">
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-medium">{item.title}</p>
                                            <p className="text-sm text-muted-foreground">{item.description}</p>
                                        </div>
                                        <div className="ml-auto">
                                            {item.href ? <ChevronRight className="h-5 w-5 text-muted-foreground" /> : item.action}
                                        </div>
                                    </ItemWrapper>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Sign Out */}
                {/* Danger Zone */}
                <Card className="shadow-none sm:shadow-soft border-destructive/20">
                    <CardContent className="p-4 sm:p-6 space-y-4">
                        <h3 className="font-semibold font-headline px-2 text-destructive">Danger Zone</h3>
                        <div className="space-y-2">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
                                        <Trash2 className="mr-2 h-5 w-5" />
                                        Delete Account
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your
                                            account, medical history, reports, and remove your data from our servers.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                            Delete Account
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={logout}>
                                <LogOut className="mr-2 h-5 w-5" />
                                Sign Out
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

