/**
 * Quick Fix: Update all in_review statuses to pending
 * 
 * Run this in MongoDB Compass or mongosh:
 * 1. Connect to your database
 * 2. Select the database (e.g., 'checkinn')
 * 3. Run these commands in the MongoDB shell
 */

// Check how many partners have in_review status
db.users.countDocuments({
  'partnerInfo.verificationStatus': 'in_review'
});

// See the partners with in_review status
db.users.find(
  { 'partnerInfo.verificationStatus': 'in_review' },
  { name: 1, email: 1, 'partnerInfo.businessName': 1, 'partnerInfo.verificationStatus': 1 }
).pretty();

// Update ALL partners with in_review to pending
db.users.updateMany(
  { 'partnerInfo.verificationStatus': 'in_review' },
  { $set: { 'partnerInfo.verificationStatus': 'pending' } }
);

// Verify the update
db.users.countDocuments({
  'partnerInfo.verificationStatus': 'in_review'
});
// Should return 0

// Verify the specific partner is now pending
db.users.findOne(
  { '_id': ObjectId('690ccc077302014885f00e2f') },
  { name: 1, email: 1, 'partnerInfo.verificationStatus': 1 }
);
// Should show verificationStatus: 'pending'
