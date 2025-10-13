const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('Testing email configuration...');
console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('EMAIL_USERNAME:', process.env.EMAIL_USERNAME);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***configured***' : 'NOT SET');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

console.log('Testing connection...');
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Connection failed:', error.message);
  } else {
    console.log('✅ Connection successful! Server is ready to take our messages');
  }
  process.exit();
});