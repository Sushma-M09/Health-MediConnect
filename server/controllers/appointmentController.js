const { db } = require('../config/firebase');

exports.getDoctors = async (req, res) => {
  try {
    const snapshot = await db.collection('doctors').get();
    const doctors = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to fetch doctors' });
  }
};


exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, patientId, date, time, force } = req.body;

    if (!doctorId || !patientId || !date || !time) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    const appointmentRef = db.collection('appointments');
    const snapshot = await appointmentRef
      .where('patientId', '==', patientId)
      .where('date', '==', date)
      .where('time', '==', time)
      .get();

    let sameDoctorConflict = false;
    let otherDoctorConflict = false;

    snapshot.forEach(doc => {
      const appt = doc.data();
      if (appt.doctorId === doctorId) {
        sameDoctorConflict = true;
      } else {
        otherDoctorConflict = true;
      }
    });

    if (sameDoctorConflict) {
      return res.status(409).json({ msg: 'You already have an appointment with this doctor at the same time.' });
    }

    if (otherDoctorConflict && !force) {
      return res.status(200).json({ warning: true, msg: 'You have another appointment at this time. Proceed?' });
    }

    const appointmentData = {
      doctorId,
      patientId,
      date,
      time,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    const docRef = await appointmentRef.add(appointmentData);
    res.status(201).json({ id: docRef.id, msg: 'Appointment booked successfully' });

  } catch (err) {
    console.error('Error booking appointment:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getAppointmentsForDoctor = async (req, res) => {
  try {
    const { doctorId } = req.query;

    if (!doctorId) {
      return res.status(400).json({ msg: 'doctorId is required' });
    }
    const appointmentsSnapshot = await db
      .collection('appointments')
      .where('doctorId', '==', doctorId)
      .get();

    const appointments = [];
    for (const apptDoc of appointmentsSnapshot.docs) {
      const appt = apptDoc.data();
      const patientId = appt.patientId;
      const patientDoc = await db.collection('patients').doc(patientId).get();
      const patient = patientDoc.exists ? patientDoc.data() : null;

      appointments.push({
        id: apptDoc.id,
        patientName: patient ? patient.name : 'Unknown',
        age: patient && patient.dob ? Math.floor((Date.now() - new Date(patient.dob).getTime()) / (1000 * 3600 * 24 * 365.25)) : null,
        gender: patient ? patient.gender : '',
        date: appt.date,
        time: appt.time,
        newDate: appt.newDate,
        newTime: appt.newTime,
        status: appt.status.toLowerCase(),
      });
    }

    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to fetch appointments' });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status, date, time } = req.body;
  try {
    const appointmentRef = db.collection('appointments').doc(id);
    const doc = await appointmentRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const updateData = { status };
    if (status === 'rescheduled') {
      if (!date || !time) {
        return res.status(400).json({ error: 'Date and time required for rescheduling' });
      }
      updateData.newDate = date;
      updateData.newTime = time;
    }

    await appointmentRef.update(updateData);

    return res.status(200).json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAppointmentsForPatient = async (req, res) => {
  try {
    const { patientId } = req.query;

    if (!patientId) {
      return res.status(400).json({ msg: 'Missing patientId in query params' });
    }

    const appointmentsSnapshot = await db.collection('appointments')
      .where('patientId', '==', patientId)
      .get();

    const appointments = [];
    for (const apptDoc of appointmentsSnapshot.docs) {
      const appt = apptDoc.data();
      const doctorId = appt.doctorId;
      const doctorDoc = await db.collection('doctors').doc(doctorId).get();
      const doctor = doctorDoc.exists ? doctorDoc.data() : null;

      appointments.push({
        id: apptDoc.id,
        doctorName: doctor ? doctor.name : 'Unknown',
        designation: doctor ? doctor.designation : '',
        date: appt.date,
        time: appt.time,
        status: appt.status.toLowerCase(),
        newDate: appt.newDate,
        newTime: appt.newTime,
      });
    }

    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to fetch patient appointments' });
  }
};


exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.status && !['confirmed', 'cancelled', 'pending', 'rescheduled'].includes(updateData.status.toLowerCase())) {
      return res.status(400).json({ msg: 'Invalid status value' });
    }

    await db.collection('appointments').doc(id).update(updateData);

    res.json({ msg: 'Appointment updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to update appointment' });
  }
};

