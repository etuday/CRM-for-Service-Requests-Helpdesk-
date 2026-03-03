import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import MainLayout from './components/MainLayout';

import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import TicketList from './pages/TicketList';
import TicketDetail from './pages/TicketDetail';
import { ConfigProvider } from 'antd';

// Component to dynamically route home path based on user role
const RootRoute = () => {
  const { user } = useContext(AuthContext);
  if (user?.role === 'admin') {
    return <Dashboard />;
  }
  return <Navigate to="/tickets" replace />;
};

const App = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#4f46e5',
          borderRadius: 6,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          colorBgContainer: '#ffffff',
          colorBgLayout: '#f3f4f6',
        },
        components: {
          Layout: {
            headerBg: '#ffffff',
          },
          Card: {
            headerBg: '#f9fafb',
          }
        }
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes with Dashboard Layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<RootRoute />} />
                <Route path="/tickets" element={<TicketList />} />
                <Route path="/tickets/:id" element={<TicketDetail />} />

                {/* Admin Only Route Guard */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/users" element={<UserManagement />} />
                </Route>
              </Route>
            </Route>

            {/* Fallback 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
