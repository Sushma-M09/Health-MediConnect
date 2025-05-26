import React, { useState, useEffect } from 'react';
import { FilterOutlined } from '@ant-design/icons';

import {
  Card,
  Table,
  Button,
  Tag,
  Modal,
  DatePicker,
  TimePicker,
  Space,
  message as antdMessage,
  Typography,
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ManOutlined,
  WomanOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import DoctorLayout from '../DoctorLayout/DoctorLayout';
import './DoctorDashboard.css';
import { useUser } from '../UserContext';
import { Select } from 'antd';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isSameOrAfter);

const { Option } = Select;

const { Text } = Typography;
const { confirm } = Modal;

const DoctorDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState(null);
  const [rescheduleTime, setRescheduleTime] = useState(null);
  const [welcomeModalVisible, setWelcomeModalVisible] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');


  const [messageApi, contextHolder] = antdMessage.useMessage();
  const { user, setUser } = useUser();

  const filteredData = statusFilter === 'all' 
  ? data 
  : data.filter((item) => item.status === statusFilter);


  const calculateAge = (dob) => {
    if (!dob) return null;
    return dayjs().diff(dayjs(dob), 'year');
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const doctorId = user?.id;
        if (!doctorId) throw new Error('Doctor ID not found');

        const res = await fetch(`http://localhost:5000/appointments?doctorId=${doctorId}`);
        if (!res.ok) throw new Error('Failed to fetch appointments');

        const appointments = await res.json();
        //console.log("appointmentssssssssssss",appointments);

      const enriched = appointments.map((appt) => {
  const status = appt.status.toLowerCase();

  const appointmentDateTime = dayjs(`${appt.date} ${appt.time}`, 'YYYY-MM-DD hh:mm A');

  const isMissed = status === 'pending' && appointmentDateTime.isBefore(dayjs());

  return {
    ...appt,
    status: isMissed ? 'missed' : status,
  };
});



        setData(enriched);
      } catch (error) {
        messageApi.error('Error loading appointments');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
    setWelcomeModalVisible(true);
  }, [messageApi]);

  const today = dayjs().format('YYYY-MM-DD');
  const now = dayjs();
const todaysAppointments = data.filter((app) => {
  if (app.date !== today) return false;

  const appointmentTime = dayjs(`${app.date} ${app.time}`, 'YYYY-MM-DD hh:mm A');
  return (
    appointmentTime.isSameOrAfter(now, 'minute') &&
    (app.status === 'pending' || app.status === 'confirmed')
  );
});

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      //console.log("Response of the update status",res);

      if (!res.ok) throw new Error('Status update failed');
      const updated = data.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      );
      //console.log("Updated data",updated);
      setData(updated);
      messageApi.success(`Appointment marked as ${newStatus}`);
    } catch (err) {
      console.error(err);
      messageApi.error('Failed to update status');
    }
  };

  const showConfirmModal = (record, action) => {
  if (action === 'confirm') {
    const hasConflict = data.some(
      (appt) =>
        appt.id !== record.id &&
        appt.date === record.date &&
        appt.time === record.time &&
        appt.status === 'confirmed'
    );

    if (hasConflict) {
      confirm({
        title: `Conflict Warning!`,
        icon: <ExclamationCircleOutlined />,
        content: `You already have a confirmed appointment at ${record.time} on ${record.date}. Are you sure you want to confirm this one as well?`,
        okText: 'Proceed Anyway',
        cancelText: 'Cancel',
        centered: true,
        onOk() {
          updateStatus(record.id, 'confirmed');
        },
        onCancel() {
        },
      });
      return;
    }
  }
  confirm({
    title: `Are you sure you want to ${action} this appointment?`,
    icon: <ExclamationCircleOutlined />,
    okText: 'Yes',
    okType: action === 'cancel' ? 'danger' : 'primary',
    cancelText: 'No',
    centered: true,
    onOk() {
      updateStatus(record.id, action === 'confirm' ? 'confirmed' : 'cancelled');
    },
    onCancel() {
      //console.log(`Cancelled ${action} action`);
    },
  });
};


  const handleReschedule = (record) => {
    setSelectedAppointment(record);
    setRescheduleDate(null);
    setRescheduleTime(null);
    setRescheduleModalVisible(true);
  };
const performReschedule = async (dateStr, timeStr) => {
  try {
    const res = await fetch(`http://localhost:5000/appointments/${selectedAppointment.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
  status: 'rescheduled',
  date: dateStr,
  time: timeStr,
  newDate: dateStr,
  newTime: timeStr,
}),

    });
    //console.log("performReschedule response",res);

    if (!res.ok) throw new Error('Reschedule failed');

    const updated = data.map((item) =>
      item.id === selectedAppointment.id
        ? {
            ...item,
            status: 'rescheduled',
            newDate: dateStr,
            newTime: timeStr,
          }
        : item
    );
//console.log("performReschedule updated",updated);
    setData(updated);
    messageApi.success('Appointment rescheduled.');
    setRescheduleModalVisible(false);
  } catch (err) {
    console.error(err);
    messageApi.error('Failed to reschedule appointment.');
  }
};

  const submitReschedule = async () => {
  if (!rescheduleDate || !rescheduleTime) {
    messageApi.warning('Please select both date and time.');
    return;
  }

  const dateStr = rescheduleDate.format('YYYY-MM-DD');
  const timeStr = rescheduleTime.format('hh:mm A');

  const hasConfirmedConflict = data.some(
    (appt) =>
      appt.id !== selectedAppointment.id &&
      appt.status === 'confirmed' &&
      appt.date === dateStr &&
      appt.time === timeStr
  );

  const hasRescheduledConflict = data.some(
    (appt) =>
      appt.id !== selectedAppointment.id &&
      appt.status === 'rescheduled' &&
      appt.newDate === dateStr &&
      appt.newTime === timeStr
  );

  const showConflictModal = (message, onProceed) => {
    confirm({
      title: 'Conflict Warning!',
      icon: <ExclamationCircleOutlined />,
      content: message,
      okText: 'Proceed Anyway',
      cancelText: 'Cancel',
      centered: true,
      onOk: onProceed,
      onCancel: () => console.log('Reschedule cancelled due to conflict.'),
    });
  };

  if (hasConfirmedConflict) {
    showConflictModal(
      `You already have a confirmed appointment at ${timeStr} on ${dateStr}. Do you still want to reschedule this one to the same time?`,
      () => performReschedule(dateStr, timeStr)
    );
    return;
  }

  if (hasRescheduledConflict) {
    showConflictModal(
      `You have already rescheduled another appointment to ${timeStr} on ${dateStr}. Do you still want to proceed with this reschedule?`,
      () => performReschedule(dateStr, timeStr)
    );
    return;
  }

  performReschedule(dateStr, timeStr);
};


  const columns = [
    {
      title: 'Patient Name',
      dataIndex: 'patientName',
      key: 'patientName',
      render: (text) => (
        <div style={{ whiteSpace: 'normal' }}>
          <Space>
            <UserOutlined />
            <span>{text}</span>
          </Space>
        </div>
      ),
      width: 240,
      ellipsis: false,
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      render: (age) => <Text>{age !== null ? `${age}` : 'N/A'}</Text>,
      width: 70,
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender) =>
        gender === 'male' ? (
          <Tag color="blue" icon={<ManOutlined />}>
            Male
          </Tag>
        ) : (
          <Tag color="magenta" icon={<WomanOutlined />}>
            Female
          </Tag>
        ),
      width: 90,
    },
   {
  title: 'Date',
  dataIndex: 'date',
  key: 'date',
  render: (_, record) => {
    const displayDate = record.status === 'rescheduled' ? record.newDate : record.date;
    return (
      <Space>
        <CalendarOutlined />
        <span style={{ whiteSpace: 'nowrap' }}>{displayDate}</span>
      </Space>
    );
  },
  width: 140,
},
{
  title: 'Time',
  dataIndex: 'time',
  key: 'time',
  render: (_, record) => {
    const displayTime = record.status === 'rescheduled' ? record.newTime : record.time;
    return (
      <Space>
        <ClockCircleOutlined />
        <span style={{ whiteSpace: 'nowrap' }}>{displayTime}</span>
      </Space>
    );
  },
  width: 120,
},

    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'orange';
        if (status === 'confirmed') color = 'green';
        if (status === 'cancelled') color = 'red';
        if (status === 'rescheduled') color = 'blue';
        if (status === 'missed') color = 'gray';


        return (
          <Tag style={{ whiteSpace: 'nowrap' }} color={color}>
            {status.toUpperCase()}
          </Tag>
        );
      },
      width: 110,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 320,
      render: (_, record) => {
          if (record.status === 'missed') {
      return <Text type="secondary">No response — Missed</Text>;
    }
        if (record.status === 'pending') {
          const buttonStyle = {
            height: '28px',
            padding: '0 8px',
            fontSize: '12px',
          };

          return (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap' }}>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                style={buttonStyle}
                onClick={() => showConfirmModal(record, 'confirm')}
              >
                Confirm
              </Button>

              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                style={buttonStyle}
                onClick={() => showConfirmModal(record, 'cancel')}
              >
                Cancel
              </Button>

              <Button
                size="small"
                icon={<EditOutlined />}
                style={buttonStyle}
                onClick={() => handleReschedule(record)}
              >
                Reschedule
              </Button>
            </div>
          );
        }
        return null;
      },
    },
  ];

  return (
    <DoctorLayout>
      {contextHolder}
      <div className="doctor-dashboard-container">
       <Card 
 title={
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span>My Appointments</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontWeight: 500, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
  <FilterOutlined />
  Status
</span>
      <Select
        value={statusFilter}
        onChange={setStatusFilter}
        style={{ width: 160 }}
      >
        <Option value="all">All</Option>
        <Option value="pending">Pending</Option>
        <Option value="confirmed">Confirmed</Option>
        <Option value="rescheduled">Rescheduled</Option>
        <Option value="cancelled">Cancelled</Option>
        <Option value="missed">Missed</Option>

      </Select>
    </div>
  </div>
}

  className="doctor-card"
>
  <Table
    dataSource={filteredData}
    columns={columns}
    rowKey="id"
    pagination={{ pageSize: 5 }}
    loading={loading}
  />
</Card>


        <Modal
          title="Reschedule Appointment"
          open={rescheduleModalVisible}
          onOk={submitReschedule}
          onCancel={() => setRescheduleModalVisible(false)}
          okText="Reschedule"
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <DatePicker
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
              onChange={(date) => setRescheduleDate(date)}
              value={rescheduleDate}
            />

           <TimePicker
  style={{ width: '100%' }}
  format="hh:mm A"
  value={rescheduleTime}
  disabledHours={() => {
    if (!rescheduleDate || !rescheduleDate.isSame(dayjs(), 'day')) return [];
    const hours = [];
    for (let i = 0; i < dayjs().hour(); i++) hours.push(i);
    return hours;
  }}
  disabledMinutes={(selectedHour) => {
    if (!rescheduleDate || !rescheduleDate.isSame(dayjs(), 'day')) return [];
    if (selectedHour === dayjs().hour()) {
      const minutes = [];
      for (let i = 0; i < dayjs().minute(); i++) minutes.push(i);
      return minutes;
    }
    return [];
  }}
  onChange={(time) => setRescheduleTime(time)}
/>

          </Space>
        </Modal>

        <Modal
          title="Appointments for the Day!"
          open={welcomeModalVisible}
          footer={null}
          onCancel={() => setWelcomeModalVisible(false)}
        >
          <p>
            <CalendarOutlined /> <strong>{dayjs().format('dddd, MMMM D, YYYY')}</strong>
          </p>
          <p>
            <UserOutlined /> <strong>Total Appointments:</strong>{' '}
            {todaysAppointments.length}
          </p>
          <div style={{ marginTop: 16 }}>
            {todaysAppointments.length > 0 ? (
              todaysAppointments.map((app) => (
                <Card key={app.id} size="small" style={{ marginBottom: 12 }}>
                  <Space direction="vertical">
                    <Text>
                      <UserOutlined /> {app.patientName}
                    </Text>
                    <Text>
                      <ClockCircleOutlined /> {app.time}
                    </Text>
                    <Text>
                      <ClockCircleOutlined /> {app.status}
                    </Text>
                  </Space>
                </Card>
              ))
            ) : (
              <Text type="secondary">No appointments for today.</Text>
            )}
          </div>
        </Modal>
      </div>
    </DoctorLayout>
  );
};

export default DoctorDashboard;
