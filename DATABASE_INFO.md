# Where User Signups Are Saved

## 📍 Storage Location

Your user signups are saved in **MongoDB Atlas Cloud Database**:

```
Cloud Provider:  MongoDB Atlas
Cluster Name:    cluster0
Cluster Host:    cluster0.vkernu3.mongodb.net
Database Name:   yuktah
Collection:      users
```

## 🗂️ Database Structure

```
MongoDB Atlas (Cloud)
└── Cluster: cluster0
    └── Database: yuktah
        ├── users              ← User signups saved here
        ├── admins             ← Admin accounts
        ├── medicalinfos       ← Medical information
        ├── familymembers      ← Family member records
        ├── reports            ← Medical reports
        ├── medicines          ← Medicine records
        ├── prescriptions      ← Prescriptions
        ├── pilltrackers       ← Pill tracking data
        ├── hospitals          ← Hospital accounts
        └── doctors            ← Doctor accounts
```

## 🌐 How to View Your Data

### Option 1: MongoDB Atlas Dashboard (Recommended)

1. **Go to:** https://cloud.mongodb.com/
2. **Login with:**
   - Email: geddadakarthik7@gmail.com
   - Password: (your MongoDB Atlas password)
3. **Navigate:**
   - Click on "Database" in left sidebar
   - Select your cluster: **cluster0**
   - Click "Browse Collections"
   - Select database: **yuktah**
   - Click on collection: **users**
4. **View:** All user signups will be displayed here

### Option 2: Using MongoDB Compass (Desktop App)

1. **Download:** https://www.mongodb.com/products/compass
2. **Install** MongoDB Compass
3. **Connect using:**
   ```
   mongodb+srv://geddadakarthik7_db_user:karthik2005@cluster0.vkernu3.mongodb.net/yuktah
   ```
4. **Browse:** Navigate to yuktah → users collection

### Option 3: Command Line (Current Method)

Run this script to view users:
```bash
node show_database_location.js
```

## 📊 What Gets Saved When Someone Signs Up

When a user creates an account, this data is saved:

```javascript
{
  _id: ObjectId("..."),              // Unique user ID
  email: "user@example.com",         // User's email (unique)
  password: "$2b$10$...",             // Bcrypt hashed password
  name: "John Doe",                  // Full name
  firstName: "John",                 // First name
  lastName: "Doe",                   // Last name
  qrCode: "YUKTAH-XXXX-XXXX",       // Unique QR code
  emergencyDetailsCompleted: false,  // Setup status
  createdAt: ISODate("..."),        // Signup timestamp
  updatedAt: ISODate("...")         // Last update timestamp
}
```

## 🔐 Security

- ✅ Passwords are **encrypted** with bcrypt (cannot be reversed)
- ✅ Data is stored in **MongoDB Atlas Cloud** (secure, backed up)
- ✅ Connection uses **SSL/TLS encryption**
- ✅ Database requires **authentication** (username/password)

## 📈 Current Status

- **Database:** yuktah
- **Collection:** users
- **Current Users:** 1 (geddadakarthik7@gmail.com)
- **Storage Used:** < 1 MB
- **Storage Available:** 512 MB (free tier)

## 🌍 Accessibility

Your data is stored in the **cloud**, which means:
- ✅ Accessible from anywhere with internet
- ✅ Automatically backed up by MongoDB Atlas
- ✅ No local storage required
- ✅ Survives computer restarts/crashes
- ✅ Can be accessed from multiple devices
