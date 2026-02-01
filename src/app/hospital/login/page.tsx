'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/icons/logo';
import { useToast } from '@/hooks/use-toast';

export default function HospitalLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/hospital/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            toast({
                title: "Welcome Back",
                description: "Authenticated successfully. Redirecting to console...",
            });

            router.push('/hospital/dashboard');
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "Authentication Failed",
                description: err.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
            <div className="flex flex-col items-center gap-6 mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-700">
                <Logo className="h-16" />
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">HOSPITAL PORTAL</h1>
                    <div className="flex items-center justify-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
                        <ShieldCheck className="w-4 h-4" /> Secure Administrative Access
                    </div>
                </div>
            </div>

            <Card className="w-full max-w-md shadow-2xl border-slate-800 bg-slate-900 ring-1 ring-slate-800 animate-in zoom-in-95 duration-500 text-slate-200">
                <CardHeader className="space-y-1 pb-6 text-center border-b border-slate-800">
                    <CardTitle className="text-xl font-bold font-headline text-slate-100">Sign In</CardTitle>
                    <CardDescription className="text-slate-400">Enter your hospital credentials to access the clinical dashboard.</CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-bold uppercase text-slate-400 tracking-wider">Email / Staff ID</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="dr.smith@hospital.com"
                                className="h-12 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:bg-slate-950 focus:border-blue-700 transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password" className="text-xs font-bold uppercase text-slate-400 tracking-wider">Secure Password</Label>
                                <button type="button" className="text-xs text-blue-500 hover:underline font-medium">Forgot?</button>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="h-12 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:bg-slate-950 focus:border-blue-700 transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-base font-bold shadow-lg shadow-blue-900/20 group transition-all" disabled={loading}>
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Activity className="w-4 h-4 animate-spin" /> Verifying...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Access Console <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="bg-slate-950/30 text-center text-[10px] text-slate-500 justify-center p-4 border-t border-slate-800 rounded-b-xl uppercase tracking-tighter">
                    Usage is monitored and recorded • Authorized Personnel Only
                </CardFooter>
            </Card>

            <p className="mt-8 text-sm text-slate-400 font-medium">
                Not a hospital? <button onClick={() => router.push('/login')} className="text-slate-600 hover:text-blue-600 transition-colors">Go to User Login</button>
            </p>
        </main>
    );
}

// Minimal icons used
function Activity(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
