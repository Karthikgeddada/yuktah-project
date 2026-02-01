require('dotenv').config();
const mongoose = require('mongoose');

async function showDatabaseInfo() {
    try {
        console.log('=== DATABASE CONFIGURATION ===\n');

        // Show connection string (masked password)
        const uri = process.env.MONGODB_URI;
        const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
        console.log('📍 Database Location:');
        console.log(`   ${maskedUri}\n`);

        // Parse the connection string
        const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)/);
        if (match) {
            console.log('🔐 Connection Details:');
            console.log(`   Username: ${match[1]}`);
            console.log(`   Cluster:  ${match[3]}`);
            console.log(`   Database: ${match[4]}`);
            console.log('');
        }

        // Connect and show actual data
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database\n');

        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📦 Collections in Database:');
        collections.forEach(col => {
            console.log(`   - ${col.name}`);
        });
        console.log('');

        // Show user count
        const User = mongoose.connection.collection('users');
        const userCount = await User.countDocuments({});
        console.log(`👥 Total Users Signed Up: ${userCount}\n`);

        if (userCount > 0) {
            console.log('📋 Current Users:');
            const users = await User.find({}).project({ email: 1, name: 1, createdAt: 1 }).toArray();
            users.forEach((user, idx) => {
                const date = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
                console.log(`   ${idx + 1}. ${user.email} - ${user.name} (Created: ${date})`);
            });
        }

        console.log('\n=== WHERE TO VIEW YOUR DATA ===\n');
        console.log('🌐 MongoDB Atlas Dashboard:');
        console.log('   1. Go to: https://cloud.mongodb.com/');
        console.log('   2. Login with your MongoDB account');
        console.log('   3. Select your cluster: cluster0');
        console.log('   4. Click "Browse Collections"');
        console.log('   5. Select database: yuktah');
        console.log('   6. View collection: users\n');

        console.log('📊 Database Structure:');
        console.log('   Cloud Provider: MongoDB Atlas');
        console.log('   Cluster Name:   cluster0');
        console.log('   Database Name:  yuktah');
        console.log('   Collection:     users (where signups are saved)');
        console.log('   Location:       Cloud (accessible from anywhere)');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

showDatabaseInfo();
