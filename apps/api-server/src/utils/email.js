/**
 * Email Utilities for CheckInn Hotel Booking Plat    // SMTP Configuration (including Gmail)
    if (emailService === 'smtp' || emailService === 'gmail' || !emailService) {
      return nodemailer.createTransporter({
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
    }prehensive email service with OTP, password reset, verification,
 * and notification features
 * 
 * @author CheckInn Team
 * @version 3.0.0
 */

const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
const path = require('path');

/**
 * Email service class
 */
class Email {
  constructor(user, url = '', otpCode = '') {
    this.to = user.email;
    this.firstName = user.name ? user.name.split(' ')[0] : 'User';
    this.url = url;
    this.otpCode = otpCode;
    this.from = `CheckInn Hotel Booking <${process.env.EMAIL_FROM || process.env.EMAIL_USERNAME}>`;
  }

  /**
   * Create email transporter based on environment and service
   */
  newTransporter() {
    const emailService = process.env.EMAIL_SERVICE;
    
    // Production services
    if (emailService === 'sendgrid') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      });
    }

    if (emailService === 'mailgun') {
      return nodemailer.createTransport({
        service: 'Mailgun',
        auth: {
          user: process.env.MAILGUN_USERNAME,
          pass: process.env.MAILGUN_PASSWORD
        }
      });
    }

    // SMTP Configuration (including Gmail)
    if (emailService === 'smtp' || emailService === 'gmail' || !emailService) {
      return nodemailer.createTransport({
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
    }

    // Default development transporter (ethereal for testing)
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'your-ethereal-user',
        pass: 'your-ethereal-pass'
      }
    });
  }

  /**
   * Send actual email
   */
  async send(template, subject) {
    try {
      // 1) Render HTML based on pug template
      const templatePath = path.join(
        __dirname,
        '../views/emails',
        `${template}.pug`
      );

      const html = pug.renderFile(templatePath, {
        firstName: this.firstName,
        url: this.url,
        verificationUrl: this.url, // Alias for verify-email template
        otpCode: this.otpCode,
        subject,
      });

      // 2) Define email options
      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html,
        text: htmlToText.convert(html, {
          wordwrap: 130,
        }),
      };

      // 3) Create transport and send email
      const transporter = this.newTransporter();
      const info = await transporter.sendMail(mailOptions);

      console.log(`[Email] Sent ${template} to ${this.to}:`, info.messageId);
      return info;
    } catch (error) {
      console.error(`[Email] Error sending ${template}:`, error);
      throw error;
    }
  }

  /**
   * Send OTP verification email
   */
  async sendOTPVerification() {
    await this.send('otp-verification', 'Ma xac thuc OTP - CheckInn Hotel Booking');
  }

  /**
   * Send welcome email
   */
  async sendWelcome() {
    await this.send('welcome', 'Chao mung den voi CheckInn! ');
  }

  /**
   * Send email verification
   */
  async sendEmailVerification() {
    await this.send('verify-email', 'Xac thuc tai khoan CheckInn cua ban ');
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset() {
    await this.send(
      'password-reset',
      'Dat lai mat khau CheckInn (co hieu luc 10 phut)'
    );
  }

  /**
   * Send booking confirmation
   */
  async sendBookingConfirmation() {
    await this.send('booking-confirmation', 'Xac nhan dat phong - CheckInn');
  }
}

/**
 * Helper function: Send OTP email
 */
const sendOTPEmail = async (user, otpCode) => {
  await new Email(user, '', otpCode).sendOTPVerification();
};

/**
 * Helper function: Send welcome email
 */
const sendWelcomeEmail = async (user, url) => {
  await new Email(user, url).sendWelcome();
};

/**
 * Helper function: Send password reset email
 */
const sendPasswordResetEmail = async (user, resetURL) => {
  await new Email(user, resetURL).sendPasswordReset();
};

/**
 * Helper function: Send email verification
 */
const sendEmailVerification = async (user, verificationURL) => {
  await new Email(user, verificationURL).sendEmailVerification();
};

/**
 * Alias for sendEmailVerification (for backward compatibility)
 */
const sendEmailVerificationEmail = async (user, verificationURL) => {
  await new Email(user, verificationURL).sendEmailVerification();
};

/**
 * Helper function: Send booking confirmation
 */
const sendBookingConfirmationEmail = async (user, bookingDetails) => {
  await new Email(user, bookingDetails).sendBookingConfirmation();
};

module.exports = {
  Email,
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendEmailVerification,
  sendEmailVerificationEmail,
  sendBookingConfirmationEmail,
};
