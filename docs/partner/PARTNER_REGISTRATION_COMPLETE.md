# Partner Registration Flow - Complete Implementation

## 📋 Overview
Multi-step wizard cho hotel partner registration với 5 bước hoàn chỉnh.

**Created:** 2024  
**Status:** ✅ Complete  
**Location:** `apps/frontend/src/portals/hotel-manager/pages/PartnerRegisterPage.jsx`

---

## 🎯 Features Implemented

### 1. **Multi-Step Wizard (5 Steps)**
```
Step 1: Basic Info → Step 2: Business Info → Step 3: Bank Account → Step 4: Documents → Step 5: Complete
```

### 2. **Component Structure**
```
PartnerRegisterPage.jsx (Main)
├── Step1BasicInfo.jsx (Personal + Business Name)
├── Step2BusinessInfo.jsx (Tax ID + Business Address)
├── Step3BankAccount.jsx (Bank Details for Payouts)
├── Step4Documents.jsx (Upload Verification Docs)
└── Step5Complete.jsx (Success + Next Steps)
```

### 3. **Form Validation**
- ✅ Real-time validation per step
- ✅ Email format validation (regex)
- ✅ Phone number validation
- ✅ Password strength (min 8 chars)
- ✅ Confirm password match
- ✅ Required field checks
- ✅ Error display per field

### 4. **State Management**
- Uses TanStack Query hooks from `usePartner.js`
- Mutations: `usePartnerRegister`, `useUpdateBusinessInfo`, `useUpdateBankAccount`, `useUploadDocuments`, `useCompleteOnboarding`
- Local state: `formData`, `currentStep`, `errors`, `message`
- Loading states with `isPending` checks

### 5. **User Experience**
- ✅ Animated transitions (Framer Motion)
- ✅ Progress indicator with icons
- ✅ Step completion visual feedback (green checkmarks)
- ✅ Success/Error message display
- ✅ Back/Next navigation
- ✅ Loading spinners during API calls
- ✅ Disabled buttons when processing

---

## 🗂️ File Breakdown

### **PartnerRegisterPage.jsx** (Main Container)
**Lines:** ~400  
**Responsibilities:**
- Form data state management
- Step navigation logic
- API mutation calls
- Validation orchestration
- Progress indicator rendering

**Key Sections:**
```javascript
// State
const [currentStep, setCurrentStep] = useState(1);
const [formData, setFormData] = useState({...});
const [errors, setErrors] = useState({});

// Mutations
const registerMutation = usePartnerRegister();
const updateBusinessMutation = useUpdateBusinessInfo();
// ... etc

// Validation per step
const validateStep1 = () => { /* ... */ };
const validateStep2 = () => { /* ... */ };
// ... etc

// Step submission
const handleNext = async () => {
  if (currentStep === 1) {
    await registerMutation.mutateAsync({...});
  }
  // ... etc
};
```

---

### **Step1BasicInfo.jsx**
**Purpose:** Collect personal info + password + business name  
**Fields:**
- Full Name (required)
- Email (required, validated)
- Phone (required, validated)
- Password (required, min 8 chars, show/hide toggle)
- Confirm Password (required, must match)
- Business Name (required)
- Business Type (select: individual/company/partnership)

**Features:**
- Icons for each input field (Lucide React)
- Show/hide password toggles
- Real-time error display
- Animated entry (Framer Motion)

---

### **Step2BusinessInfo.jsx**
**Purpose:** Business address + tax information  
**Fields:**
- Tax ID (optional)
- Business Address:
  - Street (required)
  - City (required)
  - State (required)
  - Country (select, default: Vietnam)
  - Zip Code (optional)

**Features:**
- Nested object handling (`businessAddress.*`)
- Grid layout for city/state and country/zip
- MapPin icon header
- Gray background section for address

---

### **Step3BankAccount.jsx**
**Purpose:** Bank account for payouts  
**Fields (Required):**
- Bank Name
- Account Number
- Account Holder Name

**Fields (Optional - For International):**
- SWIFT/BIC Code
- Branch Name

**Features:**
- Blue info box for optional international fields
- Yellow warning box about verification time
- Icons for each field type
- Clear hierarchy (required vs optional)

---

### **Step4Documents.jsx**
**Purpose:** Upload verification documents  
**Document Types:**
1. **Business License** (required)
2. **ID Card/Passport** (required)
3. **Bank Statement** (optional)
4. **Tax Certificate** (optional)

**Features:**
- Drag-and-drop upload areas
- File type validation (PDF, PNG, JPG, JPEG)
- Max size: 10MB
- Upload success indicators (green badges)
- Remove document button
- Document count summary
- Guidelines info box

**Technical Notes:**
- Currently uses FileReader for data URLs
- **TODO:** Integrate cloud storage (S3/Cloudinary) in production
- File upload handled via `handleFileUpload(e, documentType)`

---

### **Step5Complete.jsx**
**Purpose:** Success confirmation + next steps  
**Features:**
- Animated success icon (scale spring animation)
- Grid of completed items with icons
- "What happens next?" timeline (3 steps)
- Go to Dashboard button
- Contact support link

**Next Steps Display:**
1. Document Verification (2-3 days)
2. Account Approval (email notification)
3. Start Managing (add hotels)

---

## 🔄 Data Flow

### **Registration Workflow:**
```
1. User fills Step 1 → Validate → POST /api/partner/register
   ↓ Store JWT token
2. User fills Step 2 → Validate → PATCH /api/partner/onboarding/business-info
   ↓
3. User fills Step 3 → Validate → PATCH /api/partner/onboarding/bank-account
   ↓
4. User uploads docs → POST /api/partner/onboarding/documents
   ↓
5. Complete onboarding → POST /api/partner/onboarding/complete
   ↓ Redirect to /partner
```

### **Validation Rules:**

#### **Step 1:**
- Name: min 2 chars
- Email: valid format (regex)
- Phone: min 10 chars, allows digits/spaces/dashes/parentheses
- Password: min 8 chars
- Confirm Password: match with password
- Business Name: min 2 chars

#### **Step 2:**
- Street: required
- City: required
- State: required
- Country: default "Vietnam"

#### **Step 3:**
- Bank Name: required
- Account Number: min 5 chars
- Account Holder: required

#### **Step 4:**
- At least 1 document uploaded (preferably required ones)

---

## 🎨 UI/UX Design

### **Progress Steps Bar:**
- Horizontal stepper with 5 steps
- Color-coded:
  - **Completed:** Green bg + border, white icon
  - **Active:** Blue bg + border, white icon
  - **Upcoming:** White bg + gray border, gray icon
- Connecting lines turn green when step completed

### **Form Layout:**
- Max width: 2xl (672px)
- White card with rounded-2xl shadow
- Padding: 8 (32px)
- Gradient background: blue-50 → white → green-50

### **Buttons:**
- **Back:** Gray bg, left arrow icon, disabled on step 1
- **Next:** Blue bg, right arrow icon, loading spinner when processing
- **Complete:** Blue bg, right arrow icon, routes to /partner

### **Messages:**
- Success: Green bg/text/border
- Error: Red bg/text/border
- Displayed above form content
- Auto-clears on step change

### **Icons Used (Lucide React):**
- User, Mail, Phone, Lock, Building2, MapPin, CreditCard, Hash
- Upload, FileText, X, CheckCircle
- ArrowRight, ArrowLeft, Loader2
- Eye, EyeOff (password toggles)

---

## 🔧 Technical Implementation

### **Dependencies:**
```json
{
  "framer-motion": "^x.x.x",
  "lucide-react": "^x.x.x",
  "react-router-dom": "^6.x.x",
  "@tanstack/react-query": "^5.x.x"
}
```

### **Import Aliases Used:**
```javascript
import { usePartner* } from '@hooks/usePartner';
import Step1 from '@partner/components/registration/Step1BasicInfo';
// etc.
```

### **State Management Pattern:**
```javascript
// Centralized form data
const [formData, setFormData] = useState({
  name: '',
  email: '',
  // ... flat structure for simple fields
  businessAddress: { // nested for address
    street: '',
    city: '',
    // ...
  },
  documents: [] // array for uploads
});

// Handle nested updates
const handleChange = (e) => {
  if (name.includes('.')) {
    const [parent, child] = name.split('.');
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [child]: value }
    }));
  }
  // ...
};
```

### **Async Mutation Pattern:**
```javascript
const handleNext = async () => {
  if (currentStep === 1) {
    if (!validateStep1()) return;
    try {
      const result = await registerMutation.mutateAsync({...});
      if (result.success) {
        setMessage({ type: 'success', text: 'Account created!' });
        setTimeout(() => setCurrentStep(2), 1000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  }
  // ... repeat for other steps
};
```

---

## 📊 Backend Integration

### **API Endpoints Used:**
1. `POST /api/partner/register` - Create account (Step 1)
2. `PATCH /api/partner/onboarding/business-info` - Update business (Step 2)
3. `PATCH /api/partner/onboarding/bank-account` - Add bank (Step 3)
4. `POST /api/partner/onboarding/documents` - Upload docs (Step 4)
5. `POST /api/partner/onboarding/complete` - Finalize (Step 5)

### **Authentication:**
- JWT token stored in localStorage after Step 1
- `api.js` Axios instance auto-adds `Bearer` token to headers
- All subsequent requests authenticated

### **Response Format:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* ... */ }
}
```

---

## ✅ Completed Checklist

- [x] Main PartnerRegisterPage with step navigation
- [x] Step1BasicInfo component (personal + business name)
- [x] Step2BusinessInfo component (address + tax ID)
- [x] Step3BankAccount component (bank details)
- [x] Step4Documents component (file uploads)
- [x] Step5Complete component (success screen)
- [x] Form validation (all steps)
- [x] Error handling and display
- [x] Loading states
- [x] API integration with mutations
- [x] Animations and transitions
- [x] Progress indicator
- [x] Responsive design (Tailwind)
- [x] Import aliases
- [x] ESLint clean (no errors)

---

## 🚀 Next Steps

### **Immediate:**
1. ✅ **Dashboard Update** - Add revenue cards, KPIs, recent activities
2. ✅ **Revenue Dashboard** - Charts, analytics, export features

### **Future Enhancements:**
- [ ] Add field-level async validation (email uniqueness)
- [ ] Implement cloud storage for documents (S3/Cloudinary)
- [ ] Add progress save/resume (localStorage)
- [ ] Multi-language support (i18n)
- [ ] Mobile responsive optimization
- [ ] Add tooltips for complex fields
- [ ] Integrate real-time bank name suggestions API
- [ ] Add document preview modal
- [ ] Email verification step
- [ ] SMS OTP verification

---

## 🐛 Known Issues / TODOs

1. **File Upload:** Currently uses data URLs (FileReader). Need to integrate cloud storage.
2. **Tax ID Validation:** No format validation yet (needs country-specific regex).
3. **Phone Validation:** Generic regex - should use libphonenumber-js for proper validation.
4. **Document Size Check:** Max 10MB mentioned but not enforced in code.

---

## 📝 Usage Example

```jsx
import PartnerRegisterPage from '@partner/pages/PartnerRegisterPage';

// In Router
<Route path="/partner/register" element={<PartnerRegisterPage />} />
```

**Flow:**
1. User visits `/partner/register`
2. Fills 5-step wizard
3. Each step validates + calls API
4. On completion, redirects to `/partner` (dashboard)

---

## 🎓 Code Quality

- **DRY:** Step components reusable, validation extracted
- **KISS:** Clear separation of concerns per step
- **YAGNI:** Only features needed for MVP
- **Performance:** Memoized none (no performance issues with current size)
- **Accessibility:** ⚠️ TODO - Add aria labels, keyboard navigation
- **Testing:** ⚠️ TODO - Add unit tests for validation, integration tests for flow

---

**Author:** CheckInn Dev Team  
**Last Updated:** 2024  
**Version:** 1.0.0
