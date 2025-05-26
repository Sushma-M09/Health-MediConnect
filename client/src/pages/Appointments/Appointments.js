import React, { useState, useEffect } from 'react';
import {
  Table,
  Tag,
  Space,
  Typography,
  Modal,
  Button,
  message as antdMessage,
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  CheckOutlined,
  StopOutlined,
} from '@ant-design/icons';
import PatientLayout from '../PatientLayout/PatientLayout';
import './Appointments.css';
import { useUser } from '../UserContext';

const { Title, Link } = Typography;

const statusMap = {
  confirmed: { color: 'green', icon: <CheckCircleOutlined /> },
  pending: { color: 'gold', icon: <ClockCircleOutlined /> },
  cancelled: { color: 'red', icon: <CloseCircleOutlined /> },
  rescheduled: { color: 'blue', icon: <SyncOutlined spin /> },
};

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [selectedReschedule, setSelectedReschedule] = useState(null);
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const { user, setUser } = useUser();
  const patientId = user?.id;

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`http://localhost:5000/appointments-patient?patientId=${patientId}`);
        if (!response.ok) throw new Error('Failed to fetch appointments');
        const data = await response.json();
        console.table(data);
        setAppointments(data);
      } catch (error) {
        console.error(error);
        messageApi.error('Error loading appointments');
      }
    };

    fetchAppointments();
  }, [patientId]);

  function convertTo24Hour(time12h) {

  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (modifier === 'PM' && hours !== 12) {
    hours += 12;
  }
  if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }

  const hoursStr = hours.toString().padStart(2, '0');
  const minutesStr = minutes.toString().padStart(2, '0');

  return `${hoursStr}:${minutesStr}`;
}

 const isPastPending = (appt) => {
  if (appt.status.toLowerCase() !== 'pending') return false;

  const time24 = convertTo24Hour(appt.time);

  const dateTimeString = `${appt.date}T${time24}`;
  const apptDateTime = new Date(dateTimeString);

  if (isNaN(apptDateTime)) {
    console.warn('Invalid appointment date/time:', dateTimeString);
    return false;
  }

  return apptDateTime < new Date();
};



  const handleAccept = async () => {
    try {
      const apptId = selectedReschedule.id;
      const response = await fetch(`http://localhost:5000/appointments/${apptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'confirmed',
          date: selectedReschedule.newDate,
          time: selectedReschedule.newTime,
        }),
      });

      if (!response.ok) throw new Error('Failed to update appointment');

      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === apptId
            ? {
                ...appt,
                status: 'confirmed',
                date: selectedReschedule.newDate,
                time: selectedReschedule.newTime,
              }
            : appt
        )
      );
      setSelectedReschedule(null);
      messageApi.success('Appointment confirmed with updated schedule.');
    } catch (error) {
      console.error(error);
      messageApi.error('Failed to confirm appointment');
    }
  };

  const handleDecline = async () => {
    try {
      const apptId = selectedReschedule.id;
      const response = await fetch(`http://localhost:5000/appointments/${apptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'cancelled',
        }),
      });

      if (!response.ok) throw new Error('Failed to update appointment');

      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === apptId ? { ...appt, status: 'cancelled' } : appt
        )
      );
      setSelectedReschedule(null);
      messageApi.warning('Appointment has been declined.');
    } catch (error) {
      console.error(error);
      messageApi.error('Failed to decline appointment');
    }
  };

  const columns = [
    {
      title: 'Doctor',
      dataIndex: 'doctorName',
      key: 'doctorName',
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
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text) => (
        <Space>
          <CalendarOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      render: (text) => (
        <Space>
          <ClockCircleOutlined />
          {text}
        </Space>
      ),
    },

    {
  title: 'Status',
  dataIndex: 'status',
  key: 'status',
  render: (_, record) => {
    if (isPastPending(record)) {
      return (
        <Typography.Text type="secondary">
          No response from doctor — please try booking again
        </Typography.Text>
      );
    }

    const statusKey = record.status.toLowerCase();
    const { color, icon } = statusMap[statusKey] || {};
    return (
      <Space>
        <Tag color={color} icon={icon}>
          {record.status}
        </Tag>
        {statusKey === 'rescheduled' && (
          <Link onClick={() => setSelectedReschedule(record)}>
            Confirm Appointment?
          </Link>
        )}
      </Space>
    );
  },
}

  ];

  return (
    <PatientLayout>
      {contextHolder}
      <Title level={3} style={{ marginBottom: 20 }}>
        My Appointments
      </Title>
      <Table
        dataSource={appointments}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />

      <Modal
        open={!!selectedReschedule}
        onCancel={() => setSelectedReschedule(null)}
        footer={[
          <Button key="decline" danger onClick={handleDecline} icon={<StopOutlined />}>
            Decline
          </Button>,
          <Button key="accept" type="primary" onClick={handleAccept} icon={<CheckOutlined />}>
            Accept
          </Button>,
        ]}
        title="Rescheduled Appointment Details"
      >
        <p>
          <strong>Doctor:</strong> {selectedReschedule?.doctorName}
        </p>
        <p>
          <strong>New Date:</strong> {selectedReschedule?.newDate}
        </p>
        <p>
          <strong>New Time:</strong> {selectedReschedule?.newTime}
        </p>
        <p>Do you want to accept the updated appointment?</p>
      </Modal>
    </PatientLayout>
  );
}

export default Appointments;