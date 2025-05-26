import React from 'react';
import { Form, Input, Button, Card, message as antdMessage , Typography } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../assests/logo.jpeg';
import clinicBg from '../../assests/clinic-bg.jpg';
import './Login.css';
import { useUser } from '../UserContext';

import { Select } from 'antd';


const { Text, Title } = Typography;
const { Option } = Select;

function Login() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [messageApi, contextHolder] = antdMessage.useMessage();

  const onFinish = async (values) => {
    try {
      const res = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.msg || 'Login failed');

      const userObj = { id: data.userId, role: data.role, name: data.name };

      localStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);

      messageApi.success(`Welcome, ${data.name}!`);
      setTimeout(() => {
        if (data.role === 'patient') {
          navigate('/patient-dashboard');
        } else if (data.role === 'doctor') {
          navigate('/doctor-dashboard');
        }
      }, 1000);
    } catch (err) {
      messageApi.error(err.message);
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${clinicBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {contextHolder}
      <Card className="glass-card" style={{ maxWidth: 400, width: '90%', textAlign: 'center', borderRadius: '20px' }}>
        {/* ... Logo, Heartbeat, Title ... */}

        <Title level={3} style={{ marginBottom: 10 }}>Login</Title>

      <Form layout="vertical" onFinish={onFinish}>
  <Form.Item name="email" label="Email" rules={[{ required: true }]}>
    <Input type="email" />
  </Form.Item>

  <Form.Item name="password" label="Password" rules={[{ required: true }]}>
    <Input.Password />
  </Form.Item>

  {/* 👇 Add this block just below the password field */}
  <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
    <Link to="/forgot-password">Forgot Password?</Link>
  </Form.Item>

  <Form.Item name="role" label="Login As" rules={[{ required: true, message: 'Please select a role' }]}>
    <Select placeholder="Select your role">
      <Option value="patient">Patient</Option>
      <Option value="doctor">Doctor</Option>
    </Select>
  </Form.Item>

  <Form.Item>
    <Button type="primary" htmlType="submit" block>
      Login
    </Button>
  </Form.Item>

  <Form.Item style={{ textAlign: 'center' }}>
    <Text type="secondary">Not a member? </Text>
    <Link to="/register">Register here</Link>
  </Form.Item>
</Form>

      </Card>
    </div>
  );
}

export default Login;
