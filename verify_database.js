require('dotenv').config();
const mongoose = require('mongoose');

async function verifyDatabase() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        console.log('✓ Connected successfully!\n');

        // Check Users collection
        const User = mongoose.connection.collection('users');
        const users = await User.find({}).toArray();

        console.log('=== USERS COLLECTION ===');
        console.log(`Total users: ${users.length}`);
        if (users.length > 0) {
            users.forEach((user, idx) => {
                console.log(`${idx + 1}. Email: ${user.email}, Name: ${user.name || user.firstName || 'N/A'}`);
            });
        } else {
            console.log('No users found in database.');
        }

        // Check Admins collection
        console.log('\n=== ADMINS COLLECTION ===');
        const Admin = mongoose.connection.collection('admins');
        const admins = await Admin.find({}).toArray();

        console.log(`Total admins: ${admins.length}`);
        if (admins.length > 0) {
            admins.forEach((admin, idx) => {
                console.log(`${idx + 1}. Email: ${admin.email}, Name: ${admin.name || 'N/A'}`);
            });
        } else {
            console.log('No admins found in database.');
        }

        console.log('\n=== VERIFICATION COMPLETE ===');

        // Check if only Karthik's account exists
        const karthikEmail = 'geddadakarthik7@gmail.com';
        const hasKarthikUser = users.some(u => u.email === karthikEmail);
        const hasKarthikAdmin = admins.some(a => a.email === karthikEmail);
        const hasOtherUsers = users.some(u => u.email !== karthikEmail);
        const hasOtherAdmins = admins.some(a => a.email !== karthikEmail);

        console.log(`\n✓ Karthik user account exists: ${hasKarthikUser}`);
        console.log(`✓ Karthik admin account exists: ${hasKarthikAdmin}`);
        console.log(`✓ Other user accounts exist: ${hasOtherUsers}`);
        console.log(`✓ Other admin accounts exist: ${hasOtherAdmins}`);

        if (!hasOtherUsers && !hasOtherAdmins && (hasKarthikUser || hasKarthikAdmin)) {
            console.log('\n✅ SUCCESS: Only Karthik\'s credentials exist in the database!');
        } else if (hasOtherUsers || hasOtherAdmins) {
            console.log('\n⚠️  WARNING: Old credentials still exist in the database.');
        }

    } catch (error) {
        console.error('❌ ERROR:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

verifyDatabase();
