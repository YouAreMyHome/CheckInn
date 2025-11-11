# 📋 Action Plan - Critical Bugs Fix

**Project:** CheckInn - Partner Verification System  
**Date Created:** November 7, 2025  
**Status:** 🔴 IN PROGRESS  
**Sprint:** Week of Nov 7-14, 2025

---

## 🎯 Objectives

Fix **5 critical bugs** trong partner verification workflow để:
- ✅ Đảm bảo data integrity
- ✅ Tuân thủ audit compliance requirements
- ✅ Cải thiện user experience
- ✅ Tăng cường validation và security

---

## 📊 Bug Summary

| ID | Bug | Severity | Status | Priority |
|----|-----|----------|--------|----------|
| #1 | Missing Status Validation | 🔴 Critical | ⏳ Pending | P0 |
| #2 | No Suspended Check | 🔴 High | ⏳ Pending | P0 |
| #3 | Missing Audit Fields | 🟠 High | ⏳ Pending | P1 |
| #4 | No Email Notifications | 🟠 Medium | ⏳ Pending | P2 |
| #5 | Weak Validation | 🟡 Medium | ⏳ Pending | P1 |

**Detailed Report:** [CRITICAL_BUGS_REPORT.md](./CRITICAL_BUGS_REPORT.md)

---

## 🗓️ Timeline

```
┌─────────────────────────────────────────────────────────┐
│ PHASE 1: Immediate Fixes (P0) - Nov 7, 2025            │
│ Duration: 2-3 hours                                      │
└─────────────────────────────────────────────────────────┘
  ├─ Bug #1: Add status validation (1h)
  ├─ Bug #2: Add suspended check (30m)
  └─ Testing & verification (1h)

┌─────────────────────────────────────────────────────────┐
│ PHASE 2: Next Sprint (P1) - Nov 8-10, 2025             │
│ Duration: 4-5 hours                                      │
└─────────────────────────────────────────────────────────┘
  ├─ Bug #3: Add audit fields (2h)
  ├─ Bug #5: Strengthen validation (1h)
  ├─ Migration script (1h)
  └─ Update documentation (1h)

┌─────────────────────────────────────────────────────────┐
│ PHASE 3: Soon (P2) - Nov 11-21, 2025                   │
│ Duration: 6-8 hours                                      │
└─────────────────────────────────────────────────────────┘
  ├─ Bug #4: Email service setup (3h)
  ├─ Email templates (2h)
  ├─ Integration & testing (3h)
  └─ Documentation update (1h)
```

---

## 📝 PHASE 1: Immediate Fixes (TODAY)

### ✅ Task 1.1: Fix Bug #1 - Add Status Validation

**File:** `apps/api-server/src/controllers/partner.controller.js`  
**Function:** `approvePartnerApplication` (line 569)

**Changes:**
```javascript
// Add before updating status
const currentStatus = partner.partnerInfo.verificationStatus;

if (currentStatus === 'verified') {
  return next(new AppError('Partner application is already verified', 400));
}

if (currentStatus === 'rejected') {
  return next(new AppError('Cannot approve rejected application. Partner must resubmit.', 400));
}

if (currentStatus !== 'pending') {
  return next(new AppError('Only pending applications can be approved', 400));
}
```

**Expected Result:**
- ❌ Cannot approve partner already verified
- ❌ Cannot approve partner already rejected
- ✅ Can only approve pending partners

**Test Cases:**
```bash
# Test 1: Approve pending partner → Success
POST /api/partner/applications/:id/approve
Status: pending → verified ✅

# Test 2: Approve verified partner → Error
POST /api/partner/applications/:id/approve
Status: verified → Error 400 ❌

# Test 3: Approve rejected partner → Error
POST /api/partner/applications/:id/approve
Status: rejected → Error 400 ❌
```

**Estimate:** 1 hour

---

### ✅ Task 1.2: Fix Bug #2 - Add Suspended Check

**File:** `apps/api-server/src/controllers/partner.controller.js`  
**Function:** `approvePartnerApplication` (line 569)

**Changes:**
```javascript
// Add after finding partner
if (partner.status === 'Suspended') {
  return next(new AppError('Cannot approve suspended partner. Please unsuspend account first.', 400));
}
```

**Expected Result:**
- ❌ Cannot approve suspended partners
- ✅ Must unsuspend first, then approve

**Test Cases:**
```bash
# Test 1: Approve partner with status='Suspended' → Error
POST /api/partner/applications/:id/approve
partner.status: 'Suspended' → Error 400 ❌

# Test 2: Approve partner with status='Active' → Success
POST /api/partner/applications/:id/approve
partner.status: 'Active' → Success ✅
```

**Estimate:** 30 minutes

---

### ✅ Task 1.3: Update Reject Function (Similar Validation)

**File:** `apps/api-server/src/controllers/partner.controller.js`  
**Function:** `rejectPartnerApplication` (line 600)

**Changes:**
```javascript
// Add validation for reject as well
const currentStatus = partner.partnerInfo.verificationStatus;

if (currentStatus === 'verified') {
  return next(new AppError('Cannot reject already verified partner', 400));
}

if (currentStatus === 'rejected') {
  return next(new AppError('Partner application is already rejected', 400));
}

if (currentStatus !== 'pending') {
  return next(new AppError('Only pending applications can be rejected', 400));
}
```

**Estimate:** 30 minutes

---

### ✅ Task 1.4: Testing Phase 1

**Checklist:**
- [ ] Unit tests for approve validation
- [ ] Unit tests for reject validation
- [ ] Manual test with real data
- [ ] Check error messages are clear
- [ ] Verify no breaking changes

**Test Script:**
```bash
cd apps/api-server
npm test -- partner.controller.test.js
```

**Estimate:** 1 hour

---

## 📝 PHASE 2: Next Sprint (THIS WEEK)

### ✅ Task 2.1: Fix Bug #3 - Add Audit Fields

**Step 1: Update Model**

**File:** `apps/api-server/src/models/User.model.js`  
**Location:** After `verifiedBy` field (line ~152)

```javascript
verifiedAt: Date,
verifiedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
},

// ADD THESE:
rejectedAt: Date,
rejectedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
},
rejectionReason: {
  type: String,
  maxlength: 500
}
```

**Step 2: Update Controller**

**File:** `apps/api-server/src/controllers/partner.controller.js`  
**Function:** `rejectPartnerApplication` (line 600)

```javascript
partner.partnerInfo.verificationStatus = 'rejected';
partner.partnerInfo.rejectionReason = trimmedReason;

// ADD THESE:
partner.partnerInfo.rejectedAt = new Date();
partner.partnerInfo.rejectedBy = req.user._id;

partner.status = 'Inactive';
```

**Estimate:** 2 hours

---

### ✅ Task 2.2: Fix Bug #5 - Strengthen Validation

**File:** `apps/api-server/src/controllers/partner.controller.js`  
**Function:** `rejectPartnerApplication` (line 600)

**Changes:**
```javascript
const { rejectionReason } = req.body;

// Replace simple check with strong validation
const trimmedReason = rejectionReason?.trim();

if (!trimmedReason) {
  return next(new AppError('Rejection reason is required and cannot be empty', 400));
}

if (trimmedReason.length < 10) {
  return next(new AppError('Rejection reason must be at least 10 characters', 400));
}

if (trimmedReason.length > 500) {
  return next(new AppError('Rejection reason must not exceed 500 characters', 400));
}

partner.partnerInfo.rejectionReason = trimmedReason;
```

**Test Cases:**
```javascript
rejectionReason: ""              → Error 400 ❌
rejectionReason: "x"             → Error 400 ❌
rejectionReason: "    "          → Error 400 ❌
rejectionReason: "a".repeat(600) → Error 400 ❌
rejectionReason: "Invalid docs"  → Success ✅
```

**Estimate:** 1 hour

---

### ✅ Task 2.3: Create Migration Script

**File:** `apps/api-server/scripts/migrate-add-rejection-audit.js`

**Purpose:** Add rejectedAt field to existing rejected partners

```javascript
/**
 * Migration: Add rejectedAt/rejectedBy to existing rejected partners
 */

require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const User = require('../src/models/User.model');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB\n');

    // Find rejected partners without audit fields
    const rejectedPartners = await User.find({
      role: 'HotelPartner',
      'partnerInfo.verificationStatus': 'rejected',
      'partnerInfo.rejectedAt': { $exists: false }
    });

    console.log(`📊 Found ${rejectedPartners.length} rejected partners without audit fields\n`);

    if (rejectedPartners.length === 0) {
      console.log('✓ No partners to migrate');
      process.exit(0);
    }

    let successCount = 0;

    for (const partner of rejectedPartners) {
      try {
        // Use updatedAt as best guess for rejectedAt
        partner.partnerInfo.rejectedAt = partner.updatedAt;
        // rejectedBy is unknown - leave null
        await partner.save();
        
        console.log(`✓ Updated ${partner.name} (${partner.email})`);
        successCount++;
      } catch (error) {
        console.error(`✗ Failed to update ${partner.email}:`, error.message);
      }
    }

    console.log(`\n✓ Migration complete: ${successCount}/${rejectedPartners.length} updated`);
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
```

**Estimate:** 1 hour

---

### ✅ Task 2.4: Update API Documentation

**File:** `docs/api/API_DOCUMENTATION.md`

**Updates needed:**
1. Document new error responses (400 for invalid status)
2. Document rejectedAt/rejectedBy fields in response
3. Document validation rules for rejectionReason
4. Add examples for error cases

**Estimate:** 1 hour

---

## 📝 PHASE 3: Soon (NEXT 2 WEEKS)

### ✅ Task 3.1: Implement Email Service

**File:** `apps/api-server/src/services/email.service.js` (NEW)

**Features:**
- Setup Nodemailer with SMTP
- Create sendEmail function
- Template rendering
- Error handling & logging

**Estimate:** 3 hours

---

### ✅ Task 3.2: Create Email Templates

**Files to create:**
1. `apps/api-server/src/templates/emails/partner-approved.html`
2. `apps/api-server/src/templates/emails/partner-rejected.html`

**Content:**
- Approved: Welcome message + next steps
- Rejected: Polite explanation + resubmit link

**Estimate:** 2 hours

---

### ✅ Task 3.3: Integration & Testing

**Tasks:**
- Integrate email service into approve/reject controllers
- Test email delivery
- Test with different email providers
- Check spam score
- Mobile responsiveness

**Estimate:** 3 hours

---

## 🧪 Testing Strategy

### Unit Tests
```javascript
// File: apps/api-server/tests/controllers/partner.controller.test.js

describe('Partner Application Approval', () => {
  it('should approve pending application', async () => {
    // Test approve pending → verified
  });

  it('should reject already verified application', async () => {
    // Test approve verified → Error 400
  });

  it('should reject suspended partner', async () => {
    // Test approve suspended → Error 400
  });
});

describe('Partner Application Rejection', () => {
  it('should reject pending application', async () => {
    // Test reject pending → rejected
  });

  it('should validate rejection reason length', async () => {
    // Test min/max length validation
  });

  it('should trim whitespace from reason', async () => {
    // Test trimming
  });
});
```

### Integration Tests
```javascript
describe('Partner Verification Workflow', () => {
  it('should complete full approve flow', async () => {
    // 1. Create partner
    // 2. Approve
    // 3. Verify status & audit fields
  });

  it('should complete full reject flow', async () => {
    // 1. Create partner
    // 2. Reject with reason
    // 3. Verify status & audit fields
  });
});
```

### Manual Testing Checklist

**Phase 1:**
- [ ] Approve pending partner → Success
- [ ] Approve verified partner → Error 400
- [ ] Approve rejected partner → Error 400
- [ ] Approve suspended partner → Error 400
- [ ] Reject pending partner → Success
- [ ] Reject verified partner → Error 400
- [ ] Reject rejected partner → Error 400

**Phase 2:**
- [ ] Reject partner → Check rejectedAt is set
- [ ] Reject partner → Check rejectedBy is set
- [ ] Reject with short reason → Error 400
- [ ] Reject with long reason → Error 400
- [ ] Reject with whitespace only → Error 400
- [ ] Reject with valid reason → Success

**Phase 3:**
- [ ] Approve partner → Email sent
- [ ] Reject partner → Email sent
- [ ] Email contains correct info
- [ ] Email renders on mobile
- [ ] Email not in spam

---

## 📋 Checklist - Phase 1 (Today)

### Pre-Development
- [ ] Read bug report thoroughly
- [ ] Review existing code
- [ ] Setup test environment
- [ ] Create feature branch: `fix/partner-verification-bugs`

### Development
- [ ] Fix Bug #1: Add status validation to approve
- [ ] Fix Bug #1: Add status validation to reject
- [ ] Fix Bug #2: Add suspended check
- [ ] Write unit tests
- [ ] Run tests locally
- [ ] Manual testing

### Code Review
- [ ] Self-review code changes
- [ ] Check error messages are clear
- [ ] Verify no breaking changes
- [ ] Update code comments

### Deployment
- [ ] Create pull request
- [ ] Get code review approval
- [ ] Merge to main
- [ ] Deploy to staging
- [ ] Verify on staging
- [ ] Deploy to production

---

## 📋 Checklist - Phase 2 (This Week)

### Model Updates
- [ ] Add rejectedAt field to User model
- [ ] Add rejectedBy field to User model
- [ ] Update rejectionReason validation

### Controller Updates
- [ ] Update reject controller with audit fields
- [ ] Add strong validation for rejection reason
- [ ] Test validation edge cases

### Migration
- [ ] Create migration script
- [ ] Test migration on sample data
- [ ] Run migration on staging
- [ ] Verify data integrity
- [ ] Run migration on production

### Documentation
- [ ] Update API documentation
- [ ] Document new error responses
- [ ] Add examples for new fields
- [ ] Update changelog

---

## 📋 Checklist - Phase 3 (Next 2 Weeks)

### Email Service
- [ ] Setup Nodemailer
- [ ] Configure SMTP settings
- [ ] Create email service module
- [ ] Add error handling
- [ ] Add logging

### Email Templates
- [ ] Design approved email template
- [ ] Design rejected email template
- [ ] Test responsive design
- [ ] Test with different email clients
- [ ] Check spam score

### Integration
- [ ] Add email to approve controller
- [ ] Add email to reject controller
- [ ] Test email delivery
- [ ] Add fallback for email failures
- [ ] Monitor email queue

---

## 🚀 Deployment Plan

### Phase 1 Deployment
```bash
# 1. Create feature branch
git checkout -b fix/partner-verification-bugs-phase1

# 2. Make changes
# ... edit files ...

# 3. Test
npm test

# 4. Commit
git add .
git commit -m "fix: add status validation for partner approve/reject (Bug #1, #2)"

# 5. Push & create PR
git push origin fix/partner-verification-bugs-phase1

# 6. After approval, merge to main
git checkout main
git merge fix/partner-verification-bugs-phase1

# 7. Deploy
npm run deploy:staging
# ... verify on staging ...
npm run deploy:production
```

### Rollback Plan
```bash
# If issues found, rollback to previous commit
git revert HEAD
git push origin main
npm run deploy:production
```

---

## 📊 Success Metrics

### Phase 1
- ✅ 0 partners can be approved/rejected twice
- ✅ 0 suspended partners can be approved
- ✅ All tests passing
- ✅ No production errors

### Phase 2
- ✅ 100% rejected partners have rejectedAt
- ✅ 100% rejection reasons are valid (10-500 chars)
- ✅ Migration runs successfully
- ✅ API docs updated

### Phase 3
- ✅ 100% approve/reject actions send email
- ✅ Email delivery rate > 99%
- ✅ Email spam score < 5
- ✅ Mobile email render correctly

---

## 🔗 Related Resources

- [Critical Bugs Report](./CRITICAL_BUGS_REPORT.md)
- [Partner Workflow Simplification](./PARTNER_WORKFLOW_SIMPLIFICATION.md)
- [API Documentation](../api/API_DOCUMENTATION.md)

---

## 📞 Contact & Support

**Developer:** Backend Team  
**Reviewer:** Tech Lead  
**QA:** QA Team  
**Emergency Contact:** development@checkinn.com

---

**Last Updated:** November 7, 2025  
**Next Review:** After Phase 1 completion  
**Status:** 🔴 Ready to start
