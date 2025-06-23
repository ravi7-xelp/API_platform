import React, { useState } from 'react';
import { Table, Button, Tag, Space, Modal, Descriptions, Typography, Progress } from 'antd';
import { PlayCircleOutlined, EyeOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useApi } from '../context/ApiContext';
import { runApiTest, runPerformanceTest } from '../services/api';
import { Api } from '../types';

const { Text, Paragraph } = Typography;

const ApiList: React.FC = () => {
  const { apis, refreshApis } = useApi();
  const [selectedApi, setSelectedApi] = useState<Api | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [performanceModalVisible, setPerformanceModalVisible] = useState(false);
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
  const [performanceResults, setPerformanceResults] = useState<any>(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);

  const handleRunTest = async (api: Api) => {
    setRunningTests(prev => new Set(prev).add(api.id));
    try {
      await runApiTest(api.id);
      await refreshApis();
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(api.id);
        return newSet;
      });
    }
  };

  const handleViewDetails = (api: Api) => {
    setSelectedApi(api);
    setModalVisible(true);
  };

  const handleRunPerformanceTest = async (api: Api) => {
    setSelectedApi(api);
    setPerformanceModalVisible(true);
    setPerformanceLoading(true);
    try {
      const result = await runPerformanceTest(api.id, 10);
      setPerformanceResults(result);
    } catch (error) {
      console.error('Performance test failed:', error);
    } finally {
      setPerformanceLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'running': return 'processing';
      case 'pending': return 'default';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      render: (url: string) => (
        <Text code style={{ fontSize: '12px' }}>
          {url.length > 50 ? `${url.substring(0, 50)}...` : url}
        </Text>
      ),
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      render: (method: string) => (
        <Tag color={method === 'GET' ? 'blue' : method === 'POST' ? 'green' : 'orange'}>
          {method}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Response Time',
      key: 'responseTime',
      render: (record: Api) => {
        const responseTime = record.test_results?.response_time;
        return responseTime ? `${Math.round(responseTime * 1000)}ms` : '-';
      },
    },
    {
      title: 'Status Code',
      key: 'statusCode',
      render: (record: Api) => {
        const statusCode = record.test_results?.status_code;
        return statusCode ? (
          <Tag color={statusCode < 300 ? 'success' : statusCode < 500 ? 'warning' : 'error'}>
            {statusCode}
          </Tag>
        ) : '-';
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Api) => (
        <Space>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            size="small"
            onClick={() => handleRunTest(record)}
            loading={runningTests.has(record.id)}
          >
            Test
          </Button>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetails(record)}
          >
            Details
          </Button>
          <Button
            icon={<ClockCircleOutlined />}
            size="small"
            onClick={() => handleRunPerformanceTest(record)}
          >
            Performance
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">API Management</h1>
        <Button type="primary" onClick={refreshApis}>
          Refresh
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          dataSource={apis}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} APIs`,
          }}
        />
      </div>

      {/* API Details Modal */}
      <Modal
        title="API Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedApi && (
          <div className="space-y-4">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Name">{selectedApi.name}</Descriptions.Item>
              <Descriptions.Item label="URL">{selectedApi.url}</Descriptions.Item>
              <Descriptions.Item label="Method">
                <Tag color={selectedApi.method === 'GET' ? 'blue' : selectedApi.method === 'POST' ? 'green' : 'orange'}>
                  {selectedApi.method}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedApi.status)}>
                  {selectedApi.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {selectedApi.headers && Object.keys(selectedApi.headers).length > 0 && (
              <div>
                <Text strong>Headers:</Text>
                <Paragraph>
                  <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(selectedApi.headers, null, 2)}
                  </pre>
                </Paragraph>
              </div>
            )}

            {selectedApi.body && (
              <div>
                <Text strong>Request Body:</Text>
                <Paragraph>
                  <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto">
                    {typeof selectedApi.body === 'string' ? selectedApi.body : JSON.stringify(selectedApi.body, null, 2)}
                  </pre>
                </Paragraph>
              </div>
            )}

            {selectedApi.test_results && (
              <div>
                <Text strong>Test Results:</Text>
                <Descriptions bordered column={2} className="mt-2">
                  <Descriptions.Item label="Success">
                    <Tag color={selectedApi.test_results.success ? 'success' : 'error'}>
                      {selectedApi.test_results.success ? 'Yes' : 'No'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Status Code">
                    {selectedApi.test_results.status_code || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Response Time">
                    {selectedApi.test_results.response_time ? `${Math.round(selectedApi.test_results.response_time * 1000)}ms` : 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Error">
                    {selectedApi.test_results.error || 'None'}
                  </Descriptions.Item>
                </Descriptions>

                {selectedApi.test_results.response_body && (
                  <div className="mt-4">
                    <Text strong>Response Body:</Text>
                    <Paragraph>
                      <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto max-h-40">
                        {typeof selectedApi.test_results.response_body === 'string' 
                          ? selectedApi.test_results.response_body 
                          : JSON.stringify(selectedApi.test_results.response_body, null, 2)}
                      </pre>
                    </Paragraph>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Performance Test Modal */}
      <Modal
        title="Performance Test Results"
        open={performanceModalVisible}
        onCancel={() => setPerformanceModalVisible(false)}
        footer={null}
        width={600}
      >
        {performanceLoading ? (
          <div className="text-center py-8">
            <Progress type="circle" />
            <p className="mt-4">Running performance test...</p>
          </div>
        ) : performanceResults ? (
          <div className="space-y-4">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Total Requests">
                {performanceResults.metrics.total_requests}
              </Descriptions.Item>
              <Descriptions.Item label="Successful Requests">
                {performanceResults.metrics.successful_requests}
              </Descriptions.Item>
              <Descriptions.Item label="Success Rate">
                {performanceResults.metrics.success_rate.toFixed(2)}%
              </Descriptions.Item>
              <Descriptions.Item label="Avg Response Time">
                {Math.round(performanceResults.metrics.avg_response_time)}ms
              </Descriptions.Item>
              <Descriptions.Item label="Min Response Time">
                {Math.round(performanceResults.metrics.min_response_time)}ms
              </Descriptions.Item>
              <Descriptions.Item label="Max Response Time">
                {Math.round(performanceResults.metrics.max_response_time)}ms
              </Descriptions.Item>
            </Descriptions>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default ApiList;