/**
 * Email Utilities for CheckInn Hotel Booking Platform
 * 
 * Comprehensive email service với password reset, verification,
 * và notification features
 * 
 * @author CheckInn Team
 * @version 2.0.0
 */

const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
const path = require('path');

/**
 * Email service class
 */
class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `CheckInn Hotel Booking <${process.env.EMAIL_FROM}>`;
  }

  /**
   * Create email transporter based on environment
   */
  newTransporter() {
    if (process.env.NODE_ENV === 'production') {
      // Production - use SendGrid, Mailgun, or other service
      return nodemailer.createTransporter({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
    }

    // Development - use Gmail or Mailtrap
    return nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  /**
   * Send email with template
   * @param {string} template - Template name
   * @param {string} subject - Email subject
   * @param {Object} data - Additional template data
   */
  async send(template, subject, data = {}) {
    try {
      // 1) Render HTML based on pug template
      const templatePath = path.join(__dirname, '..', 'views', 'email', `${template}.pug`);
      let html;
      
      try {
        html = pug.renderFile(templatePath, {
          firstName: this.firstName,
          url: this.url,
          subject,
          ...data
        });
      } catch (templateError) {
        // Fallback to simple HTML if template not found
        html = this.createSimpleTemplate(template, subject, data);
      }

      // 2) Define email options
      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html,
        text: htmlToText.convert(html, {
          wordwrap: 80
        })
      };

      // 3) Create transporter and send email
      const transporter = this.newTransporter();
      await transporter.sendMail(mailOptions);
      
      console.log(`Email sent successfully to ${this.to}: ${subject}`);
      
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Email could not be sent. Please try again later.');
    }
  }

  /**
   * Create simple HTML template as fallback
   */
  createSimpleTemplate(template, subject, data) {
    const baseTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CheckInn Hotel Booking</h1>
          </div>
          <div class="content">
            <h2>Hello ${this.firstName}!</h2>
    `;

    let content = '';
    
    switch (template) {
      case 'welcome':
        content = `
          <p>Welcome to CheckInn! We're excited to have you on board.</p>
          <p>To get started, please verify your email address by clicking the button below:</p>
          <a href="${this.url}" class="button">Verify Email Address</a>
          <p>If you didn't create an account with us, please ignore this email.</p>
        `;
        break;
        
      case 'passwordReset':
        content = `
          <p>You requested a password reset for your CheckInn account.</p>
          <p>Click the button below to reset your password (valid for 10 minutes):</p>
          <a href="${this.url}" class="button">Reset Password</a>
          <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
        `;
        break;
        
      case 'emailVerification':
        content = `
          <p>Please verify your email address to complete your CheckInn account setup.</p>
          <a href="${this.url}" class="button">Verify Email</a>
          <p>This link will expire in 24 hours.</p>
        `;
        break;
        
      default:
        content = `
          <p>Thank you for using CheckInn!</p>
          <p>If you have any questions, feel free to contact our support team.</p>
        `;
    }

    const closeTemplate = `
            ${content}
          </div>
          <div class="footer">
            <p>Best regards,<br>The CheckInn Team</p>
            <p>If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>
            <p><a href="${this.url}">${this.url}</a></p>
          </div>
        </body>
      </html>
    `;

    return baseTemplate + closeTemplate;
  }

  /**
   * Send welcome email
   */
  async sendWelcome() {
    await this.send('welcome', 'Welcome to CheckInn!');
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset() {
    await this.send(
      'passwordReset', 
      'Your password reset token (valid for 10 minutes)'
    );
  }

  /**
   * Send email verification
   */
  async sendEmailVerification() {
    await this.send(
      'emailVerification',
      'Verify your CheckInn account email'
    );
  }

  /**
   * Send booking confirmation
   */
  async sendBookingConfirmation(bookingData) {
    await this.send(
      'bookingConfirmation',
      'Booking Confirmation - CheckInn',
      { booking: bookingData }
    );
  }

  /**
   * Send booking cancellation
   */
  async sendBookingCancellation(bookingData) {
    await this.send(
      'bookingCancellation',
      'Booking Cancellation - CheckInn',
      { booking: bookingData }
    );
  }
}

/**
 * Quick send functions for common email types
 */
const sendWelcomeEmail = async (user, verifyURL) => {
  await new Email(user, verifyURL).sendWelcome();
};

const sendPasswordResetEmail = async (user, resetURL) => {
  await new Email(user, resetURL).sendPasswordReset();
};

const sendEmailVerification = async (user, verifyURL) => {
  await new Email(user, verifyURL).sendEmailVerification();
};

module.exports = {
  Email,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendEmailVerification
};