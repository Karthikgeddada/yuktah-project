/**
 * API Route: GET /api/emergency/[token]
 * 
 * Returns emergency information for a given token
 * NO AUTHENTICATION REQUIRED - Public endpoint
 * 
 * Security:
 * - Token must be valid UUID format
 * - Only returns emergency-relevant data
 * - No user ID, email, or password exposed
 */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EmergencyToken from '@/models/EmergencyToken';
import MedicalInfo from '@/models/MedicalInfo';
import User from '@/models/User';

interface EmergencyData {
  userName: string;
  bloodGroup: string;
  bloodGroupOther: string;
  allergies: string;
  allergiesOther: string;
  medications: string;
  medicationsOther: string;
  emergencyContact: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;

    // Validate token format
    if (!token || !isValidUUID(token)) {
      return NextResponse.json(
        { error: 'Invalid emergency token format' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find active token in database
    const emergencyToken = await EmergencyToken.findOne({
      token,
      isActive: true,
    });

    if (!emergencyToken) {
      return NextResponse.json(
        { error: 'Invalid or expired emergency QR' },
        { status: 404 }
      );
    }

    // Get user information
    const user = await User.findById(emergencyToken.userId);
    // If user deleted but token exists, we should probably invalidate token, but for now just error
    if (!user) {
      return NextResponse.json(
        { error: 'User profile associated with this QR code no longer exists' },
        { status: 404 }
      );
    }

    // Get medical information
    const medicalInfo = await MedicalInfo.findOne({
      userId: emergencyToken.userId,
    });

    // Format emergency contact - handle both string and object formats
    let emergencyContactString = '';
    if (medicalInfo?.emergencyContact) {
      if (typeof medicalInfo.emergencyContact === 'string') {
        emergencyContactString = medicalInfo.emergencyContact;
      } else if (typeof medicalInfo.emergencyContact === 'object' && medicalInfo.emergencyContact !== null) {
        // Handle old object format: {name, phone, relationship}
        const contact = medicalInfo.emergencyContact as any;
        if (contact.name && contact.phone) {
          emergencyContactString = `${contact.name} - ${contact.phone}`;
          if (contact.relationship) {
            emergencyContactString += ` (${contact.relationship})`;
          }
        } else if (contact.name) {
          emergencyContactString = contact.name;
        } else if (contact.phone) {
          emergencyContactString = contact.phone;
        }
      }
    }

    // Format emergency data
    const emergencyData: EmergencyData = {
      userName: user.name || (user.firstName ? `${user.firstName} ${user.lastName}` : 'Unknown'),
      bloodGroup: medicalInfo?.bloodGroup || 'NOT PROVIDED',
      bloodGroupOther: medicalInfo?.bloodGroupOther || '',
      allergies: medicalInfo?.allergies || '',
      allergiesOther: medicalInfo?.allergiesOther || '',
      medications: medicalInfo?.medications || '',
      medicationsOther: medicalInfo?.medicationsOther || '',
      emergencyContact: emergencyContactString || 'NO EMERGENCY CONTACT PROVIDED',
    };

    // Return only public emergency fields
    return NextResponse.json(emergencyData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error in emergency info API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Validate UUID v4 format
 */
function isValidUUID(token: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(token);
}
