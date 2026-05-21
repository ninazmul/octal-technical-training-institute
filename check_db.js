const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Read .env.local
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('.env.local not found');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/MONGODB_URI\s*=\s*([^\s]+)/);
if (!match) {
  console.error('MONGODB_URI not found in .env.local');
  process.exit(1);
}

const mongoUri = match[1].replace(/['"]/g, '');

async function run() {
  try {
    await mongoose.connect(mongoUri, {
      dbName: "landing-page",
    });
    console.log('Connected to MongoDB');

    // Get settings collection
    const settingsColl = mongoose.connection.collection('settings');
    const settings = await settingsColl.findOne({});

    if (!settings) {
      console.log('No settings document found in database.');
    } else {
      console.log('Settings found:');
      console.log('Logo:', settings.logo);
      console.log('Certificate field:', settings.certificate);
      console.log('Theme:', settings.theme);
    }
  } catch (err) {
    console.error('Error connecting/querying database:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
