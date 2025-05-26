import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, Modal } from 'antd';
import { LogoutOutlined, LockOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import profileImg from '../../assests/doctor.jpg';
import logo from '../../assests/logo.jpeg';
import './DoctorLayout.css';
import { useUser } from '../UserContext';

const { Header, Content, Sider } = Layout;
const { Text, Title } = Typography;
const { confirm } = Modal;

const DoctorLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  const showLogoutConfirm = () => {
    confirm({
      title: 'Are you sure you want to logout?',
      icon: <ExclamationCircleOutlined />,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        //console.log('Confirmed logout');
        navigate('/');
      },
      onCancel() {
        //console.log('Cancelled logout');
      },
    });
  };

  const handleMenuClick = ({ key }) => {
    //console.log('Menu clicked:', key);
    if (key === 'logout') {
      showLogoutConfirm();
    }
    if (key === 'changePassword') {
      navigate('/doctor-dashboard/change-password');
    }
  };

  const dropdownMenu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="changePassword" icon={<LockOutlined />}>
        Change Password
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />}>
        Logout
      </Menu.Item>
    </Menu>
  );

  const pathToKey = {
    '/doctor-dashboard/profile': 'profile',
    '/doctor-dashboard': 'appointments',
    '/doctor-dashboard/schedule': 'schedule',
  };
  const selectedKey = pathToKey[location.pathname];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200}>
        <div className="profile-box">
          <Avatar src={profileImg} size={64} />
          <div style={{ marginTop: 10 }}>
            <Text strong>{user?.name || 'Doctor'}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Role'}
            </Text>
          </div>
          <Dropdown overlay={dropdownMenu} trigger={['click']}>
            <a href="/" onClick={(e) => e.preventDefault()} style={{ display: 'block', marginTop: 10 }}>
              <Text underline>Account</Text>
            </a>
          </Dropdown>
        </div>

        <Menu mode="inline" selectedKeys={[selectedKey]} style={{ height: '100%' }}>
          <Menu.Item key="profile">
            <Link to="/doctor-dashboard/profile">My Profile</Link>
          </Menu.Item>
          <Menu.Item key="appointments">
            <Link to="/doctor-dashboard">Appointments</Link>
          </Menu.Item>
          <Menu.Item key="schedule">
            <Link to="/doctor-dashboard/schedule">View Schedule</Link>
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
          <img src={logo} alt="MediConnect Logo" style={{ width: 32, marginRight: 8 }} />
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            MediConnect
          </Title>
        </Header>

        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DoctorLayout;