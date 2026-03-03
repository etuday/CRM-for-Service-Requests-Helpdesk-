import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card, Descriptions, Tag, Button, Select, Timeline,
    List, Input, Form, Typography, Row, Col, Spin, message, Space, Avatar
} from 'antd';
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

const TicketDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [agents, setAgents] = useState([]);

    // Comment Form
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchTicket();
        if (user?.role === 'admin') {
            fetchAgents();
        }
    }, [id, user]);

    const fetchTicket = async () => {
        try {
            const { data } = await api.get(`/tickets/${id}`);
            if (data.success) {
                setTicket(data.data);
            }
        } catch (error) {
            if (error.response?.status !== 401) {
                message.error('Failed to load ticket details');
                navigate('/tickets');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchAgents = async () => {
        try {
            const { data } = await api.get('/users');
            if (data.success) {
                setAgents(data.data.filter(u => u.role === 'agent' && !u.isDeleted));
            }
        } catch (error) {
            console.error("Failed to load agents");
        }
    };

    const handleUpdate = async (field, value) => {
        try {
            const { data } = await api.put(`/tickets/${id}`, { [field]: value });
            if (data.success) {
                message.success('Ticket updated');
                fetchTicket();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Update failed');
        }
    };

    const handleAddComment = async (values) => {
        setSubmitting(true);
        try {
            const { data } = await api.post(`/tickets/${id}/comment`, values);
            if (data.success) {
                message.success('Comment added');
                form.resetFields();
                fetchTicket();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to add comment');
        } finally {
            setSubmitting(false);
        }
    };


    if (loading || !ticket) {
        return <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div>;
    }

    // Formatting helpers
    const getStatusColor = (status) => {
        const colors = { 'Open': 'gold', 'In Progress': 'blue', 'Resolved': 'green', 'Closed': 'default' };
        return colors[status] || 'blue';
    };
    const getPriorityColor = (priority) => {
        const colors = { 'Low': 'green', 'Medium': 'gold', 'High': 'red' };
        return colors[priority] || 'gold';
    };

    const getPerformerName = (log) => {
        if (!log.performedBy) return 'Unknown';
        if (ticket.createdBy._id === log.performedBy.toString()) return ticket.createdBy.name;
        if (ticket.assignedTo && ticket.assignedTo._id === log.performedBy.toString()) return ticket.assignedTo.name;
        return 'Admin / Staff';
    };

    return (
        <div>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/tickets')} style={{ marginBottom: 16 }}>
                Back to List
            </Button>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    {/* Main Details */}
                    <Card
                        title={<Title level={4} style={{ margin: 0 }}>{ticket.ticketId} - {ticket.title}</Title>}
                        bordered={false}
                        className="hover-card"
                        style={{ marginBottom: 24 }}
                    >
                        <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                            <Descriptions.Item label="Status">
                                {(user.role === 'agent' || user.role === 'admin') ? (
                                    <Select
                                        value={ticket.status}
                                        onChange={(val) => handleUpdate('status', val)}
                                        style={{ width: 130 }}
                                    >
                                        <Option value="Open">Open</Option>
                                        <Option value="In Progress">In Progress</Option>
                                        <Option value="Resolved">Resolved</Option>
                                        <Option value="Closed">Closed</Option>
                                    </Select>
                                ) : (
                                    <Tag color={getStatusColor(ticket.status)}>{ticket.status.toUpperCase()}</Tag>
                                )}
                            </Descriptions.Item>

                            <Descriptions.Item label="Priority">
                                {(user.role === 'admin' || user.role === 'agent') ? (
                                    <Select
                                        value={ticket.priority}
                                        onChange={(val) => handleUpdate('priority', val)}
                                        style={{ width: 130 }}
                                    >
                                        <Option value="Low">Low</Option>
                                        <Option value="Medium">Medium</Option>
                                        <Option value="High">High</Option>
                                    </Select>
                                ) : (
                                    <Tag color={getPriorityColor(ticket.priority)}>{ticket.priority.toUpperCase()}</Tag>
                                )}
                            </Descriptions.Item>

                            <Descriptions.Item label="Category">{ticket.category}</Descriptions.Item>

                            <Descriptions.Item label="Assigned To">
                                {user.role === 'admin' ? (
                                    <Select
                                        value={ticket.assignedTo?._id || null}
                                        onChange={(val) => handleUpdate('assignedTo', val)}
                                        style={{ width: 180 }}
                                        placeholder="Unassigned"
                                        allowClear
                                    >
                                        {agents.map(a => <Option key={a._id} value={a._id}>{a.name}</Option>)}
                                    </Select>
                                ) : (
                                    ticket.assignedTo?.name || <Text type="secondary" italic>Unassigned</Text>
                                )}
                            </Descriptions.Item>

                            <Descriptions.Item label="Created By" span={2}>
                                {ticket.createdBy.name} ({ticket.createdBy.email})
                            </Descriptions.Item>

                            <Descriptions.Item label="Description" span={2}>
                                <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{ticket.description}</div>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* Comments Section */}
                    <Card title="Notes & Comments" bordered={false} className="hover-card" style={{ marginBottom: 24 }}>
                        <List
                            dataSource={ticket.comments}
                            header={`${ticket.comments.length} ${ticket.comments.length === 1 ? 'comment' : 'comments'}`}
                            itemLayout="horizontal"
                            locale={{ emptyText: 'No comments yet. Be the first to add one!' }}
                            renderItem={props => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: props.role === 'agent' || props.role === 'admin' ? '#4f46e5' : '#10b981' }} />}
                                        title={
                                            <Space>
                                                <Text strong>{props.commentedBy?.name || 'Unknown User'}</Text>
                                                <Tag color={props.role === 'user' ? 'default' : 'geekblue'} style={{ borderRadius: 4 }}>{props.role}</Tag>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>{new Date(props.timestamp).toLocaleString()}</Text>
                                            </Space>
                                        }
                                        description={<div style={{ color: '#374151', marginTop: 4, whiteSpace: 'pre-wrap' }}>{props.message}</div>}
                                    />
                                </List.Item>
                            )}
                        />

                        <Form form={form} onFinish={handleAddComment} style={{ marginTop: 24 }}>
                            <Form.Item name="message" rules={[{ required: true, message: 'Please write a comment' }]}>
                                <Input.TextArea rows={4} placeholder="Add a comment or internal note..." />
                            </Form.Item>
                            <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                                <Button htmlType="submit" loading={submitting} type="primary">
                                    Post Comment
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    {/* Activity Logs */}
                    <Card title="Activity Timeline" bordered={false} className="hover-card">
                        <Timeline
                            items={ticket.activityLogs.map((log) => ({
                                children: (
                                    <div>
                                        <Text strong>{log.action}</Text>
                                        <br />
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            by {getPerformerName(log)} <Tag bordered={false} style={{ margin: 0, padding: '0 4px', fontSize: 10, borderRadius: 4 }}>{log.role}</Tag>
                                            <br />
                                            {new Date(log.timestamp).toLocaleString()}
                                        </Text>
                                    </div>
                                ),
                            }))}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default TicketDetail;
