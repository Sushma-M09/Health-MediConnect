import React, { useState, useEffect } from 'react';
import {
  Card,
  Avatar,
  Typography,
  Button,
  Form,
  Input,
  DatePicker,
  Select,
  Space,
  InputNumber,
  message,
  Spin,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  EditOutlined,
  SaveOutlined,
  MedicineBoxOutlined,
  IdcardOutlined,
  FileTextOutlined,
  DollarOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import profileImg from '../../assests/doctor.jpg';
import DoctorLayout from '../DoctorLayout/DoctorLayout';
import { useUser } from '../UserContext';
import axios from 'axios';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const DoctorProfile = () => {
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(true);

  const userId = user?.id;
  const role = user?.role;

  const fetchProfile = async () => {
    if (!userId || !role) return;

    try {
      const res = await axios.get(`http://localhost:5000/profile/${role}/${userId}`);
      setUser(res.data);
      setLoading(false);
    } catch (err) {
      message.error('Failed to load profile');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (editMode && user) {
      form.setFieldsValue({
        ...user,
        birthDate: moment(user.birthDate),
      });
    }
  }, [editMode, user]);

  const toggleEdit = () => {
    setEditMode(!editMode);
  };

  const onFinish = async (values) => {
    try {
      const updated = {
        ...values,
        birthDate: values.birthDate.format('YYYY-MM-DD'),
      };

      await axios.put(`http://localhost:5000/profile/${role}/${userId}`, updated);

      const updatedUser = {
        ...user,
        ...updated,
      };

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setEditMode(false);
      message.success('Profile updated successfully');
    } catch (err) {
      message.error('Failed to update profile');
      console.error(err);
    }
  };

  if (loading || !user) {
    return (
      <DoctorLayout>
        <div style={{ textAlign: 'center', marginTop: 100 }}>
          <Spin size="large" />
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <Card
        title="My Profile"
        extra={
          <Button
            icon={editMode ? <SaveOutlined /> : <EditOutlined />}
            type="primary"
            onClick={editMode ? form.submit : toggleEdit}
          >
            {editMode ? 'Save' : 'Edit'}
          </Button>
        }
        style={{ maxWidth: 700, margin: 'auto' }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Avatar src={profileImg} size={100} />
            <Title level={4} style={{ marginTop: 10 }}>{user.name}</Title>
            <Text type="secondary">Doctor</Text>
          </div>

          {!editMode ? (
            <div style={{ fontSize: 16 }}>
              <p><MailOutlined /> <Text strong>Email:</Text> {user.email}</p>
              <p><PhoneOutlined /> <Text strong>Phone:</Text> {user.phone}</p>
              <p><HomeOutlined /> <Text strong>Address:</Text> {user.address}</p>
              <p><IdcardOutlined /> <Text strong>Designation:</Text> {user.designation}</p>
              <p><MedicineBoxOutlined /> <Text strong>Degree:</Text> {user.degree}</p>
              <p><CalendarOutlined /> <Text strong>Experience:</Text> {user.experience} years</p>
              <p><FileTextOutlined /> <Text strong>About:</Text> {user.about}</p>
              <p><DollarOutlined /> <Text strong>Appointment Fees:</Text> ₹{user.fee}</p>
              <p><UserOutlined /> <Text strong>Birth Date:</Text> {moment(user.birthDate).format('DD MMMM YYYY')}</p>
            </div>
          ) : (
            <Form layout="vertical" form={form} onFinish={onFinish}>
              <Form.Item name="name" label="Full Name" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item
  name="email"
  label="Email"
  rules={[
    { required: true, message: 'Email is required' },
    {
      pattern: /^[a-zA-Z0-9]+(?:[._-][a-zA-Z0-9]+)*@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/,
      message:
        'Enter a valid email: start and end with alphanumerics, no repeated special characters',
    },
  ]}
>
  <Input />
</Form.Item>
              <Form.Item name="phone" label="Phone" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="address" label="Address" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item label="Designation">
  <Text>{user.designation}</Text>
</Form.Item>
              <Form.Item name="degree" label="Degree" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="experience" label="Experience" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
              <Form.Item name="about" label="About" rules={[{ required: true }]}><TextArea rows={4} /></Form.Item>
             <Form.Item
  name="fee"
  label="Appointment Fees"
  rules={[{ required: true }]}
>
  <InputNumber min={0} style={{ width: '100%' }} />
</Form.Item>

              <Form.Item name="birthDate" label="Birth Date" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
            </Form>
          )}
        </Space>
      </Card>
    </DoctorLayout>
  );
};

export default DoctorProfile;
