import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import MedicalInfo from '@/models/MedicalInfo';
import EmergencyToken from '@/models/EmergencyToken';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const hospital = await getAuthenticatedUser(request);
        if (!hospital || hospital.role !== 'hospital') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await dbConnect();
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({ error: 'QR Token is required' }, { status: 400 });
        }

        // Find active token in EmergencyToken collection
        const emergencyToken = await EmergencyToken.findOne({
            token,
            isActive: true,
        });

        if (!emergencyToken) {
            return NextResponse.json({ error: 'Invalid or expired QR Code' }, { status: 404 });
        }

        // Find user by token's userId
        const user = await User.findById(emergencyToken.userId);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch Medical Info
        const medicalInfo = await MedicalInfo.findOne({ userId: user._id });

        // Construct response with more fields
        return NextResponse.json({
            success: true,
            patient: {
                id: user._id,
                name: user.name || `${user.firstName} ${user.lastName}`,
                email: user.email,
                bloodGroup: medicalInfo?.bloodGroup || 'Not set',
                allergies: medicalInfo?.allergies || 'None listed',
                medications: medicalInfo?.medications || 'None listed',
                emergencyContact: medicalInfo?.emergencyContact || 'None listed',
            }
        });

    } catch (error: any) {
        console.error('Scan Error:', error);
        return NextResponse.json({ error: 'Failed to process scan' }, { status: 500 });
    }
}
