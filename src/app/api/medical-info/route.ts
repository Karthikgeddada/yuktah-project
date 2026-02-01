
/**
 * Medical Info Routes
 * GET /api/medical-info - Get user's medical info
 * POST /api/medical-info - Create/update user's medical info
 */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MedicalInfo from '@/models/MedicalInfo';
import User from '@/models/User';
import { getAuthenticatedUser } from '@/lib/auth';

// GET - Fetch user's medical information
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const medicalInfo = await MedicalInfo.findOne({ userId: authUser.userId }).lean();

    return NextResponse.json({
      success: true,
      data: medicalInfo || {}
    });
  } catch (error: any) {
    console.error('❌ Get medical info error:', error);
    return NextResponse.json({ error: 'Failed to fetch', details: error.message }, { status: 500 });
  }
}

// POST - Create or update medical information
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // 1. CLEAR LIST OF VALID FIELDS
    const validFields = [
      'fullName', 'birthYear', 'age', 'dob', 'weight', 'bodyCondition', 'badHabits',
      'hasPastSurgery', 'surgery1Name', 'surgery1Date', 'surgery2Name', 'surgery2Date',
      'surgery3Name', 'surgery3Date',
      'bloodGroup', 'bloodGroupOther', 'allergies', 'allergiesOther', 'medications',
      'medicationsOther', 'emergencyContact', 'chronicConditions', 'medicalNotes'
    ];

    const updateData: any = {};

    validFields.forEach(field => {
      if (body[field] !== undefined) {
        let val = body[field];

        // CRITICAL FIX: Ensure array values (like []) are converted to empty strings
        // This fixes the "Cast to string failed for value []" error
        if (Array.isArray(val)) {
          val = val.join(', ');
        }

        // Ensure null/undefined become empty strings for text fields
        if (field !== 'hasPastSurgery' && (val === null || val === undefined)) {
          val = '';
        }

        updateData[field] = val;
      }
    });

    console.log('📝 Cleaned Update Data:', updateData);

    // 2. PERFORM UPDATE
    const medicalInfo = await MedicalInfo.findOneAndUpdate(
      { userId: authUser.userId },
      { $set: { ...updateData, userId: authUser.userId } },
      {
        new: true,
        upsert: true,
        runValidators: false,
        setDefaultsOnInsert: true
      }
    ).lean();

    // 3. Update User Flag
    await User.findByIdAndUpdate(authUser.userId, {
      emergencyDetailsCompleted: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Profile Updated',
      data: medicalInfo
    });
  } catch (error: any) {
    console.error('❌ DATABASE UPDATE FAILED:', error.message);

    return NextResponse.json({
      error: 'Database Rejected Update',
      details: error.message
    }, { status: 500 });
  }
}
