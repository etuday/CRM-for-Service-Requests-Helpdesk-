import React, { useContext, useState } from 'react';
import { Layout, Menu, Typography, Dropdown, Avatar, theme, Button } from 'antd';
import {
    DashboardOutlined,
    TagOutlined,
    UserOutlined,
    LogoutOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = user?.role === 'admin' ? [
        {
            key: '/',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        }
    ] : [
        {
            key: '/tickets',
            icon: <TagOutlined />,
            label: 'Tickets',
        }
    ];

    const userMenu = {
        items: [
            {
                key: 'profile',
                label: (
                    <div style={{ padding: '4px 0' }}>
                        <Text strong>{user?.name}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px', textTransform: 'capitalize' }}>Role: {user?.role}</Text>
                    </div>
                )
            },
            {
                type: 'divider',
            },
            {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Logout',
                onClick: handleLogout,
                danger: true
            }
        ]
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed} theme="dark" style={{ background: '#111827', boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)' }}>
                <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1f2937' }}>
                    {!collapsed ? (
                        <Title level={4} style={{ color: 'white', margin: 0, letterSpacing: '0.5px' }}>Helpdesk CRM</Title>
                    ) : (
                        <Title level={4} style={{ color: 'white', margin: 0 }}>CRM</Title>
                    )}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    style={{ background: '#111827', marginTop: '16px' }}
                    selectedKeys={[location.pathname]}
                    onClick={({ key }) => navigate(key)}
                    items={menuItems}
                />
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '24px', borderBottom: '1px solid #f0f0f0' }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: '16px', width: 64, height: 64 }}
                    />
                    <Dropdown menu={userMenu} placement="bottomRight">
                        <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
                        </div>
                    </Dropdown>
                </Header>
                <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: colorBgContainer, borderRadius: borderRadiusLG }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
