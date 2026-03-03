import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, message, Popconfirm, Select, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import api from '../services/api';

const { Title } = Typography;

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/users');
            if (data.success) {
                setUsers(data.data);
            }
        } catch (error) {
            if (error.response?.status !== 401) {
                message.error(error.response?.data?.message || 'Failed to fetch users');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const { data } = await api.put(`/users/${userId}`, { role: newRole });
            if (data.success) {
                message.success('User role updated');
                fetchUsers();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to update role');
        }
    };

    const handleDelete = async (userId) => {
        try {
            const { data } = await api.delete(`/users/${userId}`);
            if (data.success) {
                message.success('User deactivated successfully');
                fetchUsers();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to deactivate user');
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role, record) => (
                <Select
                    defaultValue={role}
                    style={{ width: 120 }}
                    onChange={(val) => handleRoleChange(record._id, val)}
                    disabled={record.isDeleted}
                >
                    <Select.Option value="user">User</Select.Option>
                    <Select.Option value="agent">Agent</Select.Option>
                    <Select.Option value="admin">Admin</Select.Option>
                </Select>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => {
                if (record.isDeleted) return <Tag color="error">Deleted</Tag>;
                return <Tag color={status === 'active' ? 'success' : 'warning'}>{status.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Popconfirm
                        title="Deactivate this user?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                        disabled={record.isDeleted}
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} disabled={record.isDeleted}>Deactivate</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Title level={3} style={{ marginBottom: 24 }}>User Management</Title>
            <Table
                columns={columns}
                dataSource={users}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default UserManagement;
