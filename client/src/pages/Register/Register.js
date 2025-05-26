import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  Typography,
  DatePicker,
  Modal,
  Col,
  Row,
  message as antdMessage,
} from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import moment from 'moment';
import './Register.css';
import logo from '../../assests/logo.jpeg';
import clinicBg from '../../assests/clinic-bg.jpg';

const { Option } = Select;
const { Text, Title } = Typography;

function Register() {
  const [form] = Form.useForm();
  const [doctorForm] = Form.useForm();
  const [isDoctor, setIsDoctor] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [doctorFields, setDoctorFields] = useState({});
  const navigate = useNavigate();
  const [messageApi, contextHolder] = antdMessage.useMessage();

 async function onFinish(values) {
  try {
    const body = { ...values, ...doctorFields };
    const res = await fetch('http://localhost:5000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
    
      messageApi.error({
        content: data.msg || 'Registration failed',
        duration: 2,
      });
    
      messageApi.success({
        content: 'Registered successfully! Please login.',
        duration: 1,
      });

      //console.log('Successfully registered user!');
      setTimeout(() => {
        navigate('/');
      }, 1000);
    }

  } catch (e) {
    messageApi.error({
      content: e.message || 'Something went wrong',
      duration: 2,
    });
  }
}

  const handleRoleChange = (value) => {
    setIsDoctor(value === 'doctor');
    if (value === 'doctor') {
      setShowDoctorModal(true);
    }
  };

  const handleDoctorInfoSubmit = () => {
    doctorForm
      .validateFields()
      .then((values) => {
        setDoctorFields(values);
        setShowDoctorModal(false);
        messageApi.success('Doctor info saved');
      })
      .catch(() => {});
  };

  return (
    <div className="register-bg" style={{ backgroundImage: `url(${clinicBg})` }}>
      {contextHolder}
      <div className="register-card">
        <div className="register-header">
          <Title level={3} style={{ margin: 0 }}>Register</Title>
          <img src={logo} alt="MediConnect Logo" className="register-logo-inline" />
        </div>

        <div className="register-form-wrapper">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            scrollToFirstError
          >
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Email is required' },
                    {
                      pattern: /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/,
                      message:
                        'Email must start and end with alphanumeric characters and only use one dot between parts',
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  name="password"
                  label="Password"
                  hasFeedback
                  rules={[
                    {
                      required: true,
                      message: 'Password is required',
                    },
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
                          <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            {failed.map((f, i) => (
                              <li key={i} style={{ color: 'black' }}>{f.label}</li>
                            ))}
                          </ul>
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="confirm"
                  label="Confirm Password"
                  dependencies={['password']}
                  hasFeedback
                  rules={[
                    { required: true, message: 'Please confirm your password!' },
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
                  <Input.Password />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  name="phone"
                  label="Phone Number"
                  rules={[
                    { required: true },
                    { pattern: /^[0-9]{10}$/, message: 'Phone must be 10 digits' },
                  ]}
                >
                  <Input maxLength={10} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="dob"
                  label="Date of Birth"
                  rules={[{ required: true }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="YYYY-MM-DD"
                    disabledDate={(d) => d && d > moment().endOf('day')}
                  />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item name="address" label="Address" rules={[{ required: true }]}>
                  <Input.TextArea rows={2} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
                  <Select placeholder="Select gender">
                    <Option value="male">Male</Option>
                    <Option value="female">Female</Option>
                    <Option value="other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="role" label="Role" rules={[{ required: true }]}>
                  <Select placeholder="Select a role" onChange={handleRoleChange}>
                    <Option value="patient">Patient</Option>
                    <Option value="doctor">Doctor</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Register
              </Button>
            </Form.Item>

            <Form.Item style={{ textAlign: 'center' }}>
              <Text type="secondary">Already have an account? </Text>
              <Link to="/">Login here</Link>
            </Form.Item>
          </Form>
        </div>
      </div>

      {/* Doctor Info Modal */}
      <Modal
        className="glass-modal"
        title="Doctor Information"
        open={showDoctorModal}
        onOk={handleDoctorInfoSubmit}
        onCancel={() => setShowDoctorModal(false)}
        okText="Save"
      >
        <Form layout="vertical" form={doctorForm}>
          <Form.Item name="degree" label="Degree" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="experience" label="Experience" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="about" label="About" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="fee" label="Appointment Fee (₹)" rules={[{ required: true }]}>
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="designation" label="Designation" rules={[{ required: true }]}>
            <Select>
              <Option value="Cardiologist">Cardiologist</Option>
              <Option value="Dermatologist">Dermatologist</Option>
              <Option value="Neurologist">Neurologist</Option>
              <Option value="Pediatrician">Pediatrician</Option>
              <Option value="General Physician">General Physician</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Register;