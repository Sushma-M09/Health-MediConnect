const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const otpRoutes = require('./routes/otpRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use(authRoutes);
app.use(profileRoutes);
app.use(appointmentRoutes);
app.use(otpRoutes);

module.exports = app;
