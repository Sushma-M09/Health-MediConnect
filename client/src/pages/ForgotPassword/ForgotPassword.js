import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  message as antdMessage,
  Select,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';
import clinicBg from '../../assests/clinic-bg.jpg';

const { Title } = Typography;
const { Option } = Select;

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const navigate = useNavigate();

const handleEmailSubmit = async (values) => {
  setEmail(values.email);
  setRole(values.role);
  setLoading(true);

  try {
    const res = await fetch('http://localhost:5000/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: values.email, role: values.role }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || 'Failed to send OTP');

    messageApi.success('OTP sent to your email.');
    setStep(2);
  } catch (err) {
    messageApi.error(err.message);
  } finally {
    setLoading(false);
  }
};

  const handleOtpSubmit = async (values) => {
    try {
      const res = await fetch('http://localhost:5000/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: values.otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'OTP verification failed');
      messageApi.success('OTP verified. You may now reset your password.');
      setOtp(values.otp);
      setStep(3);
    } catch (err) {
      messageApi.error(err.message);
    }
  };

  const handlePasswordReset = async (values) => {
    try {
      const res = await fetch('http://localhost:5000/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword: values.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Password reset failed');
      messageApi.success('Password reset successfully!');
      navigate('/');
    } catch (err) {
      messageApi.error(err.message);
    }
  };

  const renderForm = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Title level={3} className="forgot-title">Forgot Password</Title>
            <Form onFinish={handleEmailSubmit} layout="vertical">
              <Form.Item
                name="email"
                label="Registered Email"
                rules={[{ required: true, type: 'email' }]}
              >
                <Input placeholder="Enter your email" />
              </Form.Item>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: 'Please select your role' }]}
              >
                <Select placeholder="Select your role">
                  <Option value="patient">Patient</Option>
                  <Option value="doctor">Doctor</Option>
                </Select>
              </Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Send OTP
              </Button>
            </Form>
          </>
        );

      case 2:
        return (
          <>
            <Title level={3} style={{ marginTop: 0 }}>Enter OTP</Title>
            <Form onFinish={handleOtpSubmit} layout="vertical">
              <Form.Item
                name="otp"
                label="OTP"
                rules={[{ required: true, message: 'Please enter the OTP' }]}
              >
                <Input placeholder="Enter OTP" />
              </Form.Item>
              <Button type="primary" htmlType="submit" block>
                Verify OTP
              </Button>
            </Form>
          </>
        );

      case 3:
        return (
          <>
            <Title level={3} style={{ marginTop: 0 }}>Reset Password</Title>
            <Form onFinish={handlePasswordReset} layout="vertical">
              <Form.Item
                name="password"
                label="New Password"
                rules={[
                  { required: true, message: 'Please input your new password' },
                  { min: 8, message: 'Password must be at least 8 characters' },
                  {
                    pattern: /[A-Z]/,
                    message: 'Password must include at least one uppercase letter',
                  },
                  {
                    pattern: /[a-z]/,
                    message: 'Password must include at least one lowercase letter',
                  },
                  {
                    pattern: /[0-9]/,
                    message: 'Password must include at least one number',
                  },
                  {
                    pattern: /[!@#$%^&*(),.?":{}|<>]/,
                    message: 'Password must include at least one special character',
                  },
                ]}
                hasFeedback
              >
                <Input.Password placeholder="Enter new password" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                dependencies={['password']}
                hasFeedback
                rules={[
                  { required: true, message: 'Please confirm your password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm password" />
              </Form.Item>

              <Button type="primary" htmlType="submit" block>
                Reset Password
              </Button>
            </Form>
          </>
        );

      default:
        return null;
    }
  };

 return (
<div
  className="forgot-container"
  style={{
    backgroundImage: `url(${clinicBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }}
>
  {contextHolder}
  <Card className="forgot-card">
    <Button
      type="text"
      icon={<ArrowLeftOutlined style={{ fontSize: '18px' }} />}
      onClick={() => navigate('/')}
      className="back-button"
    />
    {renderForm()}
  </Card>
</div>
  );
}

export default ForgotPassword;