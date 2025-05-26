import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, Modal } from 'antd';
import { UserOutlined, LogoutOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import profileImg from '../../assests/patient.jpg';
import logo from '../../assests/logo.jpeg';
import './PatientLayout.css';
import { useUser } from '../UserContext';

const { Header, Content, Sider } = Layout;
const { Text, Title } = Typography;
const { confirm } = Modal;

const PatientLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: storedUser } = useUser();
  const showLogoutConfirm = () => {
    confirm({
      title: 'Are you sure you want to logout?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        navigate('/');
      },
      onCancel() {
      },
    });
  };
  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      showLogoutConfirm();
    } else if (key === 'changePassword') {
      navigate('/patient-dashboard/change-password');
    }
  };

  const pathToKey = {
    '/patient-dashboard/profile': 'profile',
    '/patient-dashboard': 'book',
    '/patient-dashboard/appointments': 'appointments',
  };

  const selectedKey = pathToKey[location.pathname];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200}>
        {/* Sidebar with profile and navigation */}
        <div className="profile-box">
          <Avatar src={profileImg} size={64} />
          <div
  style={{
    marginTop: 10,
    maxWidth: 160,
    overflowWrap: 'break-word',
    whiteSpace: 'normal',
  }}
>
  <Text
    strong
    style={{
      display: 'block',
      wordWrap: 'break-word',
      whiteSpace: 'normal',
      lineHeight: '1.2',
      wordBreak: 'break-word',
    }}
  >
    {storedUser?.name || 'Patient'}
  </Text>
  <Text
    type="secondary"
    style={{ fontSize: 12, display: 'block', whiteSpace: 'normal' }}
  >
    {storedUser?.role.charAt(0).toUpperCase() + storedUser?.role.slice(1)}
  </Text>
</div>

          <Dropdown overlay={<Menu onClick={handleMenuClick}>
              <Menu.Item key="changePassword" icon={<LockOutlined />}>
                Change Password
              </Menu.Item>
              <Menu.Item key="logout" icon={<LogoutOutlined />}>
                Logout
              </Menu.Item>
            </Menu>} trigger={['click']}>
            <a onClick={(e) => e.preventDefault()} style={{ display: 'block', marginTop: 10 }}>
              <Text underline>Account</Text>
            </a>
          </Dropdown>
        </div>

        <Menu mode="inline" selectedKeys={[selectedKey]} style={{ height: '100%' }}>
          <Menu.Item key="profile">
            <Link to="/patient-dashboard/profile">My Profile</Link>
          </Menu.Item>
          <Menu.Item key="book">
            <Link to="/patient-dashboard">Book Appointment</Link>
          </Menu.Item>
          <Menu.Item key="appointments">
            <Link to="/patient-dashboard/appointments">My Appointments</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 20px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src={logo} alt="MediConnect Logo" style={{ width: 32, marginRight: 8 }} />
            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
              MediConnect
            </Title>
          </div>
        </Header>
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default PatientLayout;