import React, { useState, useEffect } from 'react';
import {
  Layout,
  Table,
  Button,
  Typography,
  Space,
  Popconfirm,
  message,
  Tag,
  Card,
  Dropdown
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LogoutOutlined,
  UserOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI } from '../services/api';
import UserModal from '../components/UserModal';
import dayjs from 'dayjs';

// Custom hook for responsive behavior
const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile, isTablet };
};

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingUser, setEditingUser] = useState(null);
  const { user, logout } = useAuth();
  const { isMobile, isTablet } = useResponsive();

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getAll();
      if (response.success) {
        setUsers(response.users);
      }
    } catch (error) {
      console.error('Load users error:', error);
      message.error('เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setModalMode('create');
    setEditingUser(null);
    setModalVisible(true);
  };

  const handleEditUser = (record) => {
    setModalMode('edit');
    setEditingUser(record);
    setModalVisible(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await usersAPI.delete(userId);
      if (response.success) {
        message.success('ลบผู้ใช้สำเร็จ');
        loadUsers();
      }
    } catch (error) {
      console.error('Delete user error:', error);
      const errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบผู้ใช้';
      message.error(errorMessage);
    }
  };

  const handleModalSuccess = () => {
    setModalVisible(false);
    loadUsers();
  };

  const handleLogout = () => {
    logout();
    message.success('ออกจากระบบสำเร็จ');
  };

  // User menu for header
  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: `${user?.user} (${user?.role})`,
        disabled: true
      },
      {
        type: 'divider'
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'ออกจากระบบ',
        onClick: handleLogout
      }
    ]
  };

  // Table columns with responsive adjustments
  const columns = [
    {
      title: 'ลำดับ',
      key: 'index',
      width: isMobile ? 60 : 80,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (text) => <Text strong style={{ fontSize: isMobile ? '12px' : '14px' }}>{text}</Text>,
    },
    {
      title: 'วันที่สร้าง',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: isMobile ? 120 : 150,
      render: (date) => (
        <Text style={{ fontSize: isMobile ? '11px' : '12px' }}>
          {isMobile ? dayjs(date).format('DD/MM/YY') : dayjs(date).format('DD/MM/YYYY HH:mm')}
        </Text>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: isMobile ? 80 : 100,
      render: (role) => (
        <Tag 
          color={role === 'Admin' ? 'red' : 'blue'}
          style={{ fontSize: isMobile ? '10px' : '12px' }}
        >
          {role}
        </Tag>
      ),
    },
    {
      title: 'จัดการ',
      key: 'actions',
      width: isMobile ? 80 : 120,
      fixed: 'right',
      render: (_, record) => {
        // Try multiple ways to check if it's current user
        const isCurrentUser = user && (
          (user._id && record._id && user._id === record._id) ||
          (user.id && record.id && user.id === record.id) ||
          (user.user && record.user && user.user === record.user)
        );
        
        return (
          <Space size="small">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditUser(record)}
              style={{ color: '#ffffff' }}
            />
            {!isCurrentUser && (
              <Popconfirm
                title="ยืนยันการลบ"
                description="คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?"
                onConfirm={() => handleDeleteUser(record._id)}
                okText="ลบ"
                cancelText="ยกเลิก"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  size="small"
                  danger
                />
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#000000' }}>
      <Header
        style={{
          background: '#000000',
          borderBottom: '1px solid #333333',
          padding: '0 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '56px',
          lineHeight: '56px'
        }}
      >
        <Title level={3} style={{ color: '#ffffff', margin: 0, fontSize: '18px' }}>
          LineAdmin
        </Title>
        <Dropdown menu={userMenu} trigger={['click']}>
          <Button
            type="text"
            icon={<MoreOutlined />}
            style={{ color: '#ffffff' }}
            size="small"
          />
        </Dropdown>
      </Header>

      <Content style={{ padding: '16px', background: '#000000' }}>
        <div className="responsive-container">
          <Card
            style={{
              background: '#000000',
              border: '1px solid #333333'
            }}
          >
            <div className="responsive-flex" style={{ marginBottom: 16 }}>
              <Title level={4} style={{ color: '#ffffff', margin: 0, fontSize: '16px' }}>
                จัดการผู้ใช้
              </Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddUser}
                size="small"
                style={{
                  backgroundColor: '#ffffff',
                  borderColor: '#ffffff',
                  color: '#000000',
                  whiteSpace: 'nowrap'
                }}
              >
                เพิ่มบัญชี
              </Button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <Table
                columns={columns}
                dataSource={users}
                rowKey="_id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: !isMobile,
                  showQuickJumper: !isMobile,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} จาก ${total} รายการ`,
                  size: isMobile ? 'small' : 'default'
                }}
                style={{
                  background: '#000000',
                  minWidth: isMobile ? '500px' : '600px'
                }}
                size={isMobile ? 'small' : 'default'}
                scroll={{ x: isMobile ? 500 : undefined }}
              />
            </div>
          </Card>

          <UserModal
            visible={modalVisible}
            mode={modalMode}
            editingUser={editingUser}
            onCancel={() => setModalVisible(false)}
            onSuccess={handleModalSuccess}
          />
        </div>
      </Content>
    </Layout>
  );
};

export default Dashboard;
