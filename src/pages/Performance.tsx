import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Select, Statistic, Table, Space, Modal, Spin } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { PlayCircleOutlined, DownloadOutlined, CheckCircleFilled } from '@ant-design/icons';
import { useApi } from '../context/ApiContext';
import { runPerformanceTest } from '../services/api';
import { Api } from '../types';

const { Option } = Select;

const Performance: React.FC = () => {
  const { apis } = useApi();
  const [selectedApi, setSelectedApi] = useState<string>('');
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [perfComplete, setPerfComplete] = useState(false);
  const [numRequests, setNumRequests] = useState<number>(20);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('latestPerformanceData');
    if (saved) {
      setPerformanceData(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage after each test
  useEffect(() => {
    if (performanceData) {
      localStorage.setItem('latestPerformanceData', JSON.stringify(performanceData));
    }
  }, [performanceData]);

  const handleRunPerformanceTest = async () => {
    if (!selectedApi) return;
    setLoading(true);
    try {
      const result = await runPerformanceTest(selectedApi, numRequests);
      setPerformanceData(result);
      setPerfComplete(true);
    } catch (error) {
      console.error('Performance test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!performanceData?.results) return [];
    
    return performanceData.results.map((result: any, index: number) => ({
      request: index + 1,
      responseTime: Math.round(result.response_time * 1000),
      success: result.success ? 1 : 0,
    }));
  };

  const getStatusDistribution = () => {
    if (!performanceData?.results) return [];
    
    const successful = performanceData.results.filter((r: any) => r.success).length;
    const failed = performanceData.results.length - successful;
    
    return [
      { name: 'Successful', value: successful, fill: '#52c41a' },
      { name: 'Failed', value: failed, fill: '#ff4d4f' },
    ];
  };

  const columns = [
    {
      title: 'Request #',
      dataIndex: 'index',
      key: 'index',
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Response Time (ms)',
      key: 'responseTime',
      render: (record: any) => Math.round(record.response_time * 1000),
      sorter: (a: any, b: any) => a.response_time - b.response_time,
    },
    {
      title: 'Status Code',
      dataIndex: 'status_code',
      key: 'status_code',
      render: (code: number) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          code < 300 ? 'bg-green-100 text-green-800' :
          code < 500 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {code}
        </span>
      ),
    },
    {
      title: 'Success',
      dataIndex: 'success',
      key: 'success',
      render: (success: boolean) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {success ? 'Yes' : 'No'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Performance Testing</h1>
      </div>

      {/* Test Configuration */}
<Card title="Configure Performance Test">
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
    <div style={{ flex: 1 }}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select API
      </label>
      <Select
        placeholder="Choose an API to test"
        style={{ width: '100%' }}
        value={selectedApi}
        onChange={setSelectedApi}
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ minWidth: 250 }}
      >
        {apis.map((api: Api) => (
          <Option key={api.id} value={api.id}>
            {api.name?.trim() ? api.name : api.url || 'Unnamed API'}
          </Option>
        ))}
      </Select>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Number of Requests
      </label>
      <input
        type="number"
        min={1}
        max={1000}
        value={numRequests}
        onChange={e => setNumRequests(Number(e.target.value))}
        className="ant-input"
        style={{ width: 120 }}
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        &nbsp;
      </label>
      <Button
        type="primary"
        icon={<PlayCircleOutlined />}
        onClick={handleRunPerformanceTest}
        loading={loading}
        disabled={!selectedApi || loading}
      >
        Run Performance Test
      </Button>
    </div>
  </div>
</Card>


      {/* Performance Metrics */}
      {performanceData && (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Average Response Time"
                  value={Math.round(performanceData.metrics.avg_response_time * 1000)}
                  suffix="ms"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Min Response Time"
                  value={Math.round(performanceData.metrics.min_response_time * 1000)}
                  suffix="ms"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Max Response Time"
                  value={Math.round(performanceData.metrics.max_response_time * 1000)}
                  suffix="ms"
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Success Rate"
                  value={performanceData.metrics.success_rate}
                  precision={1}
                  suffix="%"
                  valueStyle={{ 
                    color: performanceData.metrics.success_rate > 95 ? '#52c41a' : 
                           performanceData.metrics.success_rate > 80 ? '#faad14' : '#ff4d4f' 
                  }}
                />
              </Card>
            </Col>
          </Row>

          {/* Charts */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card title="Response Time Trend">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="request" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="responseTime" 
                      stroke="#1890ff" 
                      strokeWidth={2}
                      name="Response Time (ms)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Success Distribution">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getStatusDistribution()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1890ff" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {/* Detailed Results Table */}
          <Card 
            title="Detailed Results" 
            extra={
              <Button 
                icon={<DownloadOutlined />}
                onClick={() => {
                  const dataStr = JSON.stringify(performanceData, null, 2);
                  const dataBlob = new Blob([dataStr], {type: 'application/json'});
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'performance-results.json';
                  link.click();
                }}
              >
                Export
              </Button>
            }
          >
            <Table
              columns={columns}
              dataSource={performanceData.results}
              rowKey={(record, index) => index ?? 0}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
              scroll={{ x: 600 }}
            />
          </Card>
        </>
      )}

      {/* Loading Modal for Performance Test */}
      <Modal open={loading} footer={null} closable={false} centered>
        <div style={{ textAlign: 'center', padding: 32 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Running performance test...</div>
        </div>
      </Modal>
      <Modal open={perfComplete} footer={null} closable={true} centered onCancel={() => setPerfComplete(false)}>
        <div style={{ textAlign: 'center', padding: 24 }}>
          <CheckCircleFilled style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
          <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 16 }}>Performance test completed!</div>
          <Button
            type="primary"
            size="large"
            style={{ margin: '0 auto', display: 'block' }}
            onClick={() => setPerfComplete(false)}
          >
            Continue
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Performance;