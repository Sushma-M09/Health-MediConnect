import React, { useState , useEffect  } from 'react';
import { Table, Button, Modal, Tooltip, Typography, Space, Card, message } from 'antd';
import { InfoCircleOutlined, CalendarOutlined, UserOutlined, CheckCircleOutlined } from '@ant-design/icons';
import PatientLayout from '../PatientLayout/PatientLayout';
import './PatientDashboard.css';
 import { useUser } from '../UserContext';

import axios from 'axios';
const { Text, Link } = Typography;

function BookAppointment() {
  const [openDoctor, setOpenDoctor] = useState(null);
  const [scheduleVisible, setScheduleVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookedDoctors, setBookedDoctors] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useUser();
  const userId = user?.id;
  const [warnConflict, setWarnConflict] = useState(false);
const [pendingBookingData, setPendingBookingData] = useState(null);



  const currentPatientId = userId;

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get('http://localhost:5000/doctors');
        setDoctors(res.data);
      } catch (err) {
        message.error('Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const now = new Date();

  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      key: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };
  });

  const timeStrings = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '01:00 PM', '01:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM',
    '07:00 PM', '07:30 PM' , '08:30 PM','09:00 PM','09:38 PM', '10:00 PM', '10:30 PM'
  ];

  const parseTime = (timeStr, baseDate) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    const result = new Date(baseDate);
    result.setHours(hours, minutes, 0, 0);
    return result;
  };

  const getAvailableTimes = (selectedDate) => {
    const selected = new Date(selectedDate);
    return timeStrings.filter((timeStr) => {
      const time = parseTime(timeStr, selected);
      return selected.toDateString() !== now.toDateString() || time > now;
    });
  };

  const handleBook = (doctorId) => {
    const doc = doctors.find(d => d.id === doctorId);
    setSelectedDoctor(doc);
    setScheduleVisible(true);
  };

 const handleConfirmBooking = async () => {
  try {
    const bookingPayload = {
      doctorId: selectedDoctor.id,
      patientId: currentPatientId,
      date: selectedDate.key,
      time: selectedTime,
    };

    const res = await axios.post('http://localhost:5000/book-appointment', bookingPayload);

    if (res.status === 201) {
      message.success(`Appointment confirmed with ${selectedDoctor.name} on ${selectedDate.label} at ${selectedTime}`);
      setBookedDoctors((prev) => [...prev, selectedDoctor.id]);
      resetBookingState();
    } else if (res.data?.warning) {
      setWarnConflict(true);
      setPendingBookingData(bookingPayload);
      setConfirmVisible(false);
    }
  } catch (error) {
    if (error.response?.status === 409) {
      message.error(error.response.data.msg);
    } else {
      message.error(error.message || 'Failed to book appointment');
    }
    resetBookingState();
  }
};

const confirmAfterWarning = async () => {
  try {
    const res = await axios.post('http://localhost:5000/book-appointment', {
      ...pendingBookingData,
      force: true,
    });

    if (res.status === 201) {
      const doc = doctors.find(d => d.id === pendingBookingData.doctorId);
      message.success(`Appointment confirmed with ${doc.name} on ${selectedDate.label} at ${selectedTime}`);
      setBookedDoctors((prev) => [...prev, doc.id]);
    } else {
      message.error(res.data?.msg || 'Failed to confirm booking');
    }
  } catch (error) {
    message.error('Failed to book appointment');
  } finally {
    resetBookingState();
  }
};


const resetBookingState = () => {
  setSelectedDoctor(null);
  setSelectedDate(null);
  setSelectedTime(null);
  setConfirmVisible(false);
  setWarnConflict(false);
  setPendingBookingData(null);
};


  const columns = [
    {
      title: 'Doctor Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
    },
    {
      title: 'About',
      key: 'about',
      render: (_, doctor) => (
        <Link onClick={() => setOpenDoctor(doctor)}>
          <InfoCircleOutlined /> View
        </Link>
      ),
    },
    {
      title: 'Fee (₹)',
      dataIndex: 'fee',
      key: 'fee',
      render: (fee) => <Space>{fee}</Space>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, doctor) => (
        bookedDoctors.includes(doctor.id) ? (
          <Text style={{ color: 'green', fontWeight: 'bold' }}>
            <CheckCircleOutlined style={{ marginRight: 6 }} />
            Appointment Booked
          </Text>
        ) : (
          <Tooltip title="Book an appointment">
            <Button
              type="primary"
              icon={<CalendarOutlined />}
              onClick={() => handleBook(doctor.id)}
            >
              Book
            </Button>
          </Tooltip>
        )
      ),
    },
  ];

  return (
    <PatientLayout>
      <div className="patient-dashboard-container">
        <Card title="Available Doctors" className="patient-card">
          <Table
            dataSource={doctors}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            loading={loading}
          />
        </Card>
      </div>

      <Modal
        open={!!openDoctor}
        title={`About  ${openDoctor?.name}`}
        onCancel={() => setOpenDoctor(null)}
        footer={null}
      >
        <p><strong>Experience:</strong> {openDoctor?.experience}</p>
        <p><strong>About:</strong> {openDoctor?.about}</p>
      </Modal>

      <Modal
        open={scheduleVisible}
        title={`Schedule Appointment with  ${selectedDoctor?.name}`}
        onCancel={() => {
          setScheduleVisible(false);
          setSelectedDate(null);
          setSelectedTime(null);
        }}
        onOk={() => {
          setScheduleVisible(false);
          setConfirmVisible(true);
        }}
        okButtonProps={{ disabled: !(selectedDate && selectedTime) }}
      >
        <div>
          <strong>Select Date:</strong>
          <div style={{ marginTop: 8, marginBottom: 16 }}>
            {dates.map(date => (
              <Button
                key={date.key}
                type={selectedDate?.key === date.key ? 'primary' : 'default'}
                onClick={() => setSelectedDate(date)}
                style={{ marginRight: 8, marginBottom: 8 }}
              >
                {date.label}
              </Button>
            ))}
          </div>

          <strong>Select Time:</strong>
          <div style={{ marginTop: 8 }}>
            {selectedDate && getAvailableTimes(selectedDate.key).map((time) => (
              <Button
                key={time}
                type={selectedTime === time ? 'primary' : 'default'}
                onClick={() => setSelectedTime(time)}
                style={{ marginRight: 8, marginBottom: 8 }}
              >
                {time}
              </Button>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        open={confirmVisible}
        title="Confirm Appointment"
        onCancel={() => setConfirmVisible(false)}
        onOk={handleConfirmBooking}
        okText="Confirm"
      >
        <p>Do you want to book an appointment with <strong>{selectedDoctor?.name}</strong>?</p>
        <p>Date: <strong>{selectedDate?.label}</strong></p>
        <p>Time: <strong>{selectedTime}</strong></p>
      </Modal>
      <Modal
  open={warnConflict}
  title="Possible Conflict"
  onCancel={() => setWarnConflict(false)}
  onOk={confirmAfterWarning}
  okText="Proceed Anyway"
  cancelText="Cancel"
>
  <p>You already have an appointment at this time with another doctor.</p>
  <p>Are you sure you want to proceed with this new booking?</p>
</Modal>

    </PatientLayout>
  );
}

export default BookAppointment;