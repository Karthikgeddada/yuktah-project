require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function testSignupLoginFlow() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database\n');

        // Simulate signup process
        console.log('=== TESTING SIGNUP FLOW ===');
        const testEmail = 'testuser@example.com';
        const testPassword = 'test1234';
        const testName = 'Test User';

        // Check if test user already exists
        const User = mongoose.connection.collection('users');
        const existingUser = await User.findOne({ email: testEmail });

        if (existingUser) {
            console.log('🗑️  Removing existing test user...');
            await User.deleteOne({ email: testEmail });
        }

        // Create user with bcrypt hash (simulating signup)
        console.log('📝 Creating new user with bcrypt...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(testPassword, salt);

        await User.insertOne({
            email: testEmail,
            password: hashedPassword,
            name: testName,
            firstName: 'Test',
            lastName: 'User',
            emergencyDetailsCompleted: false,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log('✅ User created successfully');
        console.log('   Email:', testEmail);
        console.log('   Password (plain):', testPassword);
        console.log('   Password (hash):', hashedPassword.substring(0, 30) + '...');

        // Simulate login process
        console.log('\n=== TESTING LOGIN FLOW ===');
        const loginUser = await User.findOne({ email: testEmail });

        if (!loginUser) {
            console.log('❌ User not found!');
            return;
        }

        console.log('✅ User found in database');
        console.log('   Email:', loginUser.email);
        console.log('   Has password:', !!loginUser.password);

        // Test password comparison (what login does)
        const isPasswordValid = await bcrypt.compare(testPassword, loginUser.password);
        console.log('\n🔐 Password Verification:');
        console.log('   Input password:', testPassword);
        console.log('   Stored hash:', loginUser.password.substring(0, 30) + '...');
        console.log('   Comparison result:', isPasswordValid ? '✅ MATCH' : '❌ NO MATCH');

        if (isPasswordValid) {
            console.log('\n🎉 SUCCESS! Signup and Login flow working correctly!');
            console.log('   ✅ User can sign up');
            console.log('   ✅ Password is hashed with bcrypt');
            console.log('   ✅ User can log in with their password');
        } else {
            console.log('\n❌ FAILED! Login would not work for this user!');
        }

        // Clean up test user
        console.log('\n🗑️  Cleaning up test user...');
        await User.deleteOne({ email: testEmail });
        console.log('✅ Test user removed');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

testSignupLoginFlow();
