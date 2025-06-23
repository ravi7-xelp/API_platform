import React, { useEffect, useState } from 'react';
import { Table, Button, InputNumber, Input, Space, Tooltip, Progress } from 'antd';
import { getApis } from '../services/api';
import { startLoadTest, stopLoadTest, getLoadTestStatus, downloadLoadTestReport } from '../services/loadtest';
import { Api } from '../types';

const LoadTesting: React.FC = () => {
  const [apis, setApis] = useState<Api[]>([]);
  const [selectedApi, setSelectedApi] = useState<Api | null>(null);
  const [concurrentUsers, setConcurrentUsers] = useState(1);
  const [totalRequests, setTotalRequests] = useState(10);
  const [headers, setHeaders] = useState('');
  const [body, setBody] = useState('');
  const [testing, setTesting] = useState(false);
  const [progress, setProgress] = useState<any>({});
  const [intervalId, setIntervalId] = useState<any>(null);

  useEffect(() => {
    getApis().then(setApis);
  }, []);

  const startTest = async () => {
    if (!selectedApi) return;
    setTesting(true);
    setProgress({});
    await startLoadTest({
      url: selectedApi.url,
      method: selectedApi.method,
      concurrent_users: concurrentUsers,
      total_requests: totalRequests,
      headers: headers ? JSON.parse(headers) : {},
      body: body ? JSON.parse(body) : undefined,
    });
    const id = setInterval(async () => {
      const { data } = await getLoadTestStatus();
      setProgress(data);
    }, 1000);
    setIntervalId(id);
  };

  const stopTestHandler = async () => {
    await stopLoadTest();
    setTesting(false);
    if (intervalId) clearInterval(intervalId);
  };

  const downloadReport = async (format: 'csv' | 'json') => {
    const { data } = await downloadLoadTestReport(format);
    if (format === 'csv') {
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'loadtest_report.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'loadtest_report.json';
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const columns = [
    {
      title: 'API URL',
      dataIndex: 'url',
      key: 'url',
      render: (url: string) => (
        <Tooltip title={url}>
          <span style={{ maxWidth: 200, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
    },
    {
      title: 'Select',
      key: 'select',
      render: (_: any, record: Api) => (
        <Button type={selectedApi?.id === record.id ? 'primary' : 'default'} onClick={() => setSelectedApi(record)}>
          Select
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Load Testing</h1>
      <Table
        dataSource={apis}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 8 }}
      />
      {selectedApi && (
        <div className="mt-6 p-4 bg-white rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Configure Load Test</h2>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <span>Concurrent Users: </span>
              <InputNumber
  min={1}
  max={1000}
  value={concurrentUsers}
  onChange={(value) => setConcurrentUsers(value ?? 0)}
/>
            </div>
            <div>
              <span>Total Requests: </span>
              <InputNumber
  min={1}
  max={100000}
  value={totalRequests}
  onChange={(value) => setTotalRequests(value ?? 0)}
/>
            </div>
            <div>
              <span>Headers (JSON): </span>
              <Input.TextArea rows={2} value={headers} onChange={e => setHeaders(e.target.value)} placeholder='{"Authorization": "Bearer ..."}' />
            </div>
            {(selectedApi.method === 'POST' || selectedApi.method === 'PUT') && (
              <div>
                <span>Body (JSON): </span>
                <Input.TextArea rows={2} value={body} onChange={e => setBody(e.target.value)} placeholder='{"key": "value"}' />
              </div>
            )}
            <Space>
              <Button type="primary" onClick={startTest} disabled={testing}>Start Test</Button>
              <Button onClick={stopTestHandler} disabled={!testing}>Stop Test</Button>
              <Button onClick={() => downloadReport('csv')}>Download CSV</Button>
              <Button onClick={() => downloadReport('json')}>Download JSON</Button>
            </Space>
          </Space>
          {testing && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Live Progress</h3>
              <Progress percent={progress.total_requests ? (Number(progress.total_requests) / totalRequests) * 100 : 0} />
              <div className="mt-2 text-sm">
                <div>Requests/sec: {progress.requests_per_second}</div>
                <div>Avg Response Time: {progress.avg_response_time} ms</div>
                <div>Min Response Time: {progress.min_response_time} ms</div>
                <div>Max Response Time: {progress.max_response_time} ms</div>
                <div>Failures: {progress.failures}</div>
                <div>Total Requests: {progress.total_requests}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LoadTesting;