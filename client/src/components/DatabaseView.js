import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Spin, Alert, Button, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

const DatabaseView = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [pagination, setPagination] = useState({});

  const fetchTables = async () => {
    setLoading(true);
    try {
      // First get all table names
      const tablesResponse = await axios.get('http://localhost:5001/api/db/tables');
      const tableNames = tablesResponse.data.map(row => Object.values(row)[0]);
      
      // Then fetch data for each table
      const tablesData = await Promise.all(
        tableNames.map(async (tableName) => {
          const response = await axios.get(`http://localhost:5001/api/db/table/${tableName}`);
          const responseData = response.data.data || response.data;
          return {
            name: tableName,
            data: responseData,
            columns: responseData.length > 0 
              ? Object.keys(responseData[0]).map(key => ({
                  title: key,
                  dataIndex: key,
                  key: key,
                  sorter: (a, b) => {
                    // Handle different data types for sorting
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
              : [],
            pagination: response.data.pagination
          };
        })
      );
      
      setTables(tablesData);
      setLastRefresh(new Date());
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleRefresh = () => {
    fetchTables();
  };

  const handleTableChange = async (tableName, pagination, filters, sorter) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5001/api/db/table/${tableName}`,
        {
          params: {
            page: pagination.current,
            pageSize: pagination.pageSize
          }
        }
      );
      
      // Update just this specific table's data
      setTables(prevTables => 
        prevTables.map(table => 
          table.name === tableName 
            ? {
                ...table,
                data: response.data.data || response.data,
                pagination: response.data.pagination
              }
            : table
        )
      );
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading && tables.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Loading database tables...</p>
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
        <Title level={2} style={{ margin: 0 }}>Database Tables</Title>
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
      {tables.map((table, index) => (
        <Card 
          key={index} 
          title={table.name.toUpperCase()} 
          style={{ marginBottom: '20px', position: 'relative', zIndex: tables.length - index }}
          headStyle={{ backgroundColor: '#f0f2f5' }}
          extra={
            <span style={{ color: '#666' }}>
              {table.data.length} rows
            </span>
          }
        >
          <Table
            dataSource={table.data}
            columns={table.columns}
            rowKey={(record) => Object.values(record).join('-')}
            pagination={{ 
              defaultPageSize: 5,
              pageSizeOptions: ['5', '10', '20', '50'],
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Total ${total} items`,
              position: ['bottomCenter']
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

export default DatabaseView; 