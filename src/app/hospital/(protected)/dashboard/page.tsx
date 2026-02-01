'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import {
    QrCode,
    Search,
    User,
    Activity,
    AlertTriangle,
    Pill,
    Stethoscope,
    Droplet,
    Plus,
    Users,
    Trash2,
    CheckCircle,
    UserPlus,
    Building2,
    Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HospitalProfile {
    id: string;
    name: string;
    roles: string[];
}

interface PatientData {
    id: string;
    name: string;
    bloodGroup: string;
    allergies: string;
    medications: string;
    emergencyContact: string;
}

interface StaffMember {
    _id: string;
    name: string;
    email?: string;
    specialty?: string;
    location?: string;
    type: 'Doctor' | 'Pharmacy';
}

export default function HospitalDashboard() {
    const [profile, setProfile] = useState<HospitalProfile | null>(null);
    const [qrInput, setQrInput] = useState('');
    const [patient, setPatient] = useState<PatientData | null>(null);
    const [loading, setLoading] = useState(false);
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const { toast } = useToast();

    // Form states
    const [activeTab, setActiveTab] = useState('prescribe');
    const [medForm, setMedForm] = useState({
        name: '',
        dosage: '',
        time: '',
        instructions: '',
    });

    // Staff form
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [staffForm, setStaffForm] = useState({
        type: 'Doctor' as 'Doctor' | 'Pharmacy',
        name: '',
        email: '',
        specialty: '',
        location: '',
    });

    useEffect(() => {
        let isMounted = true;

        const initDashboard = async () => {
            try {
                console.log('🩺 HospitalDashboard: Initializing...');
                const res = await fetch('/api/hospital/me');
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || `Server returned ${res.status}`);
                }

                if (isMounted) {
                    console.log('✅ HospitalDashboard: Profile loaded', data.name);
                    setProfile(data);
                }

                // Fetch Staff separately
                const staffRes = await fetch('/api/hospital/staff');
                const staffData = await staffRes.json();
                if (staffRes.ok && isMounted) {
                    const combinedStaff: StaffMember[] = [
                        ...staffData.doctors.map((d: any) => ({ ...d, type: 'Doctor' })),
                        ...staffData.pharmacies.map((p: any) => ({ ...p, type: 'Pharmacy' }))
                    ];
                    setStaff(combinedStaff);
                }
            } catch (err: any) {
                console.error("❌ HospitalDashboard: Initialization failed", err);
                if (isMounted) {
                    toast({
                        title: "Console Error",
                        description: err.message || "Failed to load hospital data",
                        variant: "destructive"
                    });
                }
            }
        };

        initDashboard();
        return () => { isMounted = false; };
    }, []);

    const fetchStaff = async () => {
        try {
            const res = await fetch('/api/hospital/staff');
            const data = await res.json();
            if (res.ok) {
                const combinedStaff: StaffMember[] = [
                    ...data.doctors.map((d: any) => ({ ...d, type: 'Doctor' })),
                    ...data.pharmacies.map((p: any) => ({ ...p, type: 'Pharmacy' }))
                ];
                setStaff(combinedStaff);
            }
        } catch (error) {
            console.error("Failed to fetch staff", error);
        }
    };

    const handleScan = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!qrInput) return;

        setLoading(true);
        try {
            const res = await fetch('/api/hospital/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: qrInput }),
            });
            const data = await res.json();

            if (res.ok) {
                setPatient(data.patient);
                toast({ title: "Patient Found", description: `Loaded record for ${data.patient.name}` });
            } else {
                toast({ title: "Scan Failed", description: data.error, variant: "destructive" });
                setPatient(null);
            }
        } catch (error) {
            toast({ title: "Error", description: "Network error", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: 'prescribe' | 'dispense') => {
        if (!patient) return;
        setLoading(true);
        try {
            const endpoint = action === 'prescribe' ? '/api/hospital/prescribe' : '/api/hospital/dispense';
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: patient.id,
                    ...medForm
                }),
            });
            const data = await res.json();

            if (res.ok) {
                toast({ title: "Success", description: data.message });
                setMedForm({ name: '', dosage: '', time: '', instructions: '' });
            } else {
                toast({ title: "Error", description: data.error, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Operation failed", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/hospital/staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(staffForm),
            });
            const data = await res.json();
            if (res.ok) {
                toast({ title: "Success", description: `${staffForm.type} added successfully` });
                setIsStaffModalOpen(false);
                setStaffForm({ type: 'Doctor', name: '', email: '', specialty: '', location: '' });
                fetchStaff();
            } else {
                toast({ title: "Error", description: data.error, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to add staff", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    if (!profile) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Activity className="w-12 h-12 text-blue-500 animate-pulse" />
            <p className="text-slate-500 font-medium animate-pulse">Initializing hospital console...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-20 bg-black min-h-screen text-slate-200 font-sans">
            {/* Header / Banner */}
            <div className="border-b border-slate-800 bg-slate-950 p-6 sm:p-8">
                <div className="flex justify-between items-start max-w-6xl mx-auto">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-100 text-black p-2 rounded-lg">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <h1 className="text-3xl font-bold font-headline text-white tracking-tight">{profile.name}</h1>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                             <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800">
                                <Shield className="h-3 w-3" /> Secure Console
                            </span>
                            <span className="capitalize text-slate-500">{(profile.roles || []).join(' & ') || 'Staff Account'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="max-w-6xl mx-auto px-6 sm:px-8">
                <Tabs defaultValue="operations" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-sm mb-8 bg-slate-900 border border-slate-800 p-1 rounded-lg">
                        <TabsTrigger value="operations" className="rounded-md data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400 transition-all font-medium">
                            <Activity className="w-4 h-4 mr-2" /> Operations
                        </TabsTrigger>
                        <TabsTrigger value="staff" className="rounded-md data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400 transition-all font-medium">
                            <Users className="w-4 h-4 mr-2" /> Staff
                        </TabsTrigger>
                    </TabsList>

                {/* Operations Tab: Scanner & Patient Records */}
                <TabsContent value="operations" className="space-y-8">
                    {!patient ? (
                        <div className="max-w-xl mx-auto mt-12">
                            <Card className="border border-slate-800 bg-slate-900/50 shadow-none">
                                <CardContent className="pt-12 pb-12 text-center space-y-8">
                                    <div className="mx-auto w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                                        <QrCode className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-xl font-bold text-white uppercase tracking-wide">Patient Access</h2>
                                        <p className="text-slate-500 max-w-xs mx-auto text-sm">Scan patient QR code or enter secure token to access electronic health record.</p>
                                    </div>
                                    <form onSubmit={handleScan} className="max-w-sm mx-auto flex gap-2">
                                        <Input
                                            placeholder="Token ID"
                                            className="bg-black border-slate-800 text-white text-center font-mono placeholder:text-slate-700 focus:border-slate-600 focus:ring-0"
                                            value={qrInput}
                                            onChange={(e) => setQrInput(e.target.value)}
                                        />
                                        <Button className="bg-white text-black hover:bg-slate-200 font-bold" disabled={loading}>
                                            {loading ? '...' : 'Access'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Patient Info Sidebar */}
                            <div className="lg:col-span-4 space-y-6">
                                <Card className="overflow-hidden border border-slate-800 bg-slate-900 shadow-none">
                                    <div className="bg-slate-950 p-6 border-b border-slate-800">
                                        <div className="flex justify-between items-center mb-6">
                                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-800 -ml-2 h-8" onClick={() => { setPatient(null); setQrInput(''); }}>
                                                <QrCode className="w-3 h-3 mr-2" /> SCAN
                                            </Button>
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-950/30 border border-green-900/50 rounded text-[10px] font-bold text-green-500 uppercase tracking-wider">
                                                <CheckCircle className="w-3 h-3" /> Verified
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700 text-white">
                                                <User className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-white leading-tight">{patient.name}</h3>
                                                <p className="text-xs text-slate-500 font-mono mt-1 uppercase">ID: {patient.id.substring(0,8)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="grid grid-cols-2 gap-px bg-slate-800 border border-slate-800 rounded-lg overflow-hidden">
                                            <div className="bg-slate-900 p-4 text-center hover:bg-slate-800/50 transition-colors">
                                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-1">Blood Type</span>
                                                <span className="text-xl font-bold text-white">{patient.bloodGroup}</span>
                                            </div>
                                            <div className="bg-slate-900 p-4 text-center hover:bg-slate-800/50 transition-colors">
                                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-1">Status</span>
                                                <span className="text-sm font-bold text-slate-300">Active</span>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <Label className="text-slate-500 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
                                                    <AlertTriangle className="w-3 h-3" /> Critical Allergies
                                                </Label>
                                                <div className="p-3 bg-red-950/10 border border-red-900/20 rounded text-red-400 text-sm font-medium">
                                                    {patient.allergies || 'None reported'}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-slate-500 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
                                                    <Pill className="w-3 h-3" /> Current Meds
                                                </Label>
                                                <div className="p-3 bg-slate-950 border border-slate-800 rounded text-slate-300 text-sm font-mono leading-relaxed">
                                                    {patient.medications || 'None reported'}
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-slate-800">
                                                <Label className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-3 block">Emergency Contact</Label>
                                                <div className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded">
                                                    <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center text-slate-400">
                                                        <Users className="w-4 h-4" />
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-200">{patient.emergencyContact}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Clinical Actions */}
                            <div className="lg:col-span-8">
                                <Card className="border border-slate-800 bg-slate-900 shadow-none h-full">
                                    <CardHeader className="border-b border-slate-800 bg-slate-950/30">
                                        <CardTitle className="text-white">Clinical Intervention</CardTitle>
                                        <CardDescription className="text-slate-500">Issue prescriptions or dispense medications.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <Tabs defaultValue={(profile.roles || []).includes('pharmacy') && !(profile.roles || []).includes('doctor') ? 'dispense' : 'prescribe'} className="w-full">
                                            <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-950 border border-slate-800">
                                                <TabsTrigger value="prescribe" disabled={!(profile.roles || []).includes('doctor')} className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-500">
                                                    <Stethoscope className="w-4 h-4 mr-2" /> Prescribe (MD)
                                                </TabsTrigger>
                                                <TabsTrigger value="dispense" disabled={!(profile.roles || []).includes('pharmacy')} className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-500">
                                                    <Droplet className="w-4 h-4 mr-2" /> Dispense (Rx)
                                                </TabsTrigger>
                                            </TabsList>

                                            <div className="bg-slate-950/50 rounded-lg p-6 border border-slate-800 space-y-6">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-slate-400">Medicine Name</Label>
                                                        <Input
                                                            placeholder="e.g. Paracetamol"
                                                            className="bg-black border-slate-800 text-white placeholder:text-slate-700"
                                                            value={medForm.name}
                                                            onChange={e => setMedForm({ ...medForm, name: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-slate-400">Dosage</Label>
                                                        <Input
                                                            placeholder="e.g. 500mg"
                                                            className="bg-black border-slate-800 text-white placeholder:text-slate-700"
                                                            value={medForm.dosage}
                                                            onChange={e => setMedForm({ ...medForm, dosage: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-slate-400">Time/Frequency</Label>
                                                        <Input
                                                            placeholder="e.g. 8 AM / Once daily"
                                                            className="bg-black border-slate-800 text-white placeholder:text-slate-700"
                                                            value={medForm.time}
                                                            onChange={e => setMedForm({ ...medForm, time: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-slate-400">Route/Method</Label>
                                                        <Select>
                                                            <SelectTrigger className="bg-black border-slate-800 text-white">
                                                                <SelectValue placeholder="Oral (Tablet)" />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                                                <SelectItem value="oral">Oral (Tablet/Liquid)</SelectItem>
                                                                <SelectItem value="injection">Injection</SelectItem>
                                                                <SelectItem value="topical">Topical (Cream)</SelectItem>
                                                                <SelectItem value="other">Other</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-slate-400">Special Instructions</Label>
                                                    <Textarea
                                                        placeholder="e.g. Take after meals, skip if fever subsides"
                                                        className="bg-black border-slate-800 text-white placeholder:text-slate-700 resize-none"
                                                        rows={3}
                                                        value={medForm.instructions}
                                                        onChange={e => setMedForm({ ...medForm, instructions: e.target.value })}
                                                    />
                                                </div>

                                                <TabsContent value="prescribe">
                                                    <Button size="lg" className="w-full bg-slate-100 text-black hover:bg-white font-bold py-6 border border-transparent" onClick={() => handleAction('prescribe')} disabled={loading}>
                                                        {loading ? 'Processing...' : 'Confirm & Issue Prescription'}
                                                    </Button>
                                                </TabsContent>
                                                <TabsContent value="dispense">
                                                    <Button size="lg" className="w-full bg-slate-800 text-white hover:bg-slate-700 font-bold py-6 border border-slate-700" onClick={() => handleAction('dispense')} disabled={loading}>
                                                        {loading ? 'Processing...' : 'Mark as Dispensed'}
                                                    </Button>
                                                </TabsContent>
                                            </div>
                                        </Tabs>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </TabsContent>

                {/* Staff Management Tab */}
                <TabsContent value="staff" className="space-y-8">
                    <div className="flex justify-between items-center mb-6">
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-white">Medical Staff & Units</h2>
                            <p className="text-sm text-slate-500">Manage credentials linked to this hospital.</p>
                        </div>
                        <Dialog open={isStaffModalOpen} onOpenChange={setIsStaffModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-slate-100 text-black hover:bg-white border-transparent">
                                    <UserPlus className="w-4 h-4 mr-2" /> Add Staff
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-900 border-slate-800 text-slate-200">
                                <DialogHeader>
                                    <DialogTitle className="text-white">Add New Clinical Staff</DialogTitle>
                                    <DialogDescription className="text-slate-500">Assign a new doctor or pharmacy unit.</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleAddStaff} className="space-y-4 pt-4">
                                    {/* ... Input fields need dark mode classes here potentially, usually inherited, but explicitly setting just in case */}
                                    <div className="space-y-2">
                                        <Label className="text-slate-400">Account Type</Label>
                                        <Select
                                            value={staffForm.type}
                                            onValueChange={(v: any) => setStaffForm({ ...staffForm, type: v })}
                                        >
                                            <SelectTrigger className="bg-black border-slate-800 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                                <SelectItem value="Doctor">Doctor</SelectItem>
                                                <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-400">Name</Label>
                                        <Input
                                            className="bg-black border-slate-800 text-white"
                                            placeholder={staffForm.type === 'Doctor' ? 'Dr. Name' : 'Unit Name'}
                                            required
                                            value={staffForm.name}
                                            onChange={e => setStaffForm({ ...staffForm, name: e.target.value })}
                                        />
                                    </div>
                                    {staffForm.type === 'Doctor' ? (
                                        <>
                                            <div className="space-y-2">
                                                <Label className="text-slate-400">Email</Label>
                                                <Input
                                                    className="bg-black border-slate-800 text-white"
                                                    type="email"
                                                    required
                                                    value={staffForm.email}
                                                    onChange={e => setStaffForm({ ...staffForm, email: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-slate-400">Specialty</Label>
                                                <Input
                                                    className="bg-black border-slate-800 text-white"
                                                    value={staffForm.specialty}
                                                    onChange={e => setStaffForm({ ...staffForm, specialty: e.target.value })}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-2">
                                            <Label className="text-slate-400">Location</Label>
                                            <Input
                                                className="bg-black border-slate-800 text-white"
                                                value={staffForm.location}
                                                onChange={e => setStaffForm({ ...staffForm, location: e.target.value })}
                                            />
                                        </div>
                                    )}
                                    <DialogFooter className="pt-4">
                                        <Button type="submit" className="w-full bg-slate-100 text-black hover:bg-white" disabled={loading}>
                                            {loading ? '...' : 'Create Profile'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {staff.length === 0 ? (
                            <div className="col-span-full py-16 text-center border border-dashed rounded-xl border-slate-800 bg-slate-900/30">
                                <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                                <h3 className="font-bold text-slate-300">No staff members listed</h3>
                                <p className="text-slate-500 mb-6 text-sm">Start growing your team by adding your first unit.</p>
                                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => setIsStaffModalOpen(true)}>Add First Member</Button>
                            </div>
                        ) : staff.map(member => (
                            <Card key={member._id} className="border border-slate-800 bg-slate-900 hover:bg-slate-800 hover:border-slate-700 transition-all group">
                                <CardContent className="p-5 flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-black border border-slate-800 text-slate-400`}>
                                        {member.type === 'Doctor' ? <Stethoscope className="w-5 h-5" /> : <Droplet className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex justify-between items-start">
                                            <Badge className="bg-slate-800 text-slate-400 border-none mb-1 text-[10px] uppercase font-bold tracking-wider">
                                                {member.type}
                                            </Badge>
                                            <button className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-500 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <h4 className="font-bold text-white truncate">{member.name}</h4>
                                        <p className="text-xs text-slate-500 truncate mt-1">
                                            {member.type === 'Doctor' ? (member.specialty || 'General') : (member.location || 'Main Hospital')}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    </div>
    );
}
