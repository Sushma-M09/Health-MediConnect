import React from 'react';
import { Form, Input, Button, Card, message as antdMessage } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PatientLayout from '../PatientLayout/PatientLayout';
import './ChangePassword.css';
import axios from 'axios';
import { useUser } from '../UserContext';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [messageApi, contextHolder] = antdMessage.useMessage();

  const onFinish = async (values) => {
    const { currentPassword, newPassword } = values;
    const role = user?.role;
    const userId = user?.id;

    if (!role || !userId) {
      return messageApi.error('User information missing. Please log in again.');
    }

    try {
      await axios.put(`http://localhost:5000/change-password/${role}/${userId}`, {
        currentPassword,
        newPassword,
      });

      messageApi.success('Password changed successfully!');
      setTimeout(() => navigate('/patient-dashboard'), 1000);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Something went wrong. Please try again.';
      messageApi.error(errorMsg);
    }
  };

  return (
    <PatientLayout>
      {contextHolder}
      <Card title="Change Password" style={{ maxWidth: 500, margin: 'auto' }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[{ required: true, message: 'Please enter your current password' }]}
          >
            <Input.Password
              placeholder="Enter current password"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: 'Please enter your new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value) return Promise.resolve();

                  const checks = [
                    { label: 'At least 8 characters', valid: value.length >= 8 },
                    { label: 'At least one uppercase letter', valid: /[A-Z]/.test(value) },
                    { label: 'At least one lowercase letter', valid: /[a-z]/.test(value) },
                    { label: 'At least one number', valid: /[0-9]/.test(value) },
                    { label: 'At least one special character (@$!%*?#&)', valid: /[@$!%*?#&]/.test(value) },
                  ];

                  const failed = checks.filter((check) => !check.valid);
                  if (failed.length === 0) return Promise.resolve();

                  return Promise.reject(
                    <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                      {failed.map((f, i) => (
                        <li key={i} style={{ color: 'black' }}>{f.label}</li>
                      ))}
                    </ul>
                  );
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Enter new password"
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
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </PatientLayout>
  );
};

export default ChangePassword;