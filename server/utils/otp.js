const nodemailer = require('nodemailer');
const EMAIL='mediconnect0409@gmail.com'
const EMAIL_PASSWORD='eibf jbpf qwcv wtry'


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL, 
    pass: EMAIL_PASSWORD, 
  },
});

const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'MediConnect Password Reset - OTP Verification',
    text: `Hello,

We received a request to reset your MediConnect account password.

Your One-Time Password (OTP) is: ${otp}

This OTP is valid for 10 minutes. Please do not share this code with anyone.

If you did not request a password reset, please ignore this email.

Thank you,
The MediConnect Team`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
        <h2 style="color: #2b7cff;">MediConnect - Password Reset</h2>
        <p>Hello,</p>
        <p>We received a request to reset the password for your <strong>MediConnect</strong> account.</p>
        <p style="font-size: 16px;">Your One-Time Password (OTP) is:</p>
        <div style="font-size: 24px; font-weight: bold; color: #2b7cff; margin: 16px 0;">
          ${otp}
        </div>
        <p>This OTP is valid for <strong>10 minutes</strong>.</p>
        <p style="color: #ff4d4f;">Please do not share this code with anyone.</p>
        <hr style="margin: 24px 0;">
        <p>Stay healthy,<br><strong>The MediConnect Team</strong></p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendOTP;