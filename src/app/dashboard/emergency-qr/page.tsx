
/**
 * Emergency QR Code Management Page
 * Allows users to view, regenerate, and manage their emergency QR code
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEmergencyInfo } from '@/context/emergency-info-context';
import { useAuth } from '@/context/auth-context';
import { QRCodeDisplay } from '@/components/qr-code-display';
import { getEmergencyUrl } from '@/lib/emergency-token';
import { RefreshCw, AlertCircle, Download, User, Activity, Heart, Contact, Scissors, Plus, FileCheck } from 'lucide-react';
import { useReports } from '@/context/report-context';
import Link from 'next/link';
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
} from '@/components/ui/alert-dialog';

export default function EmergencyQrPage() {
  const { user } = useAuth();
  const { emergencyInfo, emergencyToken, generateAndStoreToken: genToken, setIsModalOpen } = useEmergencyInfo();
  const { reports } = useReports();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  const bloodGroupText = emergencyInfo.bloodGroup === 'Other' ? emergencyInfo.bloodGroupOther : emergencyInfo.bloodGroup;
  const allergiesText = emergencyInfo.allergies === 'Other' ? emergencyInfo.allergiesOther : emergencyInfo.allergies;
  const medicationsText = emergencyInfo.medications === 'Other' ? emergencyInfo.medicationsOther : emergencyInfo.medications;
  const hasData = (
    emergencyInfo.fullName ||
    emergencyInfo.bloodGroup ||
    emergencyInfo.allergies ||
    emergencyInfo.medications ||
    emergencyInfo.emergencyContact ||
    emergencyInfo.chronicConditions ||
    emergencyInfo.medicalNotes ||
    emergencyInfo.age ||
    emergencyInfo.weight ||
    emergencyInfo.hasPastSurgery
  );

  const emergencyUrl = emergencyToken ? getEmergencyUrl(emergencyToken) : '';

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await genToken();
      setShowRegenerateConfirm(false);
    } catch (error) {
      console.error('Error regenerating token:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleGenerateFirst = () => {
    genToken();
  };

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Emergency QR Code</h1>
          <p className="text-muted-foreground mt-2">
            Share a secure QR code with first responders to access your emergency information.
          </p>
        </div>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">No Emergency Data</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Please complete your emergency medical information first. This includes personal details, blood group, allergies, medications, and emergency contacts.
                </p>
                <Button onClick={() => setIsModalOpen(true)}>
                  Fill Emergency Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Emergency QR Code</h1>
          <p className="text-muted-foreground mt-1">
            Scan this code to access your vital health information instantly.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* QR Code Card */}
        <Card className="lg:col-span-1 flex flex-col items-center justify-center p-8 bg-white border-2">
          {emergencyToken ? (
            <div className="w-full flex flex-col items-center">
              <div className="p-4 bg-white rounded-2xl shadow-sm border mb-6">
                <QRCodeDisplay
                  qrData={emergencyUrl}
                  size={200}
                  showDescription={false}
                  copyableUrl={emergencyUrl}
                />
              </div>
              <p className="text-sm font-medium text-center text-gray-500 mb-8 max-w-[200px]">
                Ask first responders to scan this code in an emergency.
              </p>

              <div className="grid grid-cols-2 gap-3 w-full">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const canvas = document.querySelector('img[alt="Emergency QR Code"]');
                    if (canvas) {
                      const link = document.createElement('a');
                      link.href = (canvas as HTMLImageElement).src;
                      link.download = 'my-emergency-qr.png';
                      link.click();
                    }
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowRegenerateConfirm(true)}
                  disabled={isRegenerating}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                  Reset
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center p-4">
              <h3 className="font-semibold text-lg">Generate QR Code</h3>
              <p className="text-sm text-muted-foreground mt-2 mb-6">
                Create a unique, secure QR code for your profile.
              </p>
              <Button onClick={handleGenerateFirst} className="w-full h-11">
                Generate QR Code
              </Button>
            </div>
          )}
        </Card>

        {/* Info Grid */}
        <Card className="lg:col-span-2 overflow-hidden border-2">
          <div className="flex items-center justify-between p-6 border-b bg-gray-50/50">
            <h2 className="text-xl font-bold font-headline flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Live Emergency Profile
            </h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="bg-white border shadow-sm"
            >
              Edit Details
            </Button>
          </div>

          <CardContent className="p-0">
            <div className="grid sm:grid-cols-2">
              {/* Personal Section */}
              <div className="p-6 border-b sm:border-r space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-tight text-muted-foreground flex items-center gap-2 mb-4">
                  <User className="h-3.5 w-3.5" />
                  Primary Identity
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Name</p>
                    <p className="font-semibold text-lg">{emergencyInfo.fullName || 'Not provided'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Age</p>
                      <p className="font-semibold">{emergencyInfo.age || '--'} yrs</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Weight</p>
                      <p className="font-semibold">{emergencyInfo.weight || '--'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Physical State</p>
                    <p className="font-semibold">{emergencyInfo.bodyCondition || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Habits</p>
                    <p className="font-semibold text-sm">{emergencyInfo.badHabits || 'None reported'}</p>
                  </div>
                </div>
              </div>

              {/* Medical Section */}
              <div className="p-6 border-b space-y-4 bg-red-50/10">
                <h3 className="text-xs font-bold uppercase tracking-tight text-red-600 flex items-center gap-2 mb-4">
                  <Heart className="h-3.5 w-3.5" />
                  Medical Essentials
                </h3>
                <div className="space-y-4">
                  <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-xs text-red-600 mb-0.5">Blood Group</p>
                    <p className="font-bold text-2xl text-red-700">{bloodGroupText || '--'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Known Allergies</p>
                    <p className="font-semibold text-sm leading-tight text-orange-700">{allergiesText || 'No known allergies'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Chronic Conditions</p>
                    <p className="font-semibold text-sm leading-tight text-blue-700">{emergencyInfo.chronicConditions || 'None reported'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Current Medications</p>
                    <p className="font-semibold text-sm leading-tight">{medicationsText || 'None reported'}</p>
                  </div>
                </div>
              </div>

              {/* Surgeries Section */}
              <div className="p-6 sm:border-r border-b sm:border-b-0 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-tight text-purple-600 flex items-center gap-2 mb-4">
                  <Scissors className="h-3.5 w-3.5" />
                  Surgical History
                </h3>
                {emergencyInfo.hasPastSurgery ? (
                  <div className="space-y-4">
                    {emergencyInfo.surgery1Name && (
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <p className="font-semibold text-sm text-purple-800">{emergencyInfo.surgery1Name}</p>
                        <p className="text-xs text-purple-600 font-medium">{emergencyInfo.surgery1Date}</p>
                      </div>
                    )}
                    {emergencyInfo.surgery2Name && (
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <p className="font-semibold text-sm text-purple-800">{emergencyInfo.surgery2Name}</p>
                        <p className="text-xs text-purple-600 font-medium">{emergencyInfo.surgery2Date}</p>
                      </div>
                    )}
                    {emergencyInfo.surgery3Name && (
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <p className="font-semibold text-sm text-purple-800">{emergencyInfo.surgery3Name}</p>
                        <p className="text-xs text-purple-600 font-medium">{emergencyInfo.surgery3Date}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm font-medium text-muted-foreground">No past surgeries reported.</p>
                )}
              </div>

              {/* Contact Section */}
              <div className="p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-tight text-green-600 flex items-center gap-2 mb-4">
                  <Contact className="h-3.5 w-3.5" />
                  Emergency Contact
                </h3>
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-xs text-green-600 font-medium uppercase mb-2">Immediate Responder</p>
                  <p className="font-bold text-lg text-green-800 leading-tight">
                    {emergencyInfo.emergencyContact || 'Not set'}
                  </p>
                </div>
                {emergencyInfo.medicalNotes && (
                  <div className="mt-4 p-4 bg-red-50 rounded-xl border-l-4 border-red-500 animate-pulse-subtle">
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1 italic underline decoration-red-200 decoration-2">CRITICAL MEDICAL NOTE</p>
                    <p className="text-sm font-bold text-red-800 leading-tight">
                      "{emergencyInfo.medicalNotes}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NEW: Medical Reports & Documentation Section */}
        <Card className="lg:col-span-3 border-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6 border-b bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-xl font-bold font-headline flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-indigo-600" />
              Linked Documentation
            </h2>
            <Button asChild variant="outline" size="sm" className="bg-white hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
              <Link href="/dashboard/reports">
                <Plus className="h-4 w-4 mr-2" />
                Manage Reports
              </Link>
            </Button>
          </div>
          <CardContent className="p-6">
            {reports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.slice(0, 3).map((report) => (
                  <div key={report.id} className="p-4 rounded-xl border-2 border-indigo-50 bg-indigo-50/20 flex items-center gap-4 hover:border-indigo-200 hover:bg-indigo-50/40 transition-all cursor-pointer group">
                    <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                      <FileCheck className="h-6 w-6" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="font-bold text-sm text-gray-900 truncate">{report.title}</p>
                      <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">{report.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50/50 rounded-2xl border-2 border-dashed">
                <FileCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium text-muted-foreground">No reports linked to profile yet.</p>
                <p className="text-xs text-muted-foreground mt-1 text-center font-medium">Upload lab results to provide doctors with instant clinical context.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trust Banner */}
      <Card className="border-blue-100 bg-blue-50/50">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-sm">
            <p className="font-semibold text-blue-900">Your Data Security</p>
            <p className="text-blue-800/80">Information is encrypted and only accessible via this specific QR code token. You can regenerate the token anytime to revoke old access.</p>
          </div>
        </CardContent>
      </Card>

      {/* Regenerate Confirmation Dialog */}
      <AlertDialog open={showRegenerateConfirm} onOpenChange={setShowRegenerateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate QR Code?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new QR code with a different token. The old QR code link will immediately stop working. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRegenerate} disabled={isRegenerating} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isRegenerating ? 'Processing...' : 'Yes, Regenerate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
