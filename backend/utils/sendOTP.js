const nodemailer = require('nodemailer');

/**
 * Sends a futuristic OTP verification email using Gmail SMTP or falls back to console logging
 * @param {string} email Receiver's email
 * @param {string} otp The generated OTP code
 * @returns {Promise<boolean>} Success status
 */
const sendOTP = async (email, otp) => {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #0b0c10;
          color: #c5c6c7;
          margin: 0;
          padding: 0;
          text-align: center;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: rgba(31, 40, 51, 0.95);
          border: 2px solid #00f0ff;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.2);
        }
        .header {
          border-bottom: 1px solid #1f2833;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        .logo {
          font-size: 28px;
          font-weight: 800;
          color: #00f0ff;
          text-transform: uppercase;
          letter-spacing: 2px;
          text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
        }
        .title {
          font-size: 20px;
          color: #ffffff;
          margin-top: 10px;
        }
        .otp-box {
          background: #000;
          border: 1px dashed #bd00ff;
          border-radius: 8px;
          padding: 15px;
          margin: 30px 0;
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          color: #bd00ff;
          text-shadow: 0 0 8px rgba(189, 0, 255, 0.4);
        }
        .info {
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .footer {
          font-size: 11px;
          color: #667280;
          border-top: 1px solid #1f2833;
          padding-top: 20px;
          margin-top: 25px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">SHOPEZ</div>
          <div class="title">Security Verification Code</div>
        </div>
        <p class="info">
          Greetings User,<br>
          We received a request to verify your identity for ShopEZ. Use the security code below to complete your registration.
        </p>
        <div class="otp-box">${otp}</div>
        <p class="info" style="color: #ff3838;">
          This code is only valid for 5 minutes. Do not share this code with anyone.
        </p>
        <div class="footer">
          ShopEZ Network Protocol &copy; 2026. All transmissions are encrypted.
        </div>
      </div>
    </body>
    </html>
  `;

  if (!gmailUser || !gmailPass) {
    console.log('\n=============================================');
    console.log(`[SMTP OFFLINE - DEVELOPER MODE FALLBACK]`);
    console.log(`Target Email: ${email}`);
    console.log(`Generated OTP: ${otp}`);
    console.log('To send actual emails, configure GMAIL_USER and GMAIL_APP_PASSWORD in backend/.env');
    console.log('=============================================\n');
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    const mailOptions = {
      from: `"ShopEZ Security" <${gmailUser}>`,
      to: email,
      subject: `[ShopEZ] OTP Verification Code: ${otp}`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP email via SMTP:', error);
    // If SMTP fails, we'll log it and return false, or we can fallback to console in development
    console.log('\n=============================================');
    console.log(`[SMTP SEND ERROR - FALLBACK DISCOVERED]`);
    console.log(`Target Email: ${email}`);
    console.log(`Generated OTP Code (Temporary Use): ${otp}`);
    console.log('=============================================\n');
    return false;
  }
};

module.exports = sendOTP;
