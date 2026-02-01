// MongoDB Atlas Free Tier Storage Calculator
// Free tier: 512 MB (536,870,912 bytes)

const FREE_TIER_STORAGE = 512 * 1024 * 1024; // 512 MB in bytes

// Average document sizes (estimated)
const AVERAGE_SIZES = {
    user: 500,              // User document with bcrypt hash, name, email, etc.
    medicalInfo: 1000,      // Medical information
    familyMember: 300,      // Family member record
    report: 5000,           // Medical report (without file, just metadata)
    medicine: 200,          // Medicine record
    prescription: 400,      // Prescription
    pillTracking: 150,      // Pill tracking entry
};

// Assume average user has:
const AVERAGE_USER_DATA = {
    users: 1,
    medicalInfo: 1,
    familyMembers: 2,
    reports: 5,
    medicines: 3,
    prescriptions: 2,
    pillTracking: 10,
};

// Calculate total bytes per user
let totalBytesPerUser = 0;
totalBytesPerUser += AVERAGE_SIZES.user * AVERAGE_USER_DATA.users;
totalBytesPerUser += AVERAGE_SIZES.medicalInfo * AVERAGE_USER_DATA.medicalInfo;
totalBytesPerUser += AVERAGE_SIZES.familyMember * AVERAGE_USER_DATA.familyMembers;
totalBytesPerUser += AVERAGE_SIZES.report * AVERAGE_USER_DATA.reports;
totalBytesPerUser += AVERAGE_SIZES.medicine * AVERAGE_USER_DATA.medicines;
totalBytesPerUser += AVERAGE_SIZES.prescription * AVERAGE_USER_DATA.prescriptions;
totalBytesPerUser += AVERAGE_SIZES.pillTracking * AVERAGE_USER_DATA.pillTracking;

// Calculate maximum users
const maxUsers = Math.floor(FREE_TIER_STORAGE / totalBytesPerUser);

console.log('=== MongoDB Atlas Free Tier Capacity ===\n');
console.log('Total Storage Available: 512 MB');
console.log(`Average Storage Per User: ${(totalBytesPerUser / 1024).toFixed(2)} KB`);
console.log(`\n📊 ESTIMATED MAXIMUM USERS: ${maxUsers.toLocaleString()}`);

console.log('\n=== Breakdown Per User ===');
console.log(`User Document:        ${AVERAGE_SIZES.user} bytes`);
console.log(`Medical Info:         ${AVERAGE_SIZES.medicalInfo} bytes`);
console.log(`Family Members (2):   ${AVERAGE_SIZES.familyMember * AVERAGE_USER_DATA.familyMembers} bytes`);
console.log(`Reports (5):          ${AVERAGE_SIZES.report * AVERAGE_USER_DATA.reports} bytes`);
console.log(`Medicines (3):        ${AVERAGE_SIZES.medicine * AVERAGE_USER_DATA.medicines} bytes`);
console.log(`Prescriptions (2):    ${AVERAGE_SIZES.prescription * AVERAGE_USER_DATA.prescriptions} bytes`);
console.log(`Pill Tracking (10):   ${AVERAGE_SIZES.pillTracking * AVERAGE_USER_DATA.pillTracking} bytes`);
console.log(`TOTAL:                ${totalBytesPerUser} bytes (${(totalBytesPerUser / 1024).toFixed(2)} KB)`);

console.log('\n=== Different Scenarios ===');

// Minimal user (just signed up)
const minimalUser = AVERAGE_SIZES.user + AVERAGE_SIZES.medicalInfo;
const maxMinimalUsers = Math.floor(FREE_TIER_STORAGE / minimalUser);
console.log(`Minimal users (just signed up): ~${maxMinimalUsers.toLocaleString()} users`);

// Active user with lots of data
const activeUserBytes = totalBytesPerUser * 2;
const maxActiveUsers = Math.floor(FREE_TIER_STORAGE / activeUserBytes);
console.log(`Active users (lots of data):    ~${maxActiveUsers.toLocaleString()} users`);

console.log('\n=== Recommendations ===');
console.log('✅ Free tier is suitable for: 10,000 - 30,000 users');
console.log('⚠️  Consider upgrading when you reach: 20,000 users');
console.log('💡 Paid tier (M10) starts at $0.08/hour (~$57/month)');
console.log('   - 10 GB storage (20x more)');
console.log('   - Dedicated RAM');
console.log('   - Better performance');
