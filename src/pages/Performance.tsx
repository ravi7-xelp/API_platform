import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Button, Select, message } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useApi } from '../context/ApiContext';
import { runPerformanceTest } from '../services/api';
import { Api } from '../types';

const { Option } = Select;

const Performance: React.FC = () => {
  const { apis } = useApi();
  const [selectedApi, setSelectedApi] = useState<string>('');
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<any>({});

  const completedApis = apis.filter(api => api.test_results);

  const handleRunPerformanceTest = async () => {
    if (!selectedApi) {
      message.warning('Please select an API first');
      return;
    }

    try {
      setLoading(true);
      const response = await runPerformanceTest(selectedApi, 20);
      const { metrics, results } = response.data;
      
      setMetrics(metrics);
      
      // Transform results for chart
      const chartData = results.map((result: any, index: number) => ({
        request: index + 1,
        responseTime: Math.round(result.response_time * 1000),
        success: result.success ? 1 : 0,
        statusCode: result.status_code,
      }));
      
      setPerformanceData(chartData);
      message.success('Performance test completed!');
    } catch (error) {
      message.error('Performance test failed');
      console.error('Performance test error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate overall statistics from completed APIs
  const overallStats = {
    totalApis: apis.length,
    completedApis: completedApis.length,
    avgResponseTime: completedApis.length > 0 
      ? Math.round(completedApis.reduce((sum, api) => sum + (api.test_results?.response_time || 0), 0) / completedApis.length * 1000)
      : 0,
    successRate: completedApis.length > 0
      ? Math.round(completedApis.filter(api => api.test_results?.success).length / completedApis.length * 100)
      : 0,
  };

  const apiTableColumns = [
    {
      title: 'API Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => name || 'Unnamed API',
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
    },
    {
      title: 'Response Time (ms)',
      key: 'response_time',
      render: (_, record: Api) => 
        record.test_results?.response_time 
          ? Math.round(record.test_results.response_time * 1000)
          : '-',
      sorter: (a: Api, b: Api) => 
        (a.test_results?.response_time || 0) - (b.test_results?.response_time || 0),
    },
    {
      title: 'Status Code',
      key: 'status_code',
      render: (_, record: Api) => record.test_results?.status_code || '-',
    },
    {
      title: 'Success',
      key: 'success',
      render: (_, record: Api) => 
        record.test_results?.success ? '✅' : '❌',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Performance Analysis</h1>
      </div>

      {/* Overall Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total APIs"
              value={overallStats.totalApis}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tested APIs"
              value={overallStats.completedApis}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Avg Response Time"
              value={overallStats.avgResponseTime}
              suffix="ms"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Success Rate"
              value={overallStats.successRate}
              suffix="%"
              valueStyle={{ 
                color: overallStats.successRate > 80 ? '#52c41a' : 
                       overallStats.successRate > 50 ? '#faad14' : '#f5222d' 
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Performance Testing Section */}
      <Card title="Run Performance Test">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Select
              placeholder="Select an API to test"
              style={{ width: 400 }}
              value={selectedApi}
              onChange={setSelectedApi}
            >
              {apis.map(api => (
                <Option key={api.id} value={api.id}>
                  {api.name || 'Unnamed API'} - {api.method} {api.url}
                </Option>
              ))}
            </Select>
            <Button 
              type="primary" 
              onClick={handleRunPerformanceTest}
              loading={loading}
              disabled={!selectedApi}
            >
              Run Performance Test (20 requests)
            </Button>
          </div>

          {metrics.avg_response_time && (
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card size="small">
                  <Statistic
                    title="Avg Response Time"
                    value={Math.round(metrics.avg_response_time)}
                    suffix="ms"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card size="small">
                  <Statistic
                    title="Min Response Time"
                    value={Math.round(metrics.min_response_time)}
                    suffix="ms"
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card size="small">
                  <Statistic
                    title="Max Response Time"
                    value={Math.round(metrics.max_response_time)}
                    suffix="ms"
                    valueStyle={{ color: '#f5222d' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card size="small">
                  <Statistic
                    title="Success Rate"
                    value={Math.round(metrics.success_rate)}
                    suffix="%"
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
            </Row>
          )}
        </div>
      </Card>

      {/* Performance Charts */}
      {performanceData.length > 0 && (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Response Time Trend">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
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
          <Col xs={24} lg={12}>
            <Card title="Success Rate Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="request" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="success" 
                    fill="#52c41a"
                    name="Success (1=Success, 0=Failure)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      )}

      {/* API Performance Table */}
      <Card title="API Performance Summary">
        <Table
          columns={apiTableColumns}
          dataSource={completedApis}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default Performance;