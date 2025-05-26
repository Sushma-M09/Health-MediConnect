const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

router.get('/doctors', appointmentController.getDoctors);
router.post('/book-appointment', appointmentController.bookAppointment);
router.get('/appointments', appointmentController.getAppointmentsForDoctor);
router.get('/appointments-patient', appointmentController.getAppointmentsForPatient);
router.patch('/appointments/:id/status', appointmentController.updateAppointmentStatus);
router.patch('/appointments/:id', appointmentController.updateAppointment);

module.exports = router;
