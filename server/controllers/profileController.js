const { db } = require('../config/firebase');

exports.getProfile = async (req, res) => {
  try {
    const { role, id } = req.params;
    const collection = role === 'doctor' ? 'doctors' : 'patients';

    const doc = await db.collection(collection).doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { role, id } = req.params;
    const collection = role === 'doctor' ? 'doctors' : 'patients';

    await db.collection(collection).doc(id).update(req.body);

    res.status(200).json({ msg: 'Profile updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Update failed' });
  }
};
