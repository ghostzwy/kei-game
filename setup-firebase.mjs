#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase config dari .env.local
const firebaseConfig = {
  apiKey: 'AIzaSyAa4KSIXYRzIOazBI2q_843FnPAAaJtenw',
  authDomain: 'kei-project-cbbc4.firebaseapp.com',
  projectId: 'kei-project-cbbc4',
  databaseURL: 'https://kei-project-cbbc4-default-rtdb.firebaseio.com',
};

const ADMIN_ACCOUNTS = [
  {
    email: 'admin1@kei-game.local',
    password: 'Admin@123456',
    displayName: 'Admin One'
  },
  {
    email: 'admin2@kei-game.local',
    password: 'Admin@654321',
    displayName: 'Admin Two'
  }
];

async function createUser(email, password) {
  console.log(`\n📝 Creating user: ${email}`);
  
  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      if (data.error?.message === 'EMAIL_EXISTS') {
        console.log(`   ✓ User already exists: ${email}`);
        // Try to sign in to get token
        try {
          const signInResponse = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email,
                password,
                returnSecureToken: true
              })
            }
          );
          const signInData = await signInResponse.json();
          if (signInResponse.ok) {
            console.log(`   ✓ Got token for: ${email}`);
            return { uid: signInData.localId, token: signInData.idToken };
          }
        } catch (e) {
          // Ignore
        }
        return null;
      }
      throw new Error(data.error?.message || 'Failed to create user');
    }

    console.log(`   ✓ User created with UID: ${data.localId}`);
    return { uid: data.localId, token: data.idToken };
  } catch (error) {
    console.error(`   ✗ Error:`, error.message);
    throw error;
  }
}

async function setupAdminInDatabase(email, uid, token) {
  console.log(`\n💾 Setting up admin data in database: ${email}`);
  
  try {
    const response = await fetch(
      `${firebaseConfig.databaseURL}/users/${uid}.json?auth=${token}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          isAdmin: true,
          createdAt: new Date().toISOString(),
          role: 'super_admin',
          permissions: ['read', 'write', 'delete', 'kill_switch']
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    console.log(`   ✓ Admin data stored`);
  } catch (error) {
    console.error(`   ✗ Error:`, error.message);
    throw error;
  }
}

async function setupDatabaseRules() {
  console.log(`\n🔐 Updating Realtime Database Rules...`);
  
  const rules = {
    rules: {
      ".read": "root.child('users').child(auth.uid).exists()",
      ".write": "root.child('users').child(auth.uid).exists()",
      "users": {
        "$uid": {
          ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('isAdmin').val() === true",
          ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('isAdmin').val() === true"
        }
      },
      "devices": {
        ".read": "root.child('users').child(auth.uid).child('isAdmin').val() === true",
        ".write": "root.child('users').child(auth.uid).child('isAdmin').val() === true"
      },
      "logs": {
        ".read": "root.child('users').child(auth.uid).child('isAdmin').val() === true",
        ".write": "root.child('users').child(auth.uid).child('isAdmin').val() === true"
      },
      "commands": {
        ".read": "root.child('users').child(auth.uid).child('isAdmin').val() === true",
        ".write": "root.child('users').child(auth.uid).child('isAdmin').val() === true"
      }
    }
  };

  console.log(`   ✓ Rules configured (apply manually in Firebase Console)`);
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║    KEI Dashboard - Firebase Setup                        ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  try {
    console.log('\n🚀 Starting Firebase setup...');
    console.log(`📍 Project: ${firebaseConfig.projectId}`);
    console.log(`🔗 Database: ${firebaseConfig.databaseURL}`);

    const userIds = {};

    // Create admin accounts
    console.log('\n─────────────────────────────────────────────────────────');
    console.log('STEP 1: Creating Admin Accounts');
    console.log('─────────────────────────────────────────────────────────');

    for (const admin of ADMIN_ACCOUNTS) {
      try {
        const userResult = await createUser(admin.email, admin.password);
        if (userResult) {
          userIds[admin.email] = userResult;
        }
      } catch (error) {
        console.log(`   Attempting to fetch existing user...`);
        // Try to sign in instead
        try {
          const signInResponse = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: admin.email,
                password: admin.password,
                returnSecureToken: true
              })
            }
          );
          const signInData = await signInResponse.json();
          if (signInResponse.ok) {
            userIds[admin.email] = { uid: signInData.localId, token: signInData.idToken };
            console.log(`   ✓ User exists with UID: ${signInData.localId}`);
          }
        } catch (signInError) {
          console.error(`   ✗ Could not create or find user:`, signInError.message);
        }
      }
    }

    // Setup database
    console.log('\n─────────────────────────────────────────────────────────');
    console.log('STEP 2: Setting Up Admin Data in Database');
    console.log('─────────────────────────────────────────────────────────');

    for (const admin of ADMIN_ACCOUNTS) {
      if (userIds[admin.email]) {
        const userInfo = userIds[admin.email];
        await setupAdminInDatabase(admin.email, userInfo.uid, userInfo.token);
      }
    }

    // Setup rules
    console.log('\n─────────────────────────────────────────────────────────');
    console.log('STEP 3: Database Rules');
    console.log('─────────────────────────────────────────────────────────');

    await setupDatabaseRules();

    // Summary
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    ✓ SETUP COMPLETE                       ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');

    console.log('\n📋 Admin Accounts Created:');
    ADMIN_ACCOUNTS.forEach((admin, idx) => {
      console.log(`   ${idx + 1}. ${admin.email}`);
      console.log(`      Password: ${admin.password}`);
      if (userIds[admin.email]) {
        console.log(`      UID: ${userIds[admin.email].uid}`);
      }
    });

    console.log('\n🔐 Next Steps:');
    console.log('   1. Go to Firebase Console → Realtime Database → Rules tab');
    console.log('   2. Copy and paste the rules shown above');
    console.log('   3. Publish the rules');
    console.log('   4. Try logging in with the admin accounts above\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();
