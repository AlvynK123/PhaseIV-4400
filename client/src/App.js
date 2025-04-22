import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Layout, Menu, Typography, Space } from 'antd';
import { DatabaseOutlined, SettingOutlined, EyeOutlined } from '@ant-design/icons';
import './App.css';
import StoredProcedures from './components/StoredProcedures';
import DatabaseView from './components/DatabaseView';
import Views from './components/Views';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

function App() {
  const [currentTab, setCurrentTab] = useState('database');

  const menuItems = [
    {
      key: 'database',
      icon: <DatabaseOutlined />,
      label: 'Database',
    },
    {
      key: 'procedures',
      icon: <SettingOutlined />,
      label: 'Stored Procedures',
    },
    {
      key: 'views',
      icon: <EyeOutlined />,
      label: 'Views',
    },
  ];

  const renderContent = () => {
    switch (currentTab) {
      case 'database':
        return <DatabaseView />;
      case 'procedures':
        return <StoredProcedures />;
      case 'views':
        return <Views />;
      default:
        return <DatabaseView />;
    }
  };

  return (
    <Layout className="App">
      <Header className="app-header" style={{ 
        position: 'fixed', 
        width: '100%', 
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
      }}>
        <div className="header-content">
          <Space align="center">
            <span className="header-logo" style={{ fontSize: '24px' }}>✈️</span>
            <Title level={3} className="header-title">Flight Management System</Title>
          </Space>
        </div>
      </Header>
      
      <Layout style={{ marginTop: 64 }}>
        <div className="floating-sidebar">
          <Sider width={200} className="site-layout-background" style={{ 
            height: 'calc(100vh - 64px)', 
            position: 'fixed',
            left: 0,
            top: 64,
            overflow: 'auto',
            boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
            zIndex: 10,
            borderRadius: '0 8px 8px 0'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Menu
                mode="inline"
                selectedKeys={[currentTab]}
                style={{ flex: 1, borderRight: 0 }}
                items={menuItems}
                onClick={({ key }) => setCurrentTab(key)}
              />
              <div style={{ 
                padding: '16px', 
                borderTop: '1px solid #f0f0f0',
                fontSize: '12px',
                color: '#666',
                textAlign: 'left',
                lineHeight: '1.5'
              }}>
                <Text type="secondary">
                  CS 4400 Phase IV:<br />
                  Victor Shin<br />
                  Alvyn Kwon<br />
                  Tracy Xie<br />
                  Wesley Jeong
                </Text>
              </div>
            </div>
          </Sider>
        </div>
        
        <Layout style={{ marginLeft: 200 }}>
          <Content className="site-layout-content" style={{ 
            minHeight: 'calc(100vh - 64px)',
            padding: '24px 20px 0'
          }}>
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default App;
