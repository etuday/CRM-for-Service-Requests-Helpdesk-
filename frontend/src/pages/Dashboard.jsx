import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Spin, Typography, message, Avatar } from 'antd';
import { TagOutlined, UserOutlined, TeamOutlined, CheckCircleOutlined, ExclamationCircleOutlined, AreaChartOutlined } from '@ant-design/icons';
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line
} from 'recharts';
import api from '../services/api';
import TicketList from './TicketList';

const { Title } = Typography;

const PIE_COLORS = ['#1890ff', '#faad14', '#52c41a', '#ff4d4f']; // Colors for status

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/dashboard/stats');
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            if (error.response?.status !== 401) {
                message.error(error.response?.data?.message || 'Failed to fetch dashboard stats');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading || !stats) {
        return <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div>;
    }

    // Format Data for Recharts pie chart
    const statusData = [
        { name: 'Open', value: stats.statusBreakdown['Open'] || 0 },
        { name: 'In Progress', value: stats.statusBreakdown['In Progress'] || 0 },
        { name: 'Resolved', value: stats.statusBreakdown['Resolved'] || 0 },
        { name: 'Closed', value: stats.statusBreakdown['Closed'] || 0 }
    ].filter(item => item.value > 0); // Hide empty slices

    const agentWorkloadData = (stats.agentWorkload || []).map(item => ({
        name: item.name,
        count: item.count
    }));

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: '12px' }}>
                <Avatar size={48} icon={<AreaChartOutlined />} style={{ backgroundColor: '#4f46e5', boxShadow: '0 4px 10px rgba(79,70,229,0.3)' }} />
                <div>
                    <Title level={3} style={{ margin: 0 }}>System Analytics</Title>
                    <Typography.Text type="secondary">Overview of platform tickets and users</Typography.Text>
                </div>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={8} lg={4}>
                    <Card bordered={false} className="hover-card">
                        <Statistic title="Total Tickets" value={stats.totalTickets} prefix={<Avatar style={{ backgroundColor: '#e0e7ff', color: '#4f46e5', marginRight: 8 }} icon={<TagOutlined />} />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={5}>
                    <Card bordered={false} className="hover-card">
                        <Statistic title="Open Tickets" value={stats.statusBreakdown['Open'] || 0} prefix={<Avatar style={{ backgroundColor: '#fffbe6', color: '#faad14', marginRight: 8 }} icon={<ExclamationCircleOutlined />} />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={5}>
                    <Card bordered={false} className="hover-card">
                        <Statistic title="Closed Tickets" value={stats.statusBreakdown['Closed'] || 0} prefix={<Avatar style={{ backgroundColor: '#f6ffed', color: '#52c41a', marginRight: 8 }} icon={<CheckCircleOutlined />} />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={5}>
                    <Card bordered={false} className="hover-card">
                        <Statistic title="Total Users" value={stats.totalUsers} prefix={<Avatar style={{ backgroundColor: '#e6f7ff', color: '#1890ff', marginRight: 8 }} icon={<UserOutlined />} />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={5}>
                    <Card bordered={false} className="hover-card">
                        <Statistic title="Total Agents" value={stats.totalAgents} prefix={<Avatar style={{ backgroundColor: '#f9f0ff', color: '#722ed1', marginRight: 8 }} icon={<TeamOutlined />} />} />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={8}>
                    <Card title="Tickets by Status" bordered={false} className="hover-card">
                        <ResponsiveContainer width="100%" height={320}>
                            {statusData.length > 0 ? (
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={3}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            ) : (
                                <div style={{ textAlign: 'center', marginTop: 100, color: '#999' }}>No data available</div>
                            )}
                        </ResponsiveContainer>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="Active Tickets by Agent" bordered={false} className="hover-card">
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={agentWorkloadData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={60} fill="#4f46e5" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="Monthly Arrival Trend" bordered={false} className="hover-card">
                        <ResponsiveContainer width="100%" height={320}>
                            <LineChart data={stats.monthlyTrend} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" tickFormatter={(val) => monthNames[val - 1] || val} />
                                <YAxis allowDecimals={false} />
                                <Tooltip labelFormatter={(val) => monthNames[val - 1] || val} />
                                <Line type="monotone" dataKey="count" name="Tickets" stroke="#1890ff" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            <Row style={{ marginTop: 24 }}>
                <Col span={24}>
                    <Card title="All Tickets Raised By Users" bordered={false}>
                        <TicketList embedded={true} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
