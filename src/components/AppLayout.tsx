import React from 'react';
import { Layout, Menu, Typography, ConfigProvider } from 'antd';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarRange, 
  FileText, 
  BarChart3,
  GraduationCap
} from 'lucide-react';
import zhCN from 'antd/locale/zh_CN';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <LayoutDashboard size={18} />,
      label: '仪表盘',
    },
    {
      key: '/students',
      icon: <Users size={18} />,
      label: '学生管理',
    },
    {
      key: '/activities',
      icon: <CalendarRange size={18} />,
      label: '活动管理',
    },
    {
      key: '/transcript',
      icon: <FileText size={18} />,
      label: '个人成绩单',
    },
    {
      key: '/reports',
      icon: <BarChart3 size={18} />,
      label: '报表导出',
    },
  ];

  return (
    <ConfigProvider locale={zhCN}>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider width={240} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
          <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', gap: '12px' }}>
            <GraduationCap size={32} color="#1677ff" />
            <Title level={4} style={{ margin: 0, fontSize: '18px' }}>第二课堂</Title>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ borderRight: 0 }}
          />
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
            <Title level={5} style={{ margin: 0 }}>
              {menuItems.find(item => item.key === location.pathname)?.label || '管理后台'}
            </Title>
          </Header>
          <Content style={{ margin: '24px', minHeight: 280, overflow: 'initial' }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default AppLayout;
