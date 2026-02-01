require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function checkAndFixUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to database\n');

        const User = mongoose.connection.collection('users');
        const user = await User.findOne({ email: 'geddadakarthik7@gmail.com' });

        if (!user) {
            console.log('❌ User not found!');
            return;
        }

        console.log('✅ User found:');
        console.log('Email:', user.email);
        console.log('Name:', user.name);
        console.log('Has password hash:', !!user.password);
        console.log('Password hash length:', user.password?.length);

        // Test the password
        const testPassword = 'karthik2005';
        const isMatch = await bcrypt.compare(testPassword, user.password);
        console.log('\n🔐 Password test:');
        console.log(`Testing password "${testPassword}":`, isMatch ? '✅ MATCH' : '❌ NO MATCH');

        if (!isMatch) {
            console.log('\n🔧 Fixing password...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(testPassword, salt);

            await User.updateOne(
                { email: 'geddadakarthik7@gmail.com' },
                { $set: { password: hashedPassword } }
            );

            console.log('✅ Password updated successfully!');

            // Verify the fix
            const updatedUser = await User.findOne({ email: 'geddadakarthik7@gmail.com' });
            const isNowMatch = await bcrypt.compare(testPassword, updatedUser.password);
            console.log('Verification:', isNowMatch ? '✅ Password now works!' : '❌ Still broken');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

checkAndFixUser();
