import React, { useState, useEffect, useContext } from 'react';
import { Table, Tag, Button, Space, Input, Select, message, Modal, Form, Typography, Row, Col, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

const TicketList = ({ embedded = false }) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [agents, setAgents] = useState([]);

    // Filters
    const [statusFilter, setStatusFilter] = useState(undefined);
    const [priorityFilter, setPriorityFilter] = useState(undefined);

    // Create Modal
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [creating, setCreating] = useState(false);

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchTickets = async (page = 1, size = 10) => {
        setLoading(true);
        try {
            let url = `/tickets?page=${page}&limit=${size}`;
            if (statusFilter) url += `&status=${statusFilter}`;
            if (priorityFilter) url += `&priority=${priorityFilter}`;

            const { data } = await api.get(url);
            if (data.success) {
                setTickets(data.data.tickets);
                setTotal(data.data.pagination.total);
            }
        } catch (error) {
            if (error.response?.status !== 401) {
                message.error('Failed to fetch tickets');
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

    useEffect(() => {
        fetchTickets(pagination.current, pagination.pageSize);
        if (user?.role === 'admin') {
            fetchAgents();
        }
    }, [pagination.current, pagination.pageSize, statusFilter, priorityFilter, user]);

    const handleTableChange = (newPagination) => {
        setPagination(newPagination);
    };

    const handleCreate = async (values) => {
        setCreating(true);
        try {
            const { data } = await api.post('/tickets', values);
            if (data.success) {
                message.success('Ticket created successfully');
                setIsModalVisible(false);
                form.resetFields();
                fetchTickets();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to create ticket');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const { data } = await api.delete(`/tickets/${id}`);
            if (data.success) {
                message.success('Ticket deleted successfully');
                fetchTickets();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to delete ticket');
        }
    };

    const handleAssign = async (ticketId, agentId) => {
        try {
            const { data } = await api.put(`/tickets/${ticketId}`, { assignedTo: agentId });
            if (data.success) {
                message.success('Ticket assigned successfully');
                fetchTickets(pagination.current, pagination.pageSize);
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to assign ticket');
        }
    };

    const columns = [
        {
            title: 'Ticket ID',
            dataIndex: 'ticketId',
            key: 'ticketId',
            render: (text) => <strong>{text}</strong>,
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'blue';
                if (status === 'Open') color = 'gold';
                if (status === 'Resolved') color = 'green';
                if (status === 'Closed') color = 'default';
                return <Tag color={color}>{status.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Created Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Last Updated',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (date) => {
                if (!date) return '-';
                return new Date(date).toLocaleDateString();
            }
        },
        {
            title: 'Assigned To',
            dataIndex: 'assignedTo',
            key: 'assignedTo',
            render: (assignedObj, record) => {
                if (user?.role === 'admin') {
                    return (
                        <Select
                            size="small"
                            value={assignedObj?._id || null}
                            onChange={(val) => handleAssign(record._id, val)}
                            style={{ width: 150 }}
                            placeholder="Unassigned"
                            allowClear
                        >
                            {agents.map(a => <Option key={a._id} value={a._id}>{a.name}</Option>)}
                        </Select>
                    );
                }
                return assignedObj?.name || <Text type="secondary" italic>Unassigned</Text>;
            }
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" icon={<EyeOutlined />} size="small" onClick={() => navigate(`/tickets/${record._id}`)}>
                        View
                    </Button>
                    {user?.role === 'admin' && (
                        <Popconfirm
                            title="Delete this ticket?"
                            onConfirm={() => handleDelete(record._id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button type="text" danger icon={<DeleteOutlined />} size="small">
                                Delete
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div>
            {!embedded && (
                <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                    <Col>
                        <Title level={3} style={{ margin: 0 }}>Tickets</Title>
                    </Col>
                    <Col>
                        {user?.role === 'user' && (
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                                Create Ticket
                            </Button>
                        )}
                    </Col>
                </Row>
            )}

            <div style={{ marginBottom: 16, display: 'flex', gap: '16px' }}>
                <Select
                    allowClear
                    placeholder="Filter by Status"
                    style={{ width: 200 }}
                    onChange={(value) => setStatusFilter(value)}
                >
                    <Option value="Open">Open</Option>
                    <Option value="In Progress">In Progress</Option>
                    <Option value="Resolved">Resolved</Option>
                    <Option value="Closed">Closed</Option>
                </Select>

                <Select
                    allowClear
                    placeholder="Filter by Priority"
                    style={{ width: 200 }}
                    onChange={(value) => setPriorityFilter(value)}
                >
                    <Option value="Low">Low</Option>
                    <Option value="Medium">Medium</Option>
                    <Option value="High">High</Option>
                </Select>
            </div>

            <Table
                columns={columns}
                dataSource={tickets}
                rowKey="_id"
                pagination={{
                    ...pagination,
                    total,
                    showSizeChanger: true
                }}
                loading={loading}
                onChange={handleTableChange}
            />

            <Modal
                title="Create New Ticket"
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form layout="vertical" form={form} onFinish={handleCreate}>
                    <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                        <Input placeholder="Enter ticket title" />
                    </Form.Item>

                    <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                        <Select placeholder="Select category">
                            <Option value="Hardware">Hardware</Option>
                            <Option value="Software">Software</Option>
                            <Option value="Network">Network</Option>
                            <Option value="Billing">Billing</Option>
                            <Option value="Other">Other</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="priority" label="Priority" initialValue="Medium">
                        <Select>
                            <Option value="Low">Low</Option>
                            <Option value="Medium">Medium</Option>
                            <Option value="High">High</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                        <Input.TextArea rows={4} placeholder="Describe the issue in detail" />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={creating}>Submit</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TicketList;
