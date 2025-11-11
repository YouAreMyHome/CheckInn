/**
 * Quick Fix Script: Update in_review to pending
 * 
 * Directly updates all 'in_review' statuses to 'pending' using updateMany
 * 
 * Usage: node script/quick-fix-in-review.js
 */

require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');

async function quickFix() {
  try {
    console.log('🔄 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB\n');

    // Count before update
    const countBefore = await mongoose.connection.db
      .collection('users')
      .countDocuments({ 'partnerInfo.verificationStatus': 'in_review' });

    console.log(`📊 Found ${countBefore} partners with 'in_review' status\n`);

    if (countBefore === 0) {
      console.log('✓ No partners to update');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Show partners before update
    console.log('Partners to update:');
    const partnersToUpdate = await mongoose.connection.db
      .collection('users')
      .find({ 'partnerInfo.verificationStatus': 'in_review' })
      .project({ name: 1, email: 1, 'partnerInfo.businessName': 1, 'partnerInfo.verificationStatus': 1 })
      .toArray();

    partnersToUpdate.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} (${p.email}) - ${p.partnerInfo?.businessName}`);
    });
    console.log();

    // Update all at once
    console.log('🔄 Updating all partners...');
    const result = await mongoose.connection.db
      .collection('users')
      .updateMany(
        { 'partnerInfo.verificationStatus': 'in_review' },
        { $set: { 'partnerInfo.verificationStatus': 'pending' } }
      );

    console.log(`✓ Updated ${result.modifiedCount} partners\n`);

    // Count after update
    const countAfter = await mongoose.connection.db
      .collection('users')
      .countDocuments({ 'partnerInfo.verificationStatus': 'in_review' });

    console.log('============================================================');
    console.log('📊 Update Summary');
    console.log('============================================================');
    console.log(`Before: ${countBefore} partners with 'in_review'`);
    console.log(`After:  ${countAfter} partners with 'in_review'`);
    console.log(`Updated: ${result.modifiedCount} partners`);
    console.log('============================================================\n');

    // Verify the specific partner mentioned by user
    const specificPartner = await mongoose.connection.db
      .collection('users')
      .findOne(
        { _id: new mongoose.Types.ObjectId('690ccc077302014885f00e2f') },
        { projection: { name: 1, email: 1, 'partnerInfo.verificationStatus': 1 } }
      );

    if (specificPartner) {
      console.log('✓ Verified specific partner (Phan Thị Mỹ Linh):');
      console.log(`  Name: ${specificPartner.name}`);
      console.log(`  Email: ${specificPartner.email}`);
      console.log(`  Status: ${specificPartner.partnerInfo?.verificationStatus}`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('✗ Quick fix failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run quick fix
quickFix();
