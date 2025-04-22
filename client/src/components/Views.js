import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Spin, Alert, Button, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

const Views = () => {
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const viewNames = [
    'flights_in_the_air',
    'flights_on_the_ground',
    'people_in_the_air',
    'people_on_the_ground',
    'route_summary',
    'alternative_airports'
  ];

  const fetchViews = async () => {
    setLoading(true);
    try {
      const viewsData = await Promise.all(
        viewNames.map(async (viewName) => {
          const response = await axios.get(`http://localhost:5001/api/views/${viewName}`);
          return {
            name: viewName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            data: response.data,
            columns: response.data.length > 0 
              ? Object.keys(response.data[0]).map(key => ({
                  title: key,
                  dataIndex: key,
                  key: key,
                  sorter: (a, b) => {
                    const aValue = a[key];
                    const bValue = b[key];
                    
                    if (typeof aValue === 'number' && typeof bValue === 'number') {
                      return aValue - bValue;
                    }
                    
                    if (typeof aValue === 'string' && typeof bValue === 'string') {
                      return aValue.localeCompare(bValue);
                    }
                    
                    return String(aValue).localeCompare(String(bValue));
                  },
                  sortDirections: ['descend', 'ascend'],
                }))
              : []
          };
        })
      );
      
      setViews(viewsData);
      setLastRefresh(new Date());
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViews();
  }, []);

  const handleRefresh = () => {
    fetchViews();
  };

  if (loading && views.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Loading database views...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        style={{ margin: '20px' }}
      />
    );
  }

  return (
    <div style={{ padding: '10px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <Title level={2} style={{ margin: 0 }}>Database Views</Title>
        <Space>
          <Button 
            type="primary" 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </Button>
          <span style={{ color: '#666' }}>
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
        </Space>
      </div>
      {views.map((view, index) => (
        <Card 
          key={index} 
          title={view.name} 
          style={{ marginBottom: '20px' }}
          headStyle={{ backgroundColor: '#f0f2f5' }}
          extra={
            <span style={{ color: '#666' }}>
              {view.data.length} rows
            </span>
          }
        >
          <Table
            dataSource={view.data}
            columns={view.columns}
            rowKey={(record) => Object.values(record).join('-')}
            pagination={{ 
              defaultPageSize: 5,
              pageSizeOptions: ['5', '10', '20', '50'],
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Total ${total} items`,
              dropdownStyle: { 
                zIndex: 9999,
                position: 'absolute'
              }
            }}
            scroll={{ x: true }}
            size="small"
            loading={loading}
          />
        </Card>
      ))}
    </div>
  );
};

export default Views; 