/**
 * Partner Registration Page - Single Submit Flow
 * 
 * 5-step wizard collecting all data, then ONE API call
 * 
 * @author CheckInn Team
 * @version 2.0.0
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Building2, CreditCard, FileText, CheckCircle, 
  ArrowRight, ArrowLeft, Loader2, Shield, Sparkles,
  Mail, Phone, Lock, MapPin, Landmark, Upload, Eye, EyeOff,
  AlertCircle, Check, X
} from 'lucide-react';
import { usePartnerRegisterComplete } from '@hooks/usePartner';
import { useAuth } from '@hooks/useAuth';

const PartnerRegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const registerMutation = usePartnerRegisterComplete();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // Combined state for all steps
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    businessType: 'individual',
    taxId: '',
    businessAddress: {
      street: '',
      city: '',
      state: '',
      country: 'Vietnam',
      zipCode: ''
    },
    bankAccount: {
      bankName: '',
      accountNumber: '',
      accountHolder: '',
      swiftCode: '',
      branchName: ''
    },
    documents: []
  });

  // Steps configuration
  const steps = [
    { number: 1, title: 'Basic Info', icon: User, color: 'from-blue-500 to-blue-600' },
    { number: 2, title: 'Business', icon: Building2, color: 'from-purple-500 to-purple-600' },
    { number: 3, title: 'Banking', icon: CreditCard, color: 'from-green-500 to-green-600' },
    { number: 4, title: 'Documents', icon: FileText, color: 'from-orange-500 to-orange-600' },
    { number: 5, title: 'Review', icon: CheckCircle, color: 'from-pink-500 to-pink-600' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        let current = newData;
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return newData;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Validation
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!formData.email.trim() || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) newErrors.email = 'Valid email required';
    if (!formData.phone.trim() || !/^[\d\s\-()+ ]{10,}$/.test(formData.phone)) newErrors.phone = 'Valid phone required';
    if (!formData.password || formData.password.length < 8) newErrors.password = 'Password must be 8+ characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.businessName.trim()) newErrors.businessName = 'Business name required';
    if (!formData.businessAddress.street.trim()) newErrors['businessAddress.street'] = 'Street required';
    if (!formData.businessAddress.city.trim()) newErrors['businessAddress.city'] = 'City required';
    if (!formData.businessAddress.state.trim()) newErrors['businessAddress.state'] = 'State required';
    if (!formData.businessAddress.zipCode.trim()) newErrors['businessAddress.zipCode'] = 'Zip code required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.bankAccount.bankName.trim()) newErrors['bankAccount.bankName'] = 'Bank name required';
    if (!formData.bankAccount.accountNumber.trim()) newErrors['bankAccount.accountNumber'] = 'Account number required';
    if (!formData.bankAccount.accountHolder.trim()) newErrors['bankAccount.accountHolder'] = 'Account holder required';
    if (!formData.bankAccount.swiftCode.trim()) newErrors['bankAccount.swiftCode'] = 'SWIFT code required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    if (formData.documents.length === 0) {
      setErrors({ documents: 'Upload at least one document' });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    let isValid = false;
    if (currentStep === 1) isValid = validateStep1();
    else if (currentStep === 2) isValid = validateStep2();
    else if (currentStep === 3) isValid = validateStep3();
    else if (currentStep === 4) isValid = validateStep4();
    else return;
    
    if (isValid && currentStep < 5) {
      setCurrentStep(currentStep + 1);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleFileUpload = (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, documents: 'File must be < 5MB' }));
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, { type: docType, url: reader.result, name: file.name, size: file.size }]
      }));
      setErrors(prev => ({ ...prev, documents: '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      const data = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        businessName: formData.businessName,
        businessType: formData.businessType,
        taxId: formData.taxId || undefined,
        businessAddress: formData.businessAddress,
        bankAccount: formData.bankAccount,
        documents: formData.documents.map(d => ({ type: d.type, url: d.url }))
      };
      
      const result = await registerMutation.mutateAsync(data);
      
      if (result.success && result.data?.token) {
        localStorage.setItem('token', result.data.token);
        if (login) login(result.data.user, result.data.token);
        setTimeout(() => navigate('/partner/application-status', { replace: true }), 1500);
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Registration failed' });
    }
  };

  const getFieldError = (field) => touchedFields[field] && errors[field];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Partner Registration
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Join CheckInn as a Hotel Partner</p>
        </motion.div>

        {/* Progress */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 -z-10">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                initial={{ width: '0%' }}
                animate={{ width: `${((currentStep - 1) / 4) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center relative">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    currentStep >= step.number
                      ? `bg-gradient-to-r ${step.color} text-white shadow-lg`
                      : 'bg-white text-gray-400 border-2 border-gray-200'
                  }`}
                >
                  {currentStep > step.number ? <Check className="w-6 h-6" /> : <step.icon className="w-6 h-6" />}
                </motion.div>
                <span className={`mt-2 text-xs font-medium hidden sm:block ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-8"
          >
            {/* STEP 1: BASIC INFO */}
            {currentStep === 1 && (
              <div>
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-3 mr-4">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
                      <p className="text-gray-600">Let's start with your personal details</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input type="text" name="name" value={formData.name} onChange={handleChange}
                        onBlur={() => setTouchedFields(p => ({ ...p, name: true }))}
                        className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${getFieldError('name') ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="John Doe" />
                    </div>
                    {getFieldError('name') && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input type="email" name="email" value={formData.email} onChange={handleChange}
                        onBlur={() => setTouchedFields(p => ({ ...p, email: true }))}
                        className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${getFieldError('email') ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="john@example.com" />
                    </div>
                    {getFieldError('email') && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                        onBlur={() => setTouchedFields(p => ({ ...p, phone: true }))}
                        className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${getFieldError('phone') ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="+84 123 456 789" />
                    </div>
                    {getFieldError('phone') && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                        onBlur={() => setTouchedFields(p => ({ ...p, password: true }))}
                        className={`pl-10 pr-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${getFieldError('password') ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400">
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {getFieldError('password') && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.password}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                        onBlur={() => setTouchedFields(p => ({ ...p, confirmPassword: true }))}
                        className={`pl-10 pr-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${getFieldError('confirmPassword') ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="••••••••" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-gray-400">
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {getFieldError('confirmPassword') && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.confirmPassword}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: BUSINESS */}
            {currentStep === 2 && (
              <div>
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-3 mr-4">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Business Information</h2>
                      <p className="text-gray-600">Tell us about your business</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
                    <input type="text" name="businessName" value={formData.businessName} onChange={handleChange}
                      onBlur={() => setTouchedFields(p => ({ ...p, businessName: true }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 ${getFieldError('businessName') ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Your Hotel Business" />
                    {getFieldError('businessName') && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.businessName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                    <select name="businessType" value={formData.businessType} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                      <option value="individual">Individual</option>
                      <option value="company">Company</option>
                      <option value="chain">Hotel Chain</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID</label>
                    <input type="text" name="taxId" value={formData.taxId} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Optional" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center"><MapPin className="h-5 w-5 mr-2 text-purple-600" />Address</h3>
                    <input type="text" name="businessAddress.street" value={formData.businessAddress.street} onChange={handleChange}
                      onBlur={() => setTouchedFields(p => ({ ...p, 'businessAddress.street': true }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 ${getFieldError('businessAddress.street') ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Street *" />
                    {getFieldError('businessAddress.street') && <p className="mt-1 text-sm text-red-600"><AlertCircle className="inline w-4 h-4 mr-1" />{errors['businessAddress.street']}</p>}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input type="text" name="businessAddress.city" value={formData.businessAddress.city} onChange={handleChange}
                          onBlur={() => setTouchedFields(p => ({ ...p, 'businessAddress.city': true }))}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 ${getFieldError('businessAddress.city') ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="City *" />
                        {getFieldError('businessAddress.city') && <p className="mt-1 text-sm text-red-600"><AlertCircle className="inline w-4 h-4 mr-1" />{errors['businessAddress.city']}</p>}
                      </div>
                      <div>
                        <input type="text" name="businessAddress.state" value={formData.businessAddress.state} onChange={handleChange}
                          onBlur={() => setTouchedFields(p => ({ ...p, 'businessAddress.state': true }))}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 ${getFieldError('businessAddress.state') ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="State *" />
                        {getFieldError('businessAddress.state') && <p className="mt-1 text-sm text-red-600"><AlertCircle className="inline w-4 h-4 mr-1" />{errors['businessAddress.state']}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input type="text" name="businessAddress.zipCode" value={formData.businessAddress.zipCode} onChange={handleChange}
                          onBlur={() => setTouchedFields(p => ({ ...p, 'businessAddress.zipCode': true }))}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 ${getFieldError('businessAddress.zipCode') ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="Zip Code *" />
                        {getFieldError('businessAddress.zipCode') && <p className="mt-1 text-sm text-red-600"><AlertCircle className="inline w-4 h-4 mr-1" />{errors['businessAddress.zipCode']}</p>}
                      </div>
                      <div>
                        <input type="text" name="businessAddress.country" value={formData.businessAddress.country} onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="Country" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: BANKING */}
            {currentStep === 3 && (
              <div>
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-3 mr-4">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Banking Information</h2>
                      <p className="text-gray-600">Set up payment account</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2"><Landmark className="inline h-4 w-4 mr-1" />Bank Name *</label>
                    <input type="text" name="bankAccount.bankName" value={formData.bankAccount.bankName} onChange={handleChange}
                      onBlur={() => setTouchedFields(p => ({ ...p, 'bankAccount.bankName': true }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${getFieldError('bankAccount.bankName') ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Vietcombank" />
                    {getFieldError('bankAccount.bankName') && <p className="mt-1 text-sm text-red-600"><AlertCircle className="inline w-4 h-4 mr-1" />{errors['bankAccount.bankName']}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Number *</label>
                    <input type="text" name="bankAccount.accountNumber" value={formData.bankAccount.accountNumber} onChange={handleChange}
                      onBlur={() => setTouchedFields(p => ({ ...p, 'bankAccount.accountNumber': true }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${getFieldError('bankAccount.accountNumber') ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="1234567890" />
                    {getFieldError('bankAccount.accountNumber') && <p className="mt-1 text-sm text-red-600"><AlertCircle className="inline w-4 h-4 mr-1" />{errors['bankAccount.accountNumber']}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder *</label>
                    <input type="text" name="bankAccount.accountHolder" value={formData.bankAccount.accountHolder} onChange={handleChange}
                      onBlur={() => setTouchedFields(p => ({ ...p, 'bankAccount.accountHolder': true }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${getFieldError('bankAccount.accountHolder') ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="NGUYEN VAN A" />
                    {getFieldError('bankAccount.accountHolder') && <p className="mt-1 text-sm text-red-600"><AlertCircle className="inline w-4 h-4 mr-1" />{errors['bankAccount.accountHolder']}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SWIFT Code *</label>
                      <input type="text" name="bankAccount.swiftCode" value={formData.bankAccount.swiftCode} onChange={handleChange}
                        onBlur={() => setTouchedFields(p => ({ ...p, 'bankAccount.swiftCode': true }))}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${getFieldError('bankAccount.swiftCode') ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="BFTVVNVX" />
                      {getFieldError('bankAccount.swiftCode') && <p className="mt-1 text-sm text-red-600"><AlertCircle className="inline w-4 h-4 mr-1" />{errors['bankAccount.swiftCode']}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
                      <input type="text" name="bankAccount.branchName" value={formData.bankAccount.branchName} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Hanoi Branch (optional)" />
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <Shield className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
                      <p className="text-sm text-green-800">Your banking info is encrypted and secure.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: DOCUMENTS */}
            {currentStep === 4 && (
              <div>
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-3 mr-4">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Verification Documents</h2>
                      <p className="text-gray-600">Upload required documents</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  {['business_license', 'tax_certificate', 'id_card'].map((docType) => (
                    <div key={docType} className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-orange-500 transition">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold capitalize">{docType.replace('_', ' ')}{docType !== 'id_card' && ' *'}</h3>
                        </div>
                        <Upload className="h-8 w-8 text-gray-400" />
                      </div>
                      {formData.documents.find(d => d.type === docType) ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                            <div>
                              <p className="font-medium text-green-900">{formData.documents.find(d => d.type === docType).name}</p>
                              <p className="text-sm text-green-700">{(formData.documents.find(d => d.type === docType).size / 1024).toFixed(2)} KB</p>
                            </div>
                          </div>
                          <button onClick={() => {
                            const idx = formData.documents.findIndex(d => d.type === docType);
                            handleRemoveDocument(idx);
                          }} className="text-red-600"><X className="h-5 w-5" /></button>
                        </div>
                      ) : (
                        <label className="block cursor-pointer">
                          <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, docType)} className="hidden" />
                          <div className="text-center py-4">
                            <Sparkles className="mx-auto h-10 w-10 text-orange-400 mb-2" />
                            <p className="text-sm text-gray-600">Click to upload</p>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF up to 5MB</p>
                          </div>
                        </label>
                      )}
                    </div>
                  ))}
                  {errors.documents && <p className="text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-2" />{errors.documents}</p>}
                </div>
              </div>
            )}

            {/* STEP 5: REVIEW */}
            {currentStep === 5 && (
              <div>
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl p-3 mr-4">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Review & Submit</h2>
                      <p className="text-gray-600">Verify your information</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center"><User className="h-5 w-5 mr-2 text-blue-600" />Basic</h3>
                    <dl className="grid grid-cols-2 gap-4 text-sm">
                      <div><dt className="font-medium text-gray-600">Name</dt><dd className="text-gray-900 mt-1">{formData.name}</dd></div>
                      <div><dt className="font-medium text-gray-600">Email</dt><dd className="text-gray-900 mt-1">{formData.email}</dd></div>
                      <div><dt className="font-medium text-gray-600">Phone</dt><dd className="text-gray-900 mt-1">{formData.phone}</dd></div>
                    </dl>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center"><Building2 className="h-5 w-5 mr-2 text-purple-600" />Business</h3>
                    <dl className="grid grid-cols-2 gap-4 text-sm">
                      <div><dt className="font-medium text-gray-600">Name</dt><dd className="text-gray-900 mt-1">{formData.businessName}</dd></div>
                      <div><dt className="font-medium text-gray-600">Type</dt><dd className="text-gray-900 mt-1 capitalize">{formData.businessType}</dd></div>
                      <div className="col-span-2"><dt className="font-medium text-gray-600">Address</dt><dd className="text-gray-900 mt-1">{formData.businessAddress.street}, {formData.businessAddress.city}, {formData.businessAddress.state} {formData.businessAddress.zipCode}, {formData.businessAddress.country}</dd></div>
                    </dl>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center"><CreditCard className="h-5 w-5 mr-2 text-green-600" />Banking</h3>
                    <dl className="grid grid-cols-2 gap-4 text-sm">
                      <div><dt className="font-medium text-gray-600">Bank</dt><dd className="text-gray-900 mt-1">{formData.bankAccount.bankName}</dd></div>
                      <div><dt className="font-medium text-gray-600">Account</dt><dd className="text-gray-900 mt-1">{formData.bankAccount.accountNumber.replace(/\d(?=\d{4})/g, '*')}</dd></div>
                      <div><dt className="font-medium text-gray-600">Holder</dt><dd className="text-gray-900 mt-1">{formData.bankAccount.accountHolder}</dd></div>
                      <div><dt className="font-medium text-gray-600">SWIFT</dt><dd className="text-gray-900 mt-1">{formData.bankAccount.swiftCode}</dd></div>
                      {formData.bankAccount.branchName && <div className="col-span-2"><dt className="font-medium text-gray-600">Branch</dt><dd className="text-gray-900 mt-1">{formData.bankAccount.branchName}</dd></div>}
                    </dl>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center"><FileText className="h-5 w-5 mr-2 text-orange-600" />Documents</h3>
                    {formData.documents.map((doc, i) => (
                      <div key={i} className="flex items-center py-2 border-b last:border-0">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                        <span className="text-sm capitalize">{doc.type.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                  {errors.submit && <div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-sm text-red-600 flex items-center"><AlertCircle className="w-5 h-5 mr-2" />{errors.submit}</p></div>}
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit}
                    disabled={registerMutation.isPending}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition disabled:opacity-50 flex items-center justify-center">
                    {registerMutation.isPending ? (
                      <><Loader2 className="animate-spin h-6 w-6 mr-3" />Submitting...</>
                    ) : registerMutation.isSuccess ? (
                      <><CheckCircle className="h-6 w-6 mr-3" />Success!</>
                    ) : (
                      <><Sparkles className="h-6 w-6 mr-3" />Complete Registration</>
                    )}
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleBack}
            disabled={currentStep === 1}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition ${currentStep === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border-2'}`}>
            <ArrowLeft className="h-5 w-5 mr-2" />Back
          </motion.button>
          {currentStep < 5 && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleNext}
              className="flex items-center px-6 py-3 rounded-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition">
              Next<ArrowRight className="h-5 w-5 ml-2" />
            </motion.button>
          )}
        </div>

        {/* Success Modal */}
        <AnimatePresence>
          {registerMutation.isSuccess && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                <div className="text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
                    className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-12 w-12 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Registration Successful!</h3>
                  <p className="text-gray-600 mb-6">Your account is created. We're reviewing your documents (2-3 days).</p>
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-sm text-gray-600">Redirecting...</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PartnerRegisterPage;
