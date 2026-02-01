require('dotenv').config();
const mongoose = require('mongoose');

async function test() {
    console.log('Testing MONGODB_URI...');
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MONGODB_URI: SUCCESS');
        await mongoose.disconnect();
    } catch (e) {
        console.error('MONGODB_URI: FAILED', e.message);
    }

    console.log('\nTesting MONGODB_URI_REPORTS...');
    try {
        // use createConnection for separate connection if needed, but connect is enough to test URI
        await mongoose.connect(process.env.MONGODB_URI_REPORTS);
        console.log('MONGODB_URI_REPORTS: SUCCESS');
        await mongoose.disconnect();
    } catch (e) {
        console.error('MONGODB_URI_REPORTS: FAILED', e.message);
    }
}

test();
