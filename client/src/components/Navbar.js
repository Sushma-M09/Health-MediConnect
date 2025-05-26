import React from 'react';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <Menu mode="horizontal">
      {/* <Menu.Item key="login"><Link to="/">Login</Link></Menu.Item> */}
      {/* <Menu.Item key="register"><Link to="/register">Register</Link></Menu.Item> */}
      {/* <Menu.Item key="pd"><Link to="/patient-dashboard">Patient</Link></Menu.Item> */}
      {/* <Menu.Item key="dd"><Link to="/doctor-dashboard">Doctor</Link></Menu.Item> */}
    </Menu>
  );
}

export default Navbar;
