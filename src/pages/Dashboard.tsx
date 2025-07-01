import React from 'react';
import { Card, Row, Col, Button, Upload, Statistic, Progress, Space, Modal, Input, message, Spin } from 'antd';
import { UploadOutlined, PlayCircleOutlined, FileTextOutlined, ApiOutlined, CheckCircleFilled } from '@ant-design/icons';
import { useApi } from '../context/ApiContext';
import { uploadFile, runAllApis, uploadCurlCommand, deleteAllApis } from '../services/api';

const Dashboard: React.FC = () => {
  const { apis, refreshApis } = useApi();

  // cURL upload state
  const [curlModalVisible, setCurlModalVisible] = React.useState(false);
  const [curlInput, setCurlInput] = React.useState('');
  const [curlLoading, setCurlLoading] = React.useState(false);

  const [fileLoading, setFileLoading] = React.useState(false);

  const [runAllLoading, setRunAllLoading] = React.useState(false);
  const [runAllComplete, setRunAllComplete] = React.useState(false);

  const handleFileUpload = async (file: File) => {
    setFileLoading(true);
    try {
      await uploadFile(file);
      await refreshApis();
      message.success('File uploaded and APIs parsed!');
    } catch (error) {
      message.error('Upload failed!');
      console.error('Upload failed:', error);
    } finally {
      setFileLoading(false);
    }
  };

  const handleRunAllTests = async () => {
    setRunAllLoading(true);
    try {
      await runAllApis();
      await refreshApis();
      setRunAllComplete(true);
    } catch (error) {
      console.error('Tests failed:', error);
    } finally {
      setRunAllLoading(false);
    }
  };

  const handleCurlUpload = async () => {
    setCurlLoading(true);
    try {
      await uploadCurlCommand(curlInput);
      setCurlModalVisible(false);
      setCurlInput('');
      message.success('cURL command uploaded and API added!');
      await refreshApis();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || 'Failed to upload cURL command');
    } finally {
      setCurlLoading(false);
    }
  };

  const getStatusCounts = () => {
    const counts = {
      total: apis.length,
      completed: apis.filter(api => api.status === 'completed').length,
      failed: apis.filter(api => api.status === 'failed').length,
      pending: apis.filter(api => api.status === 'pending').length,
      running: apis.filter(api => api.status === 'running').length,
    };
    return counts;
  };

  const statusCounts = getStatusCounts();
  const successRate = statusCounts.total > 0 ? (statusCounts.completed / statusCounts.total) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Space>
          <Button
            type="default"
            icon={<ApiOutlined />}
            onClick={() => setCurlModalVisible(true)}
          >
            Import cURL
          </Button>
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total APIs"
              value={statusCounts.total}
              prefix={<ApiOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Completed"
              value={statusCounts.completed}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Failed"
              value={statusCounts.failed}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Success Rate"
              value={successRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: successRate > 80 ? '#52c41a' : successRate > 60 ? '#faad14' : '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Progress Overview */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Test Progress" className="h-full">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Completed</span>
                  <span>{statusCounts.completed}/{statusCounts.total}</span>
                </div>
                <Progress 
                  percent={statusCounts.total > 0 ? (statusCounts.completed / statusCounts.total) * 100 : 0}
                  status="success"
                  showInfo={false}
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Failed</span>
                  <span>{statusCounts.failed}/{statusCounts.total}</span>
                </div>
                <Progress 
                  percent={statusCounts.total > 0 ? (statusCounts.failed / statusCounts.total) * 100 : 0}
                  status="exception"
                  showInfo={false}
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Running</span>
                  <span>{statusCounts.running}/{statusCounts.total}</span>
                </div>
                <Progress 
                  percent={statusCounts.total > 0 ? (statusCounts.running / statusCounts.total) * 100 : 0}
                  status="active"
                  showInfo={false}
                />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Quick Actions" className="h-full">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Upload API Collection</h3>
                <p className="text-blue-700 text-sm mb-3">
                  Upload Burp Suite XML files or JSON API definitions to start testing.
                </p>
                <Upload
                  accept=".xml,.json"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    handleFileUpload(file);
                    return false;
                  }}
                >
                  <Button type="primary" icon={<UploadOutlined />} block loading={fileLoading}>
                    Choose File
                  </Button>
                </Upload>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Run All Tests</h3>
                <p className="text-green-700 text-sm mb-3">
                  Execute all API tests in parallel and get comprehensive results.
                </p>
                <Button 
                  type="primary" 
                  icon={<PlayCircleOutlined />} 
                  block
                  onClick={handleRunAllTests}
                  disabled={statusCounts.total === 0 || runAllLoading}
                >
                  Start Testing
                </Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      {statusCounts.total > 0 && (
        <Card title="API Status Overview">
          <Row gutter={[16, 16]}>
            {apis.slice(0, 5).map((api) => (
              <Col xs={24} key={api.id}>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{api.name}</div>
                    <div className="text-sm text-gray-500">{api.method} {api.url}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {api.test_results?.response_time && (
                      <span className="text-sm text-gray-600">
                        {Math.round(api.test_results.response_time * 1000)}ms
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      api.status === 'completed' ? 'bg-green-100 text-green-800' :
                      api.status === 'failed' ? 'bg-red-100 text-red-800' :
                      api.status === 'running' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {api.status}
                    </span>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* cURL Upload Modal */}
      <Modal
        title="Import API from cURL Command"
        open={curlModalVisible}
        onCancel={() => setCurlModalVisible(false)}
        onOk={handleCurlUpload}
        okText="Import"
        confirmLoading={curlLoading}
      >
        <p>Paste your cURL command below to import an API (like Postman):</p>
        <Input.TextArea
          rows={6}
          value={curlInput}
          onChange={e => setCurlInput(e.target.value)}
          placeholder={`curl -X POST https://api.example.com/endpoint -H 'Authorization: Bearer ...' -d '{"key":"value"}'`}
        />
      </Modal>

      {/* Loading Modal for Run All */}
      <Modal open={runAllLoading} footer={null} closable={false} centered>
        <div style={{ textAlign: 'center', padding: 32 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Running all API tests...</div>
        </div>
      </Modal>
      <Modal open={runAllComplete} footer={null} closable={true} centered onCancel={() => setRunAllComplete(false)}>
        <div style={{ textAlign: 'center', padding: 24 }}>
          <CheckCircleFilled style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
          <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 16 }}>All API tests completed!</div>
          <Button
            type="primary"
            size="large"
            style={{ margin: '0 auto', display: 'block' }}
            onClick={() => setRunAllComplete(false)}
          >
            Continue
          </Button>
        </div>
      </Modal>

      {fileLoading && (
        <div className="flex justify-center items-center mt-4">
          <Spin tip="Uploading and parsing..." size="large" />
        </div>
      )}
    </div>
  );
};

export default Dashboard;