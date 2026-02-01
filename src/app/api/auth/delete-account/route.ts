import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import MedicalInfo from '@/models/MedicalInfo';
import { getReportModel } from '@/models/Report';
import { getAuthenticatedUser } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
    try {
        await dbConnect();

        // 1. Verify User
        const authUser = await getAuthenticatedUser(request);
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = authUser.userId;
        console.log(`⚠️ User Requested Account Deletion: ${userId}`);

        // 2. Delete Related Data
        // It's important to clean up all user data
        await MedicalInfo.deleteMany({ userId });
        const Report = await getReportModel();
        await Report.deleteMany({ userId });
        // Add other collections here if necessary (e.g., Prescriptions, FamilyMembers)

        // 3. Delete User Record
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        console.log(`✅ User Account Deleted: ${deletedUser.email}`);

        // 4. Clear Auth Cookie & Return User
        const response = NextResponse.json({
            success: true,
            message: 'Account deleted successfully'
        });

        response.cookies.set('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0,
            path: '/',
        });

        return response;

    } catch (error: any) {
        console.error('❌ Delete Account Error:', error);
        return NextResponse.json(
            { error: 'Failed to delete account' },
            { status: 500 }
        );
    }
}
