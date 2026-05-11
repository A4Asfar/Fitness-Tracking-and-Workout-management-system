const nodemailer = require('nodemailer');

/**
 * Professional Email Transport Utility
 * Configured for Gmail/SMTP usage
 */
const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"FitPro AI Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #CCFF00; background: #000; display: inline-block; padding: 10px 20px; border-radius: 5px;">FITPRO AI</h2>
        </div>
        <div style="color: #333; line-height: 1.6;">
          <h3 style="color: #000;">Password Reset Request</h3>
          <p>Hello,</p>
          <p>We received a request to reset your password for your FitPro AI account. Use the code below to proceed:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #CCFF00; background: #000; padding: 15px 30px; border-radius: 10px;">${options.otp}</span>
          </div>
          <p>This code is valid for <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #777;">&copy; 2026 FitPro AI - Professional Fitness Management. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
