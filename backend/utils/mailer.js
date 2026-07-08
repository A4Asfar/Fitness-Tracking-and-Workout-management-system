const nodemailer = require('nodemailer');
const { APP_NAME, SUPPORT_EMAIL } = require('../constants/brand');

const EMAIL_SEND_TIMEOUT_MS = 15000;

function isEmailConfigured() {
  const user = process.env.EMAIL_USER || '';
  const pass = process.env.EMAIL_PASS || '';
  if (!user || !pass) return false;
  if (user.includes('example') || user.includes('YOUR_')) return false;
  if (pass.includes('your_') || pass.includes('YOUR_')) return false;
  return true;
}

/**
 * Professional Email Transport Utility
 * Configured for Gmail/SMTP usage
 */
const sendEmail = async (options) => {
  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Email not configured — OTP for ${options.email}: ${options.otp}`);
      return;
    }
    throw new Error('Email service is not configured on the server. Please contact support.');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: EMAIL_SEND_TIMEOUT_MS,
    greetingTimeout: EMAIL_SEND_TIMEOUT_MS,
    socketTimeout: EMAIL_SEND_TIMEOUT_MS,
  });

  const mailOptions = {
    from: `"${APP_NAME} Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #10B981; background: #0F172A; display: inline-block; padding: 10px 20px; border-radius: 8px;">${APP_NAME}</h2>
        </div>
        <div style="color: #333; line-height: 1.6;">
          <h3 style="color: #0F172A;">Password Reset Request</h3>
          <p>Hello,</p>
          <p>We received a request to reset your password for your ${APP_NAME} account. Use the code below to proceed:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #10B981; background: #0F172A; padding: 15px 30px; border-radius: 10px;">${options.otp}</span>
          </div>
          <p>This code is valid for <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email or contact ${SUPPORT_EMAIL}.</p>
          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #777;">&copy; 2026 ${APP_NAME} — Modern AI Fitness & Coaching Platform. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  await Promise.race([
    transporter.sendMail(mailOptions),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Email delivery timed out. Please try again.')), EMAIL_SEND_TIMEOUT_MS)
    ),
  ]);
};

module.exports = sendEmail;
module.exports.isEmailConfigured = isEmailConfigured;
