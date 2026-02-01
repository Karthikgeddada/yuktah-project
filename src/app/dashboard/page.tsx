
"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Pill, FileText, CheckCircle, Check, X, Users, Shield, ChevronRight } from "lucide-react";
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { NotificationBell } from "@/components/dashboard/notification-bell";


export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [pills, setPills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adherence, setAdherence] = useState(0);
  const [confirmation, setConfirmation] = useState<{ medId: string, status: boolean, medName: string } | null>(null);

  const fetchPills = async () => {
    try {
      const res = await fetch('/api/patient/pills/today');
      if (res.ok) {
        const data = await res.json();
        setPills(data.pils || []);
      }
    } catch (error) {
      console.error("Failed to fetch pills", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPills();
  }, []);

  useEffect(() => {
    if (pills.length > 0) {
      const takenCount = pills.filter(p => p.taken).length;
      setAdherence(Math.round((takenCount / pills.length) * 100));
    } else {
      setAdherence(0);
    }
  }, [pills]);

  const handleDose = async (id: string, status: boolean) => {
    // Optimistic update
    setPills(prev => prev.map(p => p._id === id ? { ...p, taken: status } : p));

    try {
      await fetch(`/api/patient/pills/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taken: status }),
      });
    } catch (error) {
      console.error('Error updating pill status:', error);
      fetchPills(); // Revert on error
    }
  };

  const handleConfirmDose = () => {
    if (confirmation) {
      handleDose(confirmation.medId, confirmation.status);
      setConfirmation(null);
    }
  }

  const getPillColor = (taken: boolean) => {
    return taken ? "text-primary" : "text-yellow-500";
  }

  const getPillBg = (taken: boolean) => {
    return taken ? "bg-primary/10" : "bg-yellow-400/20";
  }


  return (
    <div className="space-y-6 pb-24 sm:pb-8">
      <div className="bg-gradient-to-br from-cyan-400 to-green-400 text-white rounded-b-3xl sm:rounded-2xl p-6 shadow-lg space-y-4 sm:space-y-6 -mx-4 -mt-4 sm:mx-0 sm:mt-0">
        {/* Header content consistent with previous design */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Good Morning!</h1>
            <p className="opacity-90 text-sm sm:text-base">{user?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
          </div>
        </div>
        <div>
          <p className="text-xs sm:text-sm opacity-90">Today's Adherence</p>
          <div className="flex items-end gap-2 sm:gap-4 mt-1">
            <p className="text-4xl sm:text-5xl font-bold">{adherence}%</p>
            <div className="relative h-12 w-12 sm:h-16 sm:w-16">
              <svg className="h-full w-full" width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-white/30" strokeWidth="3"></circle>
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-white" strokeWidth="3" strokeDasharray={`${adherence}, 100`} strokeLinecap="round" transform="rotate(-90 18 18)"></circle>
              </svg>
              <CheckCircle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex space-x-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <Button asChild className="shrink-0 rounded-full" >
            <Link href="/dashboard/med-tracker">
              <Pill className="mr-2 h-4 w-4" /> Reminders
            </Link>
          </Button>
          <Button asChild variant="outline" className="shrink-0 rounded-full bg-card border-border">
            <Link href="/dashboard/reports">
              <FileText className="mr-2 h-4 w-4" /> Reports
            </Link>
          </Button>
          <Button asChild variant="outline" className="shrink-0 rounded-full bg-card border-border">
            <Link href="/dashboard/family">
              <Users className="mr-2 h-4 w-4" /> Family
            </Link>
          </Button>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold font-headline">Today's Schedule</h2>
          <Link href="/dashboard/med-tracker" className="text-sm font-medium text-primary hover:underline">
            View All
          </Link>
        </div>
        <AlertDialog open={!!confirmation} onOpenChange={(open) => !open && setConfirmation(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Action</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to mark {confirmation?.medName} as {confirmation?.status ? 'taken' : 'skipped'}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmation(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDose}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading today's pills...</p>
          </div>
        ) : pills.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Pill className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No medicines scheduled for today</h3>
            <p className="mt-1 text-sm text-muted-foreground">Relax and stay healthy!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pills.map(pill => (
              <Card key={pill._id} className="shadow-none sm:shadow-soft flex items-center transition-all hover:sm:shadow-soft-lg">
                <CardContent className="p-4 flex items-center gap-4 flex-grow">
                  <div className={`p-3 rounded-full ${getPillBg(pill.taken)}`}>
                    <Pill className={`h-6 w-6 ${getPillColor(pill.taken)}`} />
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold">{pill.medicineName}</p>
                    <p className="text-sm text-muted-foreground">{pill.dosage}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{pill.scheduledTime}</p>
                    {!pill.taken ? (
                      <div className="flex items-center gap-1 mt-2 justify-end">
                        <Button size="sm" variant="outline" className="h-8 bg-green-50 text-green-600 hover:bg-green-100 border-green-200" onClick={() => setConfirmation({ medId: pill._id, status: true, medName: pill.medicineName })}>
                          Mark Taken
                        </Button>
                      </div>
                    ) : (
                      <Badge className="mt-2 bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                        <Check className="w-3 h-3 mr-1" /> Taken
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold font-headline">Secure Medical Vault</h2>
          <Link href="/dashboard/reports" className="text-sm font-medium text-primary hover:underline group">
            Manage All <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
        <Card className="bg-gradient-to-br from-indigo-600 to-blue-700 border-none shadow-xl overflow-hidden relative group cursor-pointer" onClick={() => router.push('/dashboard/reports')}>
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 -m-12 h-64 w-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500"></div>
          <div className="absolute bottom-0 left-0 -m-8 h-32 w-32 bg-cyan-400/20 rounded-full blur-2xl"></div>

          <CardContent className="p-0 relative z-10">
            <div className="flex p-6 gap-5 items-center">
              <div className="h-16 w-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/20 text-white shrink-0 group-hover:scale-105 transition-transform duration-300">
                <Shield className="h-8 w-8 text-cyan-300" />
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-black text-white text-lg tracking-tight uppercase">Health Repository</h3>
                  <Badge className="bg-cyan-400/30 text-cyan-50 border-none text-[10px] font-bold uppercase tracking-widest">Encrypted</Badge>
                </div>
                <p className="text-sm text-blue-100/90 leading-snug">AI-driven analysis of your lab reports is stored here safely.</p>
              </div>
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                <ChevronRight className="text-white h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


