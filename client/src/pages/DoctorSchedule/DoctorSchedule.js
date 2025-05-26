import React, { useState, useEffect } from 'react';
import { useUser } from '../UserContext';
import {
  Table,
  Calendar,
  Badge,
  Button,
  Row,
  Col,
  Typography,
  Card,
  Popover,
  message,
} from 'antd';
import { ManOutlined, WomanOutlined } from '@ant-design/icons';
import moment from 'moment';
import DoctorLayout from '../DoctorLayout/DoctorLayout';
import './DoctorSchedule.css';


const { Title } = Typography;

const ViewSchedule = () => {
  const [confirmedAppointments, setConfirmedAppointments] = useState([]);
  const [openPopoverId, setOpenPopoverId] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const { user, setUser } = useUser();
  const userId = user?.id;

 useEffect(() => {
  const fetchConfirmedAppointments = async () => {
    try {
      const doctorId = userId;
      if (!doctorId) throw new Error('Doctor ID not found');

      const response = await fetch(`http://localhost:5000/appointments?doctorId=${doctorId}`);
      if (!response.ok) throw new Error('Failed to fetch appointments');

      const data = await response.json();

      const confirmedOnly = data.filter(
        (appt) => appt.status?.toLowerCase() === 'confirmed'
      );
      setConfirmedAppointments(confirmedOnly);
    } catch (error) {
      console.error('Error fetching confirmed appointments:', error);
      messageApi.error('Failed to load appointments');
    }
  };

  fetchConfirmedAppointments();
}, []);

  const columns = [
    {
      title: 'Patient Name',
      dataIndex: 'patientName',
      key: 'patientName',
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender) =>
        gender === 'male' ? (
          <ManOutlined style={{ color: '#1890ff' }} />
        ) : (
          <WomanOutlined style={{ color: '#eb2f96' }} />
        ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('DD MMM YYYY'),
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
  ];

  const dateCellRender = (value) => {
    const formattedDate = value.format('YYYY-MM-DD');
    const appointmentsOnDate = confirmedAppointments.filter(
      (appointment) => appointment.date === formattedDate
    );

    return (
      <ul className="events" style={{ listStyle: 'none', padding: 0 }}>
        {appointmentsOnDate.map((item) => {
          const popoverContent = (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Button
                  size="small"
                  type="text"
                  onClick={() => setOpenPopoverId(null)}
                  style={{ lineHeight: 1 }}
                >
                  ✕
                </Button>
              </div>
              <p><strong>Name:</strong> {item.patientName}</p>
              <p><strong>Age:</strong> {item.age}</p>
              <p><strong>Gender:</strong> {item.gender}</p>
              <p><strong>Time:</strong> {item.time}</p>
            </div>
          );

          return (
            <li key={item.id} style={{ marginBottom: 4 }}>
              <Badge
                color="green"
                text={
                  <span
                    style={{ cursor: 'pointer', color: '#1890ff' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenPopoverId(item.id);
                    }}
                  >
                    {item.time}
                  </span>
                }
              />
              <Popover
                content={popoverContent}
                open={openPopoverId === item.id}
                placement="top"
              >
                <span /> {/* dummy child required by Popover */}
              </Popover>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <DoctorLayout>
      {contextHolder}
      <Title level={3} style={{ marginBottom: 20 }}>View Schedule</Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card title="Confirmed Appointments" bordered={false}>
            <Table
              dataSource={confirmedAppointments}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Calendar Overview" bordered={false}>
            <div style={{ maxHeight: 500, overflowY: 'auto' }}>
              <Calendar
                fullscreen={false}
                dateCellRender={dateCellRender}
                style={{ borderRadius: 10 }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </DoctorLayout>
  );
};

export default ViewSchedule;