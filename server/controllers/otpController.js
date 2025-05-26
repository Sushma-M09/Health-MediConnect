const { db } = require('../config/firebase');
const sendOTP = require('../utils/otp');
const bcrypt = require('bcryptjs');



exports.sendOtp = async (req, res) => {
  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ msg: 'Email and role are required' });
  }

  const collectionName = role === 'patient' ? 'patients' : role === 'doctor' ? 'doctors' : null;
  if (!collectionName) {
    return res.status(400).json({ msg: 'Invalid role specified' });
  }

  try {
    const snapshot = await db.collection(collectionName).where('email', '==', email).get();

    if (snapshot.empty) {
      return res.status(404).json({ msg: `No ${role} found with that email` });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    await db.collection('otp').doc(email).set({ otp, expiresAt, role });

    //console.log(`OTP for ${email}: ${otp}`);

    await sendOTP(email, otp);

    res.json({ msg: 'OTP sent to your email' });
  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ msg: 'Failed to send OTP' });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ msg: 'Email and OTP required' });

  try {
    const otpDoc = await db.collection('otp').doc(email).get();
    if (!otpDoc.exists) return res.status(400).json({ msg: 'OTP not found' });

    const data = otpDoc.data();
    if (data.otp !== otp || data.expiresAt < Date.now()) {
      return res.status(400).json({ msg: 'Invalid or expired OTP' });
    }

    res.json({ msg: 'OTP verified' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error verifying OTP' });
  }
};


exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ msg: 'Missing required fields' });
  }

  try {
    const otpDoc = await db.collection('otp').doc(email).get();
    if (
      !otpDoc.exists ||
      otpDoc.data().otp !== otp ||
      otpDoc.data().expiresAt < Date.now()
    ) {
      return res.status(400).json({ msg: 'Invalid or expired OTP' });
    }

    const role = otpDoc.data().role;
    if (!role) {
      return res.status(400).json({ msg: 'User role not found in OTP data' });
    }

    const collection = role === 'patient' ? 'patients' : 'doctors';
    const userSnapshot = await db.collection(collection).where('email', '==', email).get();

    if (userSnapshot.empty) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const userDocRef = userSnapshot.docs[0].ref;
    await userDocRef.update({
      password: hashedPassword,
    });

    await db.collection('otp').doc(email).delete();

    res.json({ msg: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ msg: 'Server error resetting password' });
  }
};