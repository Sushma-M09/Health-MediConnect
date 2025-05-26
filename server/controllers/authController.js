const bcrypt = require('bcryptjs');
const { db } = require('../config/firebase');

exports.register = async (req, res) => {
  try {
    const data = req.body;

    if (!data.email || !data.password) {
      return res.status(400).json({ msg: 'Email and password required' });
    }

    if (data.role === 'doctor' && !data.name.startsWith('Dr.')) {
      data.name = `Dr. ${data.name}`;
    }

    const collection = data.role === 'doctor' ? 'doctors' : 'patients';
    const existingUserSnapshot = await db.collection(collection)
      .where('email', '==', data.email).get();

    if (!existingUserSnapshot.empty) {
      return res.status(400).json({ msg: 'Email is already registered' });
    }

    data.password = await bcrypt.hash(data.password, 10);
    const docRef = await db.collection(collection).add(data);

    res.status(201).json({ id: docRef.id, msg: 'Registered' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.login = async (req, res) => {

  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ msg: 'Email, password, and role are required' });
    }

    let userDoc = null;

    const collection = role === 'patient' ? 'patients' : 'doctors';
    const userSnap = await db.collection(collection).where('email', '==', email).get();

    if (!userSnap.empty) {
      userDoc = userSnap.docs[0];
    }

    if (!userDoc) return res.status(404).json({ msg: 'User not found' });

    const userData = userDoc.data();
    const isMatch = await bcrypt.compare(password, userData.password);

    if (!isMatch) return res.status(401).json({ msg: 'Incorrect password' });

    res.json({
      msg: 'Login successful',
      role,
      userId: userDoc.id,
      name: userData.name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
exports.changePassword = async (req, res) => {
  try {
    const { role, id } = req.params;
    const { currentPassword, newPassword } = req.body;
    const collection = role === 'doctor' ? 'doctors' : 'patients';
    const userDocRef = db.collection(collection).doc(id);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const userData = userDoc.data();
    const isMatch = await bcrypt.compare(currentPassword, userData.password);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Current password is incorrect' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userDocRef.update({ password: hashedPassword });

    res.status(200).json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to change password' });
  }
};
