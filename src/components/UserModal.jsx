import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, message, Button, Space } from 'antd';
import { usersAPI } from '../services/api';

// Custom hook for responsive behavior
const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile };
};

const { Option } = Select;

const UserModal = ({ 
  visible, 
  onCancel, 
  onSuccess, 
  editingUser = null,
  mode = 'create' // 'create' or 'edit'
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { isMobile } = useResponsive();

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && editingUser) {
        // Set form values for editing
        form.setFieldsValue({
          user: editingUser.user,
          role: editingUser.role,
          password: '' // Don't show existing password
        });
      } else {
        // Reset form for creating
        form.resetFields();
      }
    }
  }, [visible, mode, editingUser, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      let result;
      if (mode === 'create') {
        result = await usersAPI.create(values);
        message.success('เพิ่มผู้ใช้สำเร็จ');
      } else {
        // For editing, only send password if it's not empty
        const updateData = { role: values.role };
        if (values.password && values.password.trim()) {
          updateData.password = values.password;
        }
        
        result = await usersAPI.update(editingUser._id, updateData);
        message.success('อัปเดตผู้ใช้สำเร็จ');
      }

      if (result.success) {
        form.resetFields();
        onSuccess();
      }
    } catch (error) {
      console.error('User modal error:', error);
      const errorMessage = error.response?.data?.message || 
        (mode === 'create' ? 'เกิดข้อผิดพลาดในการเพิ่มผู้ใช้' : 'เกิดข้อผิดพลาดในการอัปเดตผู้ใช้');
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={mode === 'create' ? 'เพิ่มผู้ใช้ใหม่' : 'แก้ไขผู้ใช้'}
      open={visible}
      onCancel={handleCancel}
      destroyOnClose
      width={isMobile ? '90%' : 520}
      style={{
        top: isMobile ? '10%' : '20%'
      }}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        size="large"
      >
        <Form.Item
          label="ชื่อผู้ใช้"
          name="user"
          rules={[
            { required: true, message: 'กรุณากรอกชื่อผู้ใช้' },
            { min: 3, message: 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร' },
            { max: 50, message: 'ชื่อผู้ใช้ต้องไม่เกิน 50 ตัวอักษร' }
          ]}
        >
          <Input 
            placeholder="กรอกชื่อผู้ใช้"
            disabled={mode === 'edit'} // Don't allow username change in edit mode
            style={{
              height: '40px'
            }}
          />
        </Form.Item>

        <Form.Item
          label={mode === 'create' ? 'รหัสผ่าน' : 'รหัสผ่านใหม่ (เว้นว่างหากไม่ต้องการเปลี่ยน)'}
          name="password"
          rules={mode === 'create' ? [
            { required: true, message: 'กรุณากรอกรหัสผ่าน' },
            { min: 4, message: 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร' }
          ] : [
            { min: 4, message: 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร' }
          ]}
        >
          <Input.Password 
            placeholder={mode === 'create' ? 'กรอกรหัสผ่าน' : 'กรอกรหัสผ่านใหม่ (ถ้าต้องการเปลี่ยน)'}
            style={{
              height: '40px'
            }}
          />
        </Form.Item>

        <Form.Item
          label="บทบาท"
          name="role"
          rules={[
            { required: true, message: 'กรุณาเลือกบทบาท' }
          ]}
        >
          <Select 
            placeholder="เลือกบทบาท"
            style={{
              height: '40px'
            }}
          >
            <Option value="Admin">Admin</Option>
            <Option value="User">User</Option>
          </Select>
        </Form.Item>
      </Form>

      {/* Custom Footer Buttons */}
      <div style={{ 
        marginTop: 24, 
        paddingTop: 16, 
        borderTop: '1px solid #333333',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px'
      }}>
        <Button
          onClick={handleCancel}
          style={{
            height: '40px',
            minWidth: '80px',
            borderRadius: '6px',
            border: '1px solid #333333',
            backgroundColor: 'transparent',
            color: '#ffffff',
            fontWeight: '500',
            fontSize: '14px'
          }}
        >
          ยกเลิก
        </Button>
        <Button
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          style={{
            height: '38px',
            minWidth: '80px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#ffffff',
            color: '#000000',
            fontWeight: '500',
            fontSize: '14px'
          }}
        >
          {mode === 'create' ? 'เพิ่ม' : 'บันทึก'}
        </Button>
      </div>
    </Modal>
  );
};

export default UserModal;
