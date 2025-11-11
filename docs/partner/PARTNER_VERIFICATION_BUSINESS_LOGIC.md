# Partner Verification - Business Logic Review

## 📋 NGHIỆP VỤ TỔNG QUAN

### **Flow hoàn chỉnh:**

```
1. Partner Registration (Public)
   ↓
2. Application Pending (verificationStatus='pending')
   ↓
3. Admin Review & Approve/Reject
   ↓
4a. APPROVED → Partner can access /partner/* (verified)
4b. REJECTED → Partner cannot login (status='inactive')
```

---

## 1️⃣ PARTNER REGISTRATION

### **Frontend:** `PartnerRegisterPage.jsx`
- **Route:** `/partner/register` (PUBLIC)
- **Steps:** 5-step wizard
  1. Personal Info (name, email, phone, password)
  2. Business Info (businessName, businessType, taxId, address)
  3. Banking (bankAccount with swiftCode, branchName)
  4. Documents (upload business docs)
  5. Review & Submit

### **Backend:** `POST /api/partner/register-complete`
- **Validation:** `validatePartnerRegistrationComplete`
- **Controller:** `partnerController.registerPartnerComplete`
- **Creates:**
  ```javascript
  {
    role: 'HotelPartner',
    status: 'active', // Can login
    partnerInfo: {
      verificationStatus: 'pending', // Waiting admin approval
      businessName, businessType, taxId,
      businessAddress, bankAccount,
      onboardingCompleted: false,
      onboardingStep: 1
    }
  }
  ```
- **Response:** Returns `{ token, user }` → Auto login
- **Redirect:** → `/partner/application-status`

---

## 2️⃣ APPLICATION STATUS CHECK

### **Frontend:** `ApplicationStatusPage.jsx`
- **Route:** `/partner/application-status` (PUBLIC)
- **Input:** Email address
- **API:** `GET /api/partner/application-status/:email`

### **Backend:** `getApplicationStatus()`
- **No auth required** (public endpoint)
- **Returns:**
  ```javascript
  {
    name, email, phone,
    businessName: partnerInfo.businessName,
    verificationStatus: partnerInfo.verificationStatus,
    onboardingProgress: partnerInfo.onboardingStep,
    createdAt,
    rejectionReason: partnerInfo.rejectionReason || null
  }
  ```

### **Status Display:**
- ⏳ **pending/in_review:** "Your application is under review"
- ✅ **verified:** "Your application has been approved"
- ❌ **rejected:** "Your application was rejected. Reason: ..."

---

## 3️⃣ ADMIN VERIFICATIONS

### **Frontend:** `VerificationsPage.jsx`
- **Route:** `/admin/verifications` (ADMIN ONLY)
- **Features:**
  - Stats dashboard (Pending, Verified, Rejected, Total)
  - Search (name, email, business name)
  - Filters (pending, verified, rejected, all)
  - Partner cards with expand/collapse
  - Review modal

### **Backend APIs:**

#### **GET /api/partner/applications**
- **Auth:** Admin only
- **Query params:** `?status=active&verificationStatus=pending&search=keyword`
- **Returns:** `{ partners[], stats }`

#### **PATCH /api/partner/applications/:id/approve**
- **Auth:** Admin only
- **Body:** `{}` (no body required)
- **Action:**
  ```javascript
  partner.partnerInfo.verificationStatus = 'verified';
  partner.partnerInfo.verifiedAt = new Date();
  partner.partnerInfo.verifiedBy = req.user._id; // Admin
  partner.status = 'active';
  ```
- **Result:** Partner can now access `/partner/*` routes

#### **PATCH /api/partner/applications/:id/reject**
- **Auth:** Admin only
- **Body:** `{ rejectionReason: "..." }` (REQUIRED)
- **Action:**
  ```javascript
  partner.partnerInfo.verificationStatus = 'rejected';
  partner.partnerInfo.rejectionReason = rejectionReason;
  partner.status = 'inactive'; // Cannot login
  ```
- **Result:** Partner locked out

---

## 4️⃣ PARTNER PORTAL ACCESS CONTROL

### **NEW: Verification Check Middleware**

**File:** `checkPartnerVerified.middleware.js`

```javascript
// Applied to ALL /partner/* routes (except public)
router.use(middleware.auth.protect);
router.use(middleware.auth.restrictTo('HotelPartner'));
router.use(middleware.checkPartnerVerified); // ← NEW!
```

### **Logic:**
```javascript
if (verificationStatus === 'verified') {
  ✅ Allow access
}

if (verificationStatus === 'pending' || 'in_review') {
  ❌ 403: "Your application is pending review"
}

if (verificationStatus === 'rejected') {
  ❌ 403: "Your application was rejected. Reason: ..."
}
```

### **Protected Routes:**
- `/partner/dashboard` → Requires `verified`
- `/partner/hotels` → Requires `verified`
- `/partner/earnings` → Requires `verified`
- `/partner/onboarding-status` → Requires `verified`

### **Public/Unprotected Routes:**
- `/partner/register` → Public
- `/partner/application-status` → Public (email-based)

---

## 5️⃣ USER MODEL SCHEMA

```javascript
{
  role: 'HotelPartner',
  status: 'active' | 'suspended' | 'inactive', // lowercase!
  
  partnerInfo: {
    // Business Info
    businessName: String,
    businessType: 'individual' | 'company' | 'chain',
    taxId: String,
    businessAddress: {
      street, city, state, country, zipCode
    },
    
    // Banking
    bankAccount: {
      bankName, accountNumber, accountHolder,
      swiftCode, branchName
    },
    
    // Verification
    verificationStatus: 'pending' | 'in_review' | 'verified' | 'rejected',
    verifiedAt: Date,
    verifiedBy: ObjectId (ref User - Admin),
    rejectionReason: String,
    
    // Onboarding
    onboardingCompleted: Boolean,
    onboardingStep: Number (1-5),
    
    // Documents
    verificationDocuments: [{
      type: 'business_license' | 'tax_certificate' | ...,
      url: String,
      uploadedAt: Date,
      status: 'pending' | 'approved' | 'rejected'
    }]
  }
}
```

---

## 6️⃣ STATUS FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────┐
│ REGISTRATION                                            │
├─────────────────────────────────────────────────────────┤
│ POST /api/partner/register-complete                    │
│ ✅ Create user                                          │
│ ✅ role='HotelPartner', status='active'                 │
│ ✅ verificationStatus='pending'                         │
│ ✅ Auto login + redirect to /partner/application-status│
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ PENDING STATE                                           │
├─────────────────────────────────────────────────────────┤
│ - Can login (status='active')                           │
│ - Can check status at /partner/application-status      │
│ - CANNOT access /partner/* (verification required)     │
│ - Waiting for admin review                             │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ ADMIN REVIEW @ /admin/verifications                     │
├─────────────────────────────────────────────────────────┤
│ Admin clicks "Review Application"                       │
│                                                          │
│ [APPROVE]              │          [REJECT]              │
│ verificationStatus     │          verificationStatus    │
│ = 'verified'           │          = 'rejected'          │
│ status = 'active'      │          status = 'inactive'   │
│ verifiedAt = now       │          rejectionReason = ... │
│ verifiedBy = admin._id │                                │
└─────────────────────────────────────────────────────────┘
           │                                │
           ▼                                ▼
┌──────────────────────┐      ┌──────────────────────────┐
│ VERIFIED             │      │ REJECTED                 │
├──────────────────────┤      ├──────────────────────────┤
│ ✅ Can login          │      │ ❌ Cannot login (inactive)│
│ ✅ Access /partner/*  │      │ ❌ Sees rejection reason │
│ ✅ Create hotels      │      │ ℹ️  Can re-apply later   │
│ ✅ Manage properties  │      │ (manual process)         │
└──────────────────────┘      └──────────────────────────┘
```

---

## 7️⃣ SECURITY CHECKLIST

### ✅ **Implemented:**
1. **Authentication:** JWT tokens with Bearer scheme
2. **Authorization:** Role-based (Admin vs HotelPartner)
3. **Verification Check:** New middleware blocks unverified partners
4. **Status Validation:** Enum constraints (lowercase)
5. **Input Validation:** Joi schemas for registration
6. **Rate Limiting:** Login attempts, API calls
7. **Public Endpoints:** Properly separated (no auth required)

### ⚠️ **Potential Improvements:**
1. **Email Notification:** Send email when approved/rejected
2. **Appeal Process:** Allow rejected partners to resubmit
3. **Document Verification:** Separate approval for each document
4. **Audit Log:** Track who approved/rejected + when
5. **Auto-expire:** Pending applications older than X days

---

## 8️⃣ TESTING

### **Manual Test Scenarios:**

1. **Register new partner**
   - Fill 5-step form
   - Submit → Should auto-login
   - Redirect to `/partner/application-status`
   - See "Pending Review" status

2. **Try to access partner portal (unverified)**
   - Login as pending partner
   - Navigate to `/partner/dashboard`
   - Should get 403: "Pending review"

3. **Admin approve**
   - Login as admin
   - Go to `/admin/verifications`
   - Click "Review Application"
   - Click "Approve"
   - Partner should now access `/partner/dashboard`

4. **Admin reject**
   - Login as admin
   - Review pending partner
   - Enter rejection reason
   - Click "Reject"
   - Partner cannot login (inactive)

---

## 9️⃣ API ENDPOINTS SUMMARY

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/partner/register-complete` | Public | Register new partner |
| GET | `/api/partner/application-status/:email` | Public | Check status by email |
| GET | `/api/partner/applications` | Admin | Get all partner apps |
| PATCH | `/api/partner/applications/:id/approve` | Admin | Approve partner |
| PATCH | `/api/partner/applications/:id/reject` | Admin | Reject partner |
| GET | `/api/partner/dashboard` | Verified Partner | Partner dashboard |
| GET | `/api/partner/hotels` | Verified Partner | Partner's hotels |

---

## 🎯 KEY TAKEAWAYS

1. **Verification Status** controls access, NOT just `role`
2. **Status Field** (active/inactive) controls login ability
3. **New Middleware** (`checkPartnerVerified`) enforces verification
4. **Admin Routes** properly protected before partner routes
5. **Public Routes** (register, application-status) accessible to all

---

**Author:** CheckInn Team  
**Version:** 2.0.0  
**Last Updated:** November 7, 2025
