require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function setupNewUser() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected successfully!');

        // Define schemas manually to avoid needing TS models
        const userSchema = new mongoose.Schema({
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            name: { type: String, required: true },
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
        }, { timestamps: true });

        const User = mongoose.models.User || mongoose.model('User', userSchema);

        // 1. Remove all existing users
        console.log('Removing all existing users...');
        const deleteResult = await User.deleteMany({});
        console.log(`Removed ${deleteResult.deletedCount} users.`);

        // 2. Create the new user
        const newEmail = 'geddadakarthik7@gmail.com';
        const newPassword = 'karthik2005';
        const newName = 'Karthik Geddada';

        console.log(`Creating new user: ${newEmail}`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await User.create({
            email: newEmail,
            password: hashedPassword,
            name: newName,
            firstName: 'Karthik',
            lastName: 'Geddada'
        });

        console.log('New user created successfully!');
        console.log('\n==================================');
        console.log('   USER CREDENTIALS CREATED');
        console.log('==================================');
        console.log(`Email:    ${newEmail}`);
        console.log(`Password: ${newPassword}`);
        console.log('==================================\n');

    } catch (error) {
        console.error('ERROR:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

setupNewUser();
