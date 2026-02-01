
"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useEmergencyInfo } from "@/context/emergency-info-context";
import { useAuth } from "@/context/auth-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { type EmergencyInfo } from "@/lib/data";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Other"];
const commonAllergies = ["Penicillin", "Sulfa Drugs", "NSAIDs", "Peanuts", "Shellfish", "Milk", "Anesthesia Reaction", "No known allergies", "Other"];
const commonMeds = ["Metformin", "Lisinopril", "Atorvastatin", "Amlodipine", "No current medications", "Other"];

type SelectableField = 'bloodGroup' | 'allergies' | 'medications';

export function EmergencyInfoModal() {
  const { emergencyInfo, setEmergencyInfo, isModalOpen, setIsModalOpen, refreshEmergencyInfo } = useEmergencyInfo();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState<EmergencyInfo>(emergencyInfo);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      setFormData({
        ...emergencyInfo,
        fullName: emergencyInfo.fullName || '',
        age: emergencyInfo.age || '',
        weight: emergencyInfo.weight || '',
        dob: emergencyInfo.dob || '',
        birthYear: emergencyInfo.birthYear || '',
        bloodGroup: emergencyInfo.bloodGroup || '',
        bloodGroupOther: emergencyInfo.bloodGroupOther || '',
        allergies: emergencyInfo.allergies || '',
        allergiesOther: emergencyInfo.allergiesOther || '',
        medications: emergencyInfo.medications || '',
        medicationsOther: emergencyInfo.medicationsOther || '',
        emergencyContact: emergencyInfo.emergencyContact || '',
        bodyCondition: emergencyInfo.bodyCondition || '',
        badHabits: emergencyInfo.badHabits || '',
        surgery1Name: emergencyInfo.surgery1Name || '',
        surgery1Date: emergencyInfo.surgery1Date || '',
        surgery2Name: emergencyInfo.surgery2Name || '',
        surgery2Date: emergencyInfo.surgery2Date || '',
        surgery3Name: emergencyInfo.surgery3Name || '',
        surgery3Date: emergencyInfo.surgery3Date || '',
        hasPastSurgery: !!emergencyInfo.hasPastSurgery,
        chronicConditions: emergencyInfo.chronicConditions || '',
        medicalNotes: emergencyInfo.medicalNotes || ''
      });
    }
  }, [emergencyInfo, isModalOpen]);

  const handleSelectChange = (field: SelectableField) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      [`${field}Other`]: value === 'Other' ? prev[`${field}Other` as keyof EmergencyInfo] : ''
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, hasPastSurgery: checked }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/medical-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setEmergencyInfo(result.data || formData);
        setIsModalOpen(false);
        refreshUser();

        toast({
          title: "Profile Saved",
          description: "Your health details are now live.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Save Failure",
          description: result.details || result.error || "Database update issue.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: error.message
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen} >
      <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col p-0 overflow-hidden shadow-2xl border-0 bg-white">
        <DialogHeader className="p-6 border-b bg-white z-10">
          <DialogTitle className="font-headline text-2xl text-gray-900 text-center">Emergency Medical File</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 bg-gray-50/30 custom-scrollbar">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest">1. Personal Identity</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-gray-600">Full Name</Label>
                <Input id="fullName" placeholder="as per ID" value={formData.fullName || ''} onChange={handleInputChange} className="bg-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob" className="text-gray-600">Date of Birth</Label>
                <Input id="dob" type="date" value={formData.dob || ''} onChange={handleInputChange} className="bg-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age" className="text-gray-600">Current Age</Label>
                <Input id="age" placeholder="e.g. 25" value={formData.age || ''} onChange={handleInputChange} className="bg-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-gray-600">Body Weight</Label>
                <Input id="weight" placeholder="e.g. 70kg" value={formData.weight || ''} onChange={handleInputChange} className="bg-white" />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-red-600 uppercase tracking-widest">2. Medical Essentials</h3>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="bloodGroup" className="text-gray-600">Blood Group</Label>
                <div className="flex gap-2">
                  <Select onValueChange={handleSelectChange('bloodGroup')} value={formData.bloodGroup}>
                    <SelectTrigger className="bg-white"><SelectValue placeholder="Select Group" /></SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {formData.bloodGroup === 'Other' && (
                    <Input id="bloodGroupOther" value={formData.bloodGroupOther || ''} onChange={handleInputChange} placeholder="Specify" className="bg-white" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies" className="text-gray-600">Medicine & Food Allergies</Label>
                <div className="flex gap-2">
                  <Select onValueChange={handleSelectChange('allergies')} value={formData.allergies}>
                    <SelectTrigger className="bg-white"><SelectValue placeholder="Select Allergies" /></SelectTrigger>
                    <SelectContent>
                      {commonAllergies.map(allergy => <SelectItem key={allergy} value={allergy}>{allergy}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {formData.allergies === 'Other' && (
                    <Input id="allergiesOther" value={formData.allergiesOther || ''} onChange={handleInputChange} placeholder="Specify" className="bg-white" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="chronicConditions" className="text-gray-600">Chronic Medical Conditions</Label>
                <Input
                  id="chronicConditions"
                  placeholder="e.g. Asthma, Diabetes"
                  value={formData.chronicConditions || ''}
                  onChange={handleInputChange}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medications" className="text-gray-600">Current Medications</Label>
                <div className="flex gap-2">
                  <Select onValueChange={handleSelectChange('medications')} value={formData.medications}>
                    <SelectTrigger className="bg-white"><SelectValue placeholder="Select Regular Medication" /></SelectTrigger>
                    <SelectContent>
                      {commonMeds.map(med => <SelectItem key={med} value={med}>{med}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {formData.medications === 'Other' && (
                    <Input id="medicationsOther" value={formData.medicationsOther || ''} onChange={handleInputChange} placeholder="Specify" className="bg-white" />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-orange-600 uppercase tracking-widest">3. Lifestyle & Habits</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="bodyCondition" className="text-gray-600">Physical Condition</Label>
                <Input id="bodyCondition" placeholder="e.g. Athletic" value={formData.bodyCondition || ''} onChange={handleInputChange} className="bg-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="badHabits" className="text-gray-600">Bad Habits</Label>
                <Input id="badHabits" placeholder="e.g. Occasional Smoker" value={formData.badHabits || ''} onChange={handleInputChange} className="bg-white" />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-3 bg-white p-4 rounded-xl border border-gray-100">
              <Checkbox
                id="hasPastSurgery"
                checked={formData.hasPastSurgery}
                onCheckedChange={(c) => handleCheckboxChange(c as boolean)}
                className="h-5 w-5 border-purple-300 data-[state=checked]:bg-purple-600"
              />
              <Label htmlFor="hasPastSurgery" className="font-bold text-gray-700 cursor-pointer">Surgical History</Label>
            </div>
            {formData.hasPastSurgery && (
              <div className="space-y-6 pt-2 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-3 p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                  <Label className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Surgery 01</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input id="surgery1Name" value={formData.surgery1Name || ''} onChange={handleInputChange} placeholder="Procedure Name" className="bg-white" />
                    <Input id="surgery1Date" value={formData.surgery1Date || ''} onChange={handleInputChange} placeholder="Date (Month/Year)" className="bg-white" />
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                  <Label className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Surgery 02</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input id="surgery2Name" value={formData.surgery2Name || ''} onChange={handleInputChange} placeholder="Procedure Name" className="bg-white" />
                    <Input id="surgery2Date" value={formData.surgery2Date || ''} onChange={handleInputChange} placeholder="Date (Month/Year)" className="bg-white" />
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                  <Label className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Surgery 03</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input id="surgery3Name" value={formData.surgery3Name || ''} onChange={handleInputChange} placeholder="Procedure Name" className="bg-white" />
                    <Input id="surgery3Date" value={formData.surgery3Date || ''} onChange={handleInputChange} placeholder="Date (Month/Year)" className="bg-white" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100 pb-10">
            <h3 className="text-sm font-bold text-green-600 uppercase tracking-widest">4. Emergency Notes & Contact</h3>
            <div className="space-y-2">
              <Label htmlFor="medicalNotes" className="text-gray-600">Critical Medical Notes (Red Flags)</Label>
              <textarea
                id="medicalNotes"
                rows={3}
                placeholder="e.g. History of fainting, On blood thinners"
                value={formData.medicalNotes || ''}
                onChange={handleInputChange}
                className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="space-y-2 pt-2">
              <Label htmlFor="emergencyContact" className="text-gray-600">Immediate Responder</Label>
              <Input id="emergencyContact" placeholder="Name - Phone Number" value={formData.emergencyContact || ''} onChange={handleInputChange} className="bg-white h-12 text-lg font-medium" />
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 border-t bg-white z-10 sm:justify-center">
          <Button type="submit" onClick={handleSubmit} className="w-full h-14 text-lg font-bold shadow-xl shadow-blue-100" disabled={isSaving}>
            {isSaving ? 'Saving Changes...' : 'Save Emergency Information'}
          </Button>
        </DialogFooter>
      </DialogContent>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f1f5f9;
          border-radius: 10px;
        }
      `}</style>
    </Dialog>
  );
}
