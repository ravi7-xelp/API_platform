import React, { useState } from 'react';
import { Table, Button, Tag, Space, Modal, Descriptions, Typography, message, Tooltip } from 'antd';
import { PlayCircleOutlined, EyeOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useApi } from '../context/ApiContext';
import { runApiTest, runPerformanceTest } from '../services/api';
import { Api, TestResult } from '../types';

const { Text, Paragraph } = Typography;

const ApiList: React.FC = () => {
  const { apis, refreshApis } = useApi();
  const [selectedApi, setSelectedApi] = useState<Api | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'running': return 'processing';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const handleRunTest = async (apiId: string) => {
    try {
      setRunningTests(prev => new Set(prev).add(apiId));
      await runApiTest(apiId);
      message.success('Test completed successfully!');
      await refreshApis();
    } catch (error) {
      message.error('Test failed');
      console.error('Test error:', error);
    } finally {
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(apiId);
        return newSet;
      });
    }
  };

  const handlePerformanceTest = async (apiId: string) => {
    try {
      setRunningTests(prev => new Set(prev).add(apiId));
      await runPerformanceTest(apiId, 10);
      message.success('Performance test completed!');
      await refreshApis();
    } catch (error) {
      message.error('Performance test failed');
      console.error('Performance test error:', error);
    } finally {
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(apiId);
        return newSet;
      });
    }
  };

  const showDetails = (api: Api) => {
    setSelectedApi(api);
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Text strong>{name || 'Unnamed API'}</Text>
      ),
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      render: (url: string) => (
        <Tooltip title={url}>
          <Text code style={{ maxWidth: 300, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {url}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      render: (method: string) => (
        <Tag color={method === 'GET' ? 'blue' : method === 'POST' ? 'green' : method === 'PUT' ? 'orange' : 'red'}>
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
      key: 'response_time',
      render: (_, record: Api) => (
        record.test_results?.response_time 
          ? `${Math.round(record.test_results.response_time * 1000)}ms`
          : '-'
      ),
    },
    {
      title: 'Status Code',
      key: 'status_code',
      render: (_, record: Api) => (
        record.test_results?.status_code 
          ? <Tag color={record.test_results.status_code < 300 ? 'success' : 'error'}>
              {record.test_results.status_code}
            </Tag>
          : '-'
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: Api) => (
        <Space>
          <Button
            icon={<PlayCircleOutlined />}
            onClick={() => handleRunTest(record.id)}
            loading={runningTests.has(record.id)}
            size="small"
            type="primary"
          >
            Test
          </Button>
          <Button
            icon={<ClockCircleOutlined />}
            onClick={() => handlePerformanceTest(record.id)}
            loading={runningTests.has(record.id)}
            size="small"
          >
            Performance
          </Button>
          <Button
            icon={<EyeOutlined />}
            onClick={() => showDetails(record)}
            size="small"
          >
            Details
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">API List</h1>
        <div className="text-sm text-gray-600">
          Total: {apis.length} APIs
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={apis}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        scroll={{ x: 1000 }}
      />

      <Modal
        title="API Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedApi && (
          <div className="space-y-4">
            <Descriptions title="Basic Information" bordered column={2}>
              <Descriptions.Item label="Name" span={2}>
                {selectedApi.name || 'Unnamed API'}
              </Descriptions.Item>
              <Descriptions.Item label="URL" span={2}>
                <Text code>{selectedApi.url}</Text>
              </Descriptions.Item>
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
                <h4 className="font-semibold mb-2">Headers</h4>
                <Paragraph>
                  <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(selectedApi.headers, null, 2)}
                  </pre>
                </Paragraph>
              </div>
            )}

            {selectedApi.body && (
              <div>
                <h4 className="font-semibold mb-2">Request Body</h4>
                <Paragraph>
                  <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">
                    {typeof selectedApi.body === 'string' 
                      ? selectedApi.body 
                      : JSON.stringify(selectedApi.body, null, 2)
                    }
                  </pre>
                </Paragraph>
              </div>
            )}

            {selectedApi.test_results && (
              <div>
                <h4 className="font-semibold mb-2">Test Results</h4>
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="Success">
                    <Tag color={selectedApi.test_results.success ? 'success' : 'error'}>
                      {selectedApi.test_results.success ? 'Yes' : 'No'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Status Code">
                    {selectedApi.test_results.status_code || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Response Time">
                    {selectedApi.test_results.response_time 
                      ? `${Math.round(selectedApi.test_results.response_time * 1000)}ms`
                      : 'N/A'
                    }
                  </Descriptions.Item>
                  <Descriptions.Item label="Error">
                    {selectedApi.test_results.error || 'None'}
                  </Descriptions.Item>
                </Descriptions>

                {selectedApi.test_results.response_body && (
                  <div className="mt-4">
                    <h5 className="font-medium mb-2">Response Body</h5>
                    <Paragraph>
                      <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto max-h-60">
                        {typeof selectedApi.test_results.response_body === 'string'
                          ? selectedApi.test_results.response_body
                          : JSON.stringify(selectedApi.test_results.response_body, null, 2)
                        }
                      </pre>
                    </Paragraph>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ApiList;