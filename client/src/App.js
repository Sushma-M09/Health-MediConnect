import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import PatientDashboard from './pages/PatientDashboard/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard/DoctorDashboard';
import Profile from './pages/PatientProfile/Profile';
import 'antd/dist/reset.css';
import ChangePassword from './pages/ChangePassword/ChangePassword';
import Appointments from './pages/Appointments/Appointments';
import DoctorProfile from './pages/DoctorProfile/DoctorProfile';
import ViewSchedule from './pages/DoctorSchedule/DoctorSchedule';
import ChangePassworddoctor from './pages/DoctorChangePassword/DoctorChangePassword';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';

function App() {
  return (
    <Router>
    
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
    
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/patient-dashboard/profile" element={<Profile />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/patient-dashboard/change-password" element={<ChangePassword />} />
        <Route path="/patient-dashboard/appointments" element={<Appointments/>}/>
        <Route path="/doctor-dashboard/profile" element={<DoctorProfile/>}/>
        <Route path="/doctor-dashboard/change-password" element={<ChangePassworddoctor />} />
        <Route path="/doctor-dashboard/schedule" element={<ViewSchedule/>} />
       <Route path="/forgot-password" element={<ForgotPassword />} />
       
      </Routes>
    </Router>
  );
}

export default App;