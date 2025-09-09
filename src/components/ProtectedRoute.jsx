import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin, Typography, Card } from 'antd';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading, logout } = useAuth();
  const location = useLocation();
  const [countdown, setCountdown] = useState(3);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex-center full-height">
        <Spin size="large" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin()) {
    // Countdown effect
    useEffect(() => {
      if (countdown > 0) {
        const timer = setTimeout(() => {
          setCountdown(countdown - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        // Logout and redirect to login immediately
        logout();
        window.location.href = '/login';
      }
    }, [countdown, logout]);

    return (
      <div className="full-height flex-center" style={{ background: '#000000' }}>
        <Card
          style={{
            width: 400,
            backgroundColor: '#111111',
            border: '1px solid #333333',
            boxShadow: '0 4px 12px rgba(255, 255, 255, 0.05)',
            textAlign: 'center'
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <Title level={2} style={{ color: '#ff4d4f', marginBottom: 16 }}>
              Access Denied
            </Title>
            <Text style={{ color: '#ffffff', fontSize: 16 }}>
              คุณไม่มีสิทธิ์เข้าถึงหน้านี้
            </Text>
          </div>
          
          <div style={{ marginBottom: 24 }}>
            <Text style={{ color: '#8c8c8c', fontSize: 14 }}>
              กำลังออกจากระบบในอีก
            </Text>
            <div style={{ marginTop: 8 }}>
              <Title 
                level={1} 
                style={{ 
                  color: '#ff4d4f', 
                  margin: 0, 
                  fontSize: 48,
                  fontWeight: 'bold'
                }}
              >
                {countdown}
              </Title>
            </div>
          </div>
          
          <Text style={{ color: '#8c8c8c', fontSize: 12 }}>
            ระบบจะพาคุณกลับไปยังหน้าล็อกอินโดยอัตโนมัติ
          </Text>
        </Card>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
