import React, { useState, useContext, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const { Title, Text } = Typography;

const Register = () => {
    const [loading, setLoading] = useState(false);
    const { register, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const onFinish = async (values) => {
        setLoading(true);
        const res = await register(values.name, values.email, values.password);
        if (res?.success) {
            message.success('Registration successful');
            navigate('/');
        } else {
            message.error(res?.message || 'Registration failed');
        }
        setLoading(false);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
            <Card style={{ width: 450, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', borderRadius: 12 }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Title level={2} style={{ marginBottom: 4 }}>Helpdesk CRM</Title>
                    <Text type="secondary">Create a new account</Text>
                </div>

                <Form name="register" onFinish={onFinish} layout="vertical" size="large">
                    <Form.Item name="name" rules={[{ required: true, message: 'Please input your Name!' }]}>
                        <Input prefix={<UserOutlined />} placeholder="Full Name" />
                    </Form.Item>
                    <Form.Item name="email" rules={[{ required: true, message: 'Please input your Email!' }, { type: 'email', message: 'Please enter a valid email!' }]}>
                        <Input prefix={<MailOutlined />} placeholder="Email Address" />
                    </Form.Item>
                    <Form.Item name="password" rules={[{ required: true, message: 'Please input a Password!' }, { min: 6, message: 'Password must be at least 6 characters!' }]}>
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ width: '100%', borderRadius: 6 }} loading={loading}>
                            Register
                        </Button>
                    </Form.Item>
                    <div style={{ textAlign: 'center' }}>
                        Already have an account? <Link to="/login">Log in here</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Register;
