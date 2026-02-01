/**
 * Login Route Handler
 * POST /api/auth/login
 * Authenticates user and returns JWT token
 */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { getQRPublicUrl } from '@/lib/qr';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 ========== LOGIN ATTEMPT ==========');
    await dbConnect();

    const body = await request.json();
    const { email, password } = body;

    console.log('📥 Received login request');
    console.log('📧 Email received:', email);
    console.log('🔑 Password received:', password ? `[${password.length} chars]` : 'MISSING');

    // Validation
    if (!email || !password) {
      console.log('❌ Missing credentials - email:', !!email, 'password:', !!password);
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Normalize email: trim and lowercase (same as signup)
    const normalizedEmail = email.trim().toLowerCase();
    console.log('📧 Normalized email for query:', normalizedEmail);

    // Find user and include password field
    console.log('🔍 Querying database for user...');
    let user = await User.findOne({ email: normalizedEmail }).select('+password');

    // If password is not included, try alternative query
    if (user && !user.password) {
      console.log('⚠️ Password not included in first query, trying alternative...');
      user = await User.findOne({ email: normalizedEmail }).select('password email name firstName lastName qrCode emergencyDetailsCompleted');
    }

    if (!user) {
      console.log('❌ USER NOT FOUND in database');
      console.log('❌ Searched for email:', normalizedEmail);

      // Double check with different query
      const allUsers = await User.find({}).select('email');
      console.log('📊 Total users in DB:', allUsers.length);
      console.log('📊 Existing emails:', allUsers.map(u => u.email));

      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    console.log('✅ User found in database');
    console.log('📧 User email:', user.email);
    console.log('🆔 User ID:', user._id);
    console.log('🔐 Password exists:', !!user.password);

    // Bcrypt password comparison
    console.log('🔍 Comparing passwords using bcrypt...');
    console.log('🔑 Provided password:', password);
    console.log('🔑 Stored password hash:', user.password ? '[HASH]' : 'MISSING');

    // Use bcrypt comparison
    const isPasswordValid = await user.comparePassword(password);

    console.log('🔍 Password comparison result:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ INCORRECT PASSWORD');
      console.log('❌ Password comparison failed for user:', normalizedEmail);
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      );
    }

    console.log('✅ Password verified successfully');

    // Generate JWT token
    const token = await generateToken(user._id.toString(), user.email);
    console.log('✅ Login successful for user:', email);

    // Get QR public URL if QR code exists
    const qrPublicUrl = user.qrCode ? getQRPublicUrl(user.qrCode) : null;

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          qrCode: user.qrCode,
          qrPublicUrl: qrPublicUrl,
          emergencyDetailsCompleted: user.emergencyDetailsCompleted,
        },
      },
      { status: 200 }
    );

    // Set HTTP-only cookie
    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error('❌ Login error:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}
