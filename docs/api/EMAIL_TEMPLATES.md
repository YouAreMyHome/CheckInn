# 📧 CheckInn Email Templates - Documentation

## Overview
Modern, bilingual (Vietnamese + English) email templates with vibrant gradients and engaging design.

---

## 🎨 Design Features

### Visual Elements
- 🌈 **Rainbow Bar**: Colorful gradient bar at the top
- 🎯 **Gradient Backgrounds**: Purple, pink, orange gradients
- 📱 **Responsive**: Mobile-friendly design
- 🌍 **Bilingual**: Vietnamese + English content
- 🎭 **Large Emojis**: Eye-catching visual elements

### Color Palette
- **Primary**: `#667eea` → `#764ba2` (Purple gradient)
- **CTA**: `#ff6b6b` → `#ee5a6f` (Red-orange gradient)
- **Benefits**: `#f093fb` → `#f5576c` (Pink gradient)
- **Tips**: `#ffecd2` → `#fcb69f` (Orange gradient)
- **Footer**: `#2d3748` → `#4a5568` (Dark gray gradient)

---

## 📬 Available Templates

### 1. **Welcome Email** (`welcome.pug`)
**Purpose**: Sent when user creates a new account

**Variables**:
- `firstName`: User's first name
- `url`: Link to explore the platform

**Sections**:
- 🎉 Hero welcome banner
- 🏨 4 Feature cards (Hotels, Pricing, Reviews, Support)
- 🚀 Main CTA button
- 🎁 4 Benefits cards
- 💡 4 Tips for first booking
- 🌐 Footer with social links

**Example Usage**:
```javascript
const { sendWelcomeEmail } = require('./utils/email');

await sendWelcomeEmail(user, 'https://checkinn.com/explore');
```

---

### 2. **Verify Email** (`verify-email.pug`)
**Purpose**: Sent to verify user's email address

**Variables**:
- `firstName`: User's first name
- `verificationUrl`: Email verification link

**Sections**:
- 📧 Hero verification banner
- 🔐 Security notice (why verify?)
- 🚀 Large CTA button
- ⏰ Expiry notice (24 hours)
- 💬 Help section

**Example Usage**:
```javascript
const { sendEmailVerificationEmail } = require('./utils/email');

await sendEmailVerificationEmail(user, verificationToken);
```

---

## 🔧 Template Structure

### Base Layout (`_layout.pug`)
All templates extend this base layout which includes:
- HTML5 structure
- Meta tags for email clients
- Google Fonts (Poppins)
- Responsive styles
- Common animations

### Inline Styles
All styles are inline to ensure compatibility with email clients.

---

## 📊 Email Client Compatibility

✅ **Supported**:
- Gmail (Desktop & Mobile)
- Outlook (Desktop & Web)
- Apple Mail
- Yahoo Mail
- ProtonMail

⚠️ **Limited Support**:
- Some gradients may not render in older Outlook versions
- Animations are not supported in all clients

---

## 🚀 Adding New Templates

### Step 1: Create Template File
```pug
// views/emails/your-template.pug
extends _layout

block content
  table.email-wrapper
    // Your content here
```

### Step 2: Add Method to Email Class
```javascript
// utils/email.js
async sendYourTemplate() {
  await this.send(
    'your-template',
    'Email Subject Here'
  );
}
```

### Step 3: Export Helper Function
```javascript
const sendYourTemplateEmail = async (user, url) => {
  await new Email(user, url).sendYourTemplate();
};

module.exports = {
  // ... existing exports
  sendYourTemplateEmail
};
```

---

## 🎯 Best Practices

### Content
- ✅ Keep subject lines under 50 characters
- ✅ Use clear, action-oriented CTA buttons
- ✅ Maintain bilingual consistency
- ✅ Include unsubscribe links (for marketing emails)

### Design
- ✅ Use contrasting colors for CTA buttons
- ✅ Keep maximum width at 600px
- ✅ Test on multiple devices
- ✅ Use web-safe fonts as fallbacks

### Code
- ✅ Inline all CSS styles
- ✅ Use tables for layout (better compatibility)
- ✅ Test with HTML-to-text conversion
- ✅ Include alt text for images

---

## 📝 Template Variables

### Common Variables (all templates)
- `firstName`: User's first name
- `url`: Primary action URL
- `subject`: Email subject line

### Template-Specific Variables
- `verificationUrl`: For email verification
- `resetUrl`: For password reset
- `bookingData`: For booking confirmations

---

## 🔒 Security Considerations

- ✅ All URLs should use HTTPS
- ✅ Verification links should expire
- ✅ Include contact information
- ✅ Warn about phishing attempts

---

## 📞 Support

For questions or issues:
- 📧 Email: support@checkinn.com
- 📞 Phone: +84 123 456 789

---

## 📋 Todo

- [ ] Add password reset template
- [ ] Add booking confirmation template
- [ ] Add booking cancellation template
- [ ] Add payment receipt template
- [ ] Add promotional email template
- [ ] Add newsletter template

---

**Last Updated**: October 13, 2025
**Version**: 1.0.0
