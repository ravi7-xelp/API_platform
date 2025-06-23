import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Progress, Button, Upload, message } from 'antd';
import { UploadOutlined, PlayCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { useApi } from '../context/ApiContext';
import { uploadFile, runAllApis, getTestReport } from '../services/api';

const Dashboard: React.FC = () => {
  const { apis, refreshApis, loading } = useApi();
  const [uploading, setUploading] = useState(false);
  const [running, setRunning] = useState(false);

  const statusCounts = {
    total: apis.length,
    completed: apis.filter(api => api.status === 'completed').length,
    failed: apis.filter(api => api.status === 'failed').length,
    running: apis.filter(api => api.status === 'running').length,
    pending: apis.filter(api => api.status === 'pending').length,
  };

  const successRate = statusCounts.total > 0 
    ? Math.round((statusCounts.completed / statusCounts.total) * 100) 
    : 0;

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      await uploadFile(file);
      message.success('File uploaded and APIs tested successfully!');
      await refreshApis();
    } catch (error) {
      message.error('Failed to upload file');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleRunAll = async () => {
    try {
      setRunning(true);
      await runAllApis();
      message.success('All API tests completed!');
      await refreshApis();
    } catch (error) {
      message.error('Failed to run tests');
      console.error('Run all error:', error);
    } finally {
      setRunning(false);
    }
  };

  const handleViewReport = async () => {
    try {
      window.open('http://localhost:8000/apis/report', '_blank');
    } catch (error) {
      message.error('Failed to open report');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="space-x-4">
          <Upload
            accept=".xml,.json"
            showUploadList={false}
            beforeUpload={(file) => {
              handleFileUpload(file);
              return false;
            }}
          >
            <Button 
              icon={<UploadOutlined />} 
              loading={uploading}
              type="primary"
            >
              Upload APIs
            </Button>
          </Upload>
          <Button 
            icon={<PlayCircleOutlined />} 
            onClick={handleRunAll}
            loading={running}
            disabled={statusCounts.total === 0}
          >
            Run All Tests
          </Button>
          <Button 
            icon={<FileTextOutlined />} 
            onClick={handleViewReport}
            disabled={statusCounts.total === 0}
          >
            View Report
          </Button>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total APIs"
              value={statusCounts.total}
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
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Success Rate"
              value={successRate}
              suffix="%"
              valueStyle={{ color: successRate > 80 ? '#52c41a' : successRate > 50 ? '#faad14' : '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Test Status Overview" className="h-full">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Completed</span>
                  <span>{statusCounts.completed}/{statusCounts.total}</span>
                </div>
                <Progress 
                  percent={statusCounts.total > 0 ? (statusCounts.completed / statusCounts.total) * 100 : 0} 
                  strokeColor="#52c41a"
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
                  strokeColor="#f5222d"
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
                  strokeColor="#1890ff"
                  showInfo={false}
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Pending</span>
                  <span>{statusCounts.pending}/{statusCounts.total}</span>
                </div>
                <Progress 
                  percent={statusCounts.total > 0 ? (statusCounts.pending / statusCounts.total) * 100 : 0} 
                  strokeColor="#faad14"
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
                  Upload Burp Suite XML exports or JSON files containing API definitions
                </p>
                <Upload
                  accept=".xml,.json"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    handleFileUpload(file);
                    return false;
                  }}
                >
                  <Button icon={<UploadOutlined />} loading={uploading}>
                    Choose File
                  </Button>
                </Upload>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Run All Tests</h3>
                <p className="text-green-700 text-sm mb-3">
                  Execute all API tests in parallel and get comprehensive results
                </p>
                <Button 
                  icon={<PlayCircleOutlined />} 
                  onClick={handleRunAll}
                  loading={running}
                  disabled={statusCounts.total === 0}
                  type="primary"
                >
                  Start Testing
                </Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;