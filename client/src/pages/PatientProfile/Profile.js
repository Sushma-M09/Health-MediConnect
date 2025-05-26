import React, { useState, useEffect } from 'react';
 import { useUser } from '../UserContext';
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
  message,
  Spin,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  ManOutlined,
  WomanOutlined,
  EditOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import profileImg from '../../assests/patient.jpg';
import PatientLayout from '../PatientLayout/PatientLayout';
import axios from 'axios';

const { Title, Text } = Typography;
const { Option } = Select;

const Profile = () => {
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
const { user, setUser } = useUser();
  const [loading, setLoading] = useState(true);
const userId = user?.id;
const role = user?.role;
//console.log("Parameters of the Profile API", userId , role);

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
    //console.log("Loaded user from localStorage:", userId, role);
    fetchProfile();
  }, []);

  const toggleEdit = () => {
    setEditMode(!editMode);
    if (!editMode && user) {
      form.setFieldsValue({
        ...user,
        birthDate: moment(user.birthDate),
      });
    }
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
      <PatientLayout>
        <div style={{ textAlign: 'center', marginTop: 100 }}>
          <Spin size="large" />
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
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
            <Text type="secondary">{role.charAt(0).toUpperCase() + role.slice(1)}</Text>
          </div>

          {!editMode ? (
            <div style={{ fontSize: 16 }}>
              <p><MailOutlined /> <Text strong>Email:</Text> {user.email}</p>
              <p><PhoneOutlined /> <Text strong>Phone:</Text> {user.phone}</p>
              <p><HomeOutlined /> <Text strong>Address:</Text> {user.address}</p>
              <p>
                {user.gender === 'male' ? <ManOutlined /> : <WomanOutlined />}{" "}
                <Text strong>Gender:</Text> {user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
              </p>
              <p><UserOutlined /> <Text strong>Birth Date:</Text> {moment(user.birthDate).format('DD MMMM YYYY')}</p>
            </div>
          ) : (
            <Form layout="vertical" form={form} onFinish={onFinish}>
              <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
             <Form.Item
  name="email"
  label="Email"
  rules={[
    { required: true, message: 'Please enter your email' },
    {
      pattern: /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/,
      message: 'Please enter a valid email address',
    },
  ]}
>
  <Input type="email" />
</Form.Item>
              <Form.Item name="phone" label="Contact Number" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="address" label="Address" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
                <Select>
                  <Option value="male">Male</Option>
                  <Option value="female">Female</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
              <Form.Item name="birthDate" label="Birth Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Form>
          )}
        </Space>
      </Card>
    </PatientLayout>
  );
};

export default Profile;
