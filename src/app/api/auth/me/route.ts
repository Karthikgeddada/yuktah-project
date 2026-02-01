/**
 * Get Current User Route Handler
 * GET /api/auth/me
 * Returns the current authenticated user from JWT cookie
 */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getAuthenticatedUser } from '@/lib/auth';
import { getQRPublicUrl } from '@/lib/qr';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(request);

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    let userData: any = null;

    if (authUser.role === 'admin') {
      console.log('👑 Admin detected');
      userData = {
        id: authUser.userId,
        email: authUser.email,
        name: 'Admin User',
        role: 'admin'
      };
    } else if (authUser.role === 'hospital') {
      const { Types } = (await import('mongoose')).default;
      const Hospital = (await import('@/models/Hospital')).default;
      console.log('🏥 Hospital detected, searching for ID:', authUser.userId);
      const hospital = await Hospital.findById(new Types.ObjectId(authUser.userId));
      if (hospital) {
        console.log('✅ Hospital found:', hospital.name);
        userData = {
          id: hospital._id,
          email: hospital.email,
          name: hospital.name,
          role: 'hospital',
          hospitalRoles: hospital.roles
        };
      } else {
        console.log('❌ Hospital NOT found in database');
      }
    } else {
      const { Types } = (await import('mongoose')).default;
      console.log('👤 Regular user detected, searching for ID:', authUser.userId);
      const user = await User.findById(new Types.ObjectId(authUser.userId));
      if (user) {
        console.log('✅ User found:', user.name);
        const qrPublicUrl = user.qrCode ? getQRPublicUrl(user.qrCode) : null;
        userData = {
          id: user._id,
          email: user.email,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          qrCode: user.qrCode,
          qrPublicUrl: qrPublicUrl,
          emergencyDetailsCompleted: user.emergencyDetailsCompleted,
          role: 'user',
        };
      } else {
        console.log('❌ User NOT found in database');
      }
    }

    if (!userData) {
      console.log('⚠️  User not found - clearing invalid auth cookie');
      // Clear the invalid authentication cookie
      const response = NextResponse.json(
        { error: 'User not found in system' },
        { status: 401 }
      );
      response.cookies.set('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0, // Expire immediately
        path: '/',
      });
      return response;
    }

    return NextResponse.json({
      user: userData,
    });
  } catch (error) {
    console.error('❌ Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}

