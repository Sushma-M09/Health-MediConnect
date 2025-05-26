import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import DoctorLayout from '../DoctorLayout/DoctorLayout';
import './DoctorChangePassword.css';
import axios from 'axios';
import { useUser } from '../UserContext';

const DoctorChangePassworddoctor = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const onFinish = async (values) => {
    const { currentPassword, newPassword } = values;
    const role = user?.role;
    const userId = user?.id;

    if (!role || !userId) {
      return message.error('User information missing. Please log in again.');
    }

    try {
      await axios.put(`http://localhost:5000/change-password/${role}/${userId}`, {
        currentPassword,
        newPassword,
      });

      message.success('Password changed successfully!');
      setTimeout(() => navigate('/doctor-dashboard'), 1000);
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.msg || 'Something went wrong. Please try again.';
      message.error(errorMsg);
    }
  };

  return (
    <DoctorLayout>
      <Card title="Change Password" style={{ maxWidth: 500, margin: 'auto' }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[{ required: true, message: 'Please enter your current password' }]}
          >
            <Input.Password
              placeholder="Enter current password"
              iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item
  name="confirmPassword"
  label="Re-enter New Password"
  dependencies={['newPassword']}
  rules={[
    { required: true, message: 'Please confirm your new password' },
    ({ getFieldValue }) => ({
      validator(_, value) {
        const newPassword = getFieldValue('newPassword');

        if (!value || value === newPassword) {
          return Promise.resolve();
        }

        return Promise.reject(
          <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
            <li style={{ color: 'black' }}>Passwords must match</li>
          </ul>
        );
      },
    }),
  ]}
>
  <Input.Password
    placeholder="Re-enter new password"
    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
  />
</Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Re-enter New Password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Re-enter new password"
              iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </DoctorLayout>
  );
};

export default DoctorChangePassworddoctor;