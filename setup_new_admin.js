require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function setupNewAdmin() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected successfully!');

        const adminSchema = new mongoose.Schema({
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            name: { type: String, required: true }
        }, { timestamps: true });

        const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

        // 1. Remove all existing admins
        console.log('Removing all existing admins...');
        const deleteResult = await Admin.deleteMany({});
        console.log(`Removed ${deleteResult.deletedCount} admins.`);

        // 2. Create the new admin
        const newEmail = 'geddadakarthik7@gmail.com';
        const newPassword = 'karthik2005';
        const newName = 'Karthik Admin';

        console.log(`Creating new admin: ${newEmail}`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await Admin.create({
            email: newEmail,
            password: hashedPassword,
            name: newName
        });

        console.log('New admin created successfully!');
        console.log('\n==================================');
        console.log('   ADMIN CREDENTIALS CREATED');
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

setupNewAdmin();
