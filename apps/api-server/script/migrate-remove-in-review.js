/**
 * Migration Script: Remove 'in_review' Status
 * 
 * Converts all 'in_review' verification statuses to 'pending'
 * to match the simplified workflow (pending → verified/rejected)
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const User = require('../src/models/User.model');

async function migrate() {
  try {
    console.log('🔄 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB\n');

    // Find all users with in_review status
    const usersToUpdate = await User.find({
      'partnerInfo.verificationStatus': 'in_review'
    });

    console.log(`📊 Found ${usersToUpdate.length} users with 'in_review' status\n`);

    if (usersToUpdate.length === 0) {
      console.log('✓ No users to migrate');
      process.exit(0);
    }

    // Update each user
    let successCount = 0;
    let failCount = 0;

    for (const user of usersToUpdate) {
      try {
        console.log(`ℹ Updating ${user.name} (${user.email})...`);
        console.log(`  Current status: ${user.partnerInfo.verificationStatus}`);
        
        user.partnerInfo.verificationStatus = 'pending';
        await user.save();
        
        console.log(`  ✓ Updated to: pending\n`);
        successCount++;
      } catch (error) {
        console.error(`  ✗ Failed: ${error.message}\n`);
        failCount++;
      }
    }

    console.log('============================================================');
    console.log('📊 Migration Summary');
    console.log('============================================================');
    console.log(`✓ Successfully updated: ${successCount}`);
    console.log(`✗ Failed: ${failCount}`);
    console.log('============================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrate();
