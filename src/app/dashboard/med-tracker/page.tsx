
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, Pill, Plus, Trash2, CalendarIcon, Camera } from "lucide-react";
import { type Medicine } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useMedicine } from '@/context/medicine-context';

export default function MedTrackerPage() {
    const { medicines, setMedicines, loading, refreshMedicines } = useMedicine();
    const [adherence, setAdherence] = useState(0);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [confirmation, setConfirmation] = useState<{medId: string | number, status: boolean, medName: string} | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const [newMedName, setNewMedName] = useState('');
    const [newMedDosage, setNewMedDosage] = useState('');
    const [newMedTime, setNewMedTime] = useState('');


    useEffect(() => {
        // When the selected date changes, you would typically fetch the
        // medication for that day. For this demo, we do not change the data.
    }, [selectedDate]);

    useEffect(() => {
        const takenCount = medicines.filter(m => m.taken === true).length;
        const skippedCount = medicines.filter(m => m.taken === false).length;
        const totalDecided = takenCount + skippedCount;
        const newAdherence = totalDecided > 0 ? Math.round((takenCount / totalDecided) * 100) : 0;
        setAdherence(newAdherence);
    }, [medicines]);

    const handleDose = async (id: string | number, status: boolean) => {
        // Optimistically update UI
        setMedicines(medicines.map(med => med.id === id ? {...med, taken: status} : med));
        
        // Sync with backend
        try {
            const response = await fetch(`/api/medicines/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ taken: status }),
            });

            if (!response.ok) {
                // Revert on error
                await refreshMedicines();
                console.error('Failed to update medicine status');
            }
        } catch (error) {
            console.error('Error updating medicine status:', error);
            // Revert on error
            await refreshMedicines();
        }
    };

    const handleAddMedicine = async () => {
        if (!newMedName || !newMedDosage || !newMedTime) {
            // Simple validation
            alert('Please fill out all fields.');
            return;
        }

        setIsAdding(true);
        try {
            const response = await fetch('/api/medicines', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newMedName,
                    dosage: newMedDosage,
                    time: newMedTime,
                    frequency: 'Once daily', // Default
                }),
            });

            if (response.ok) {
                // Refresh medicines from backend
                await refreshMedicines();
                // Reset form and close modal
                setNewMedName('');
                setNewMedDosage('');
                setNewMedTime('');
                setIsAddModalOpen(false);
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to add medicine');
            }
        } catch (error) {
            console.error('Error adding medicine:', error);
            alert('Failed to add medicine. Please try again.');
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemoveMedicine = async (id: string | number) => {
        try {
            const response = await fetch(`/api/medicines/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Refresh medicines from backend
                await refreshMedicines();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to delete medicine');
                // Revert on error
                await refreshMedicines();
            }
        } catch (error) {
            console.error('Error deleting medicine:', error);
            alert('Failed to delete medicine. Please try again.');
            // Revert on error
            await refreshMedicines();
        }
    };
    
    const handleConfirmDose = () => {
        if (confirmation) {
            handleDose(confirmation.medId, confirmation.status);
            setConfirmation(null);
        }
    }

    return (
        <div className="space-y-6 sm:space-y-8 p-4 sm:p-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-headline">Medicine & Pill Tracker</h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        Stay on top of your medication schedule.
                    </p>
                </div>
                 <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto mt-4 sm:mt-0">
                            <Plus className="mr-2 h-4 w-4"/> Add Medicine
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Medicine</DialogTitle>
                            <DialogDescription>
                                Enter the details for your new medication.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="med-name">Medicine Name</Label>
                                <Input id="med-name" placeholder="e.g., Atorvastatin" value={newMedName} onChange={(e) => setNewMedName(e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="med-dosage">Dosage</Label>
                                <Input id="med-dosage" placeholder="e.g., 20mg" value={newMedDosage} onChange={(e) => setNewMedDosage(e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="med-time">Time</Label>
                                <Input id="med-time" type="time" value={newMedTime} onChange={(e) => setNewMedTime(e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isAdding}>Cancel</Button>
                            <Button onClick={handleAddMedicine} disabled={isAdding}>
                                {isAdding ? 'Adding...' : 'Add'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Daily Adherence</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                         <p className="text-3xl font-bold">{adherence}%</p>
                         <div className="w-2/3">
                            <Progress value={adherence} />
                         </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-between items-center">
                <h2 className="text-lg sm:text-xl font-bold font-headline">
                    Schedule for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Today'}
                </h2>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        size={"sm"}
                        className={cn(
                        "w-auto justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? <span className="hidden sm:inline">{format(selectedDate, "PPP")}</span> : <span>Pick a date</span>}
                         <span className="sm:hidden">{selectedDate ? format(selectedDate, "MM/dd") : 'Date'}</span>
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
            </div>
             {loading ? (
                <div className="text-center py-20">
                    <p className="text-muted-foreground">Loading medicines...</p>
                </div>
             ) : medicines.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-lg">
                    <Pill className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No medicines prescribed yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Add medications manually or scan a prescription to get started.</p>
                     <div className="mt-6 flex justify-center gap-4">
                        <Button onClick={() => setIsAddModalOpen(true)}>
                            <Plus className="mr-2 h-4 w-4"/> Add Manually
                        </Button>
                        <Button variant="secondary" asChild>
                            <Link href="/dashboard/add-prescription">
                                <Camera className="mr-2 h-4 w-4"/> Scan Prescription
                            </Link>
                        </Button>
                    </div>
                </div>
             ) : null}
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
            <div className="grid gap-4 sm:gap-6 md:grid-cols-1 lg:grid-cols-2">
                {medicines.map((med) => (
                    <Card key={med.id} className="shadow-none sm:shadow-soft flex flex-col transition-all hover:sm:shadow-soft-lg">
                        <CardContent className="p-4 flex items-center gap-4">
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive"/>
                                        <span className="sr-only">Remove</span>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete this medication from your schedule.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleRemoveMedicine(med.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <div className="p-3 bg-primary/10 rounded-full">
                                <Pill className="h-6 w-6 text-primary"/>
                            </div>
                            <div className="flex-grow">
                                <p className="font-semibold">{med.name}</p>
                                <p className="text-sm text-muted-foreground">{med.dosage}</p>
                            </div>
                             <div className="text-right">
                                <p className="text-sm font-medium text-foreground">{med.time}</p>
                                {med.taken === null ? (
                                    <div className="flex items-center gap-1 mt-2">
                                       <Button size="icon" variant="outline" className="h-8 w-8 bg-red-100/50 border-red-200 text-red-600 hover:bg-red-100" onClick={() => setConfirmation({medId: med.id, status: false, medName: med.name})}>
                                            <X className="h-4 w-4"/>
                                        </Button>
                                        <Button size="icon" variant="outline" className="h-8 w-8 bg-green-100/50 border-green-200 text-green-600 hover:bg-green-100" onClick={() => setConfirmation({medId: med.id, status: true, medName: med.name})}>
                                            <Check className="h-4 w-4"/>
                                        </Button>
                                    </div>
                                ) : med.taken === true ? (
                                    <Badge className="mt-2" variant="secondary">Taken</Badge>
                                ) : (
                                    <Badge className="mt-2" variant="destructive">Skipped</Badge>
                                )}
                            </div>
                           
                        </CardContent>
                    </Card>
                ))}
            </div>
             <div className="sm:hidden h-20"></div> {/* Spacer for bottom nav */}
        </div>
    );
}

    