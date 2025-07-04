import React, { useState, useEffect } from 'react';
import { Modal, Input, Select, Button, Form, message } from 'antd';
import { getFolders, createFolder, recordTestCase, saveTestCase } from '../services/api';
import { Folder } from '../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const GenerateTestCaseModal: React.FC<Props> = ({ visible, onClose, onSuccess }) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [newFolder, setNewFolder] = useState('');
  const [testCaseName, setTestCaseName] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'record' | 'save'>('record');

  useEffect(() => {
    if (visible) {
      setStep('record');
      setFolders([]);
      setSelectedFolder(null);
      setNewFolder('');
      setTestCaseName('');
      setUrl('');
      fetchFolders();
    }
  }, [visible]);

  const fetchFolders = async () => {
    const data = await getFolders();
    setFolders(data);
  };

  const handleCreateFolder = async () => {
    if (!newFolder) return;
    try {
      const folder = await createFolder(newFolder);
      setFolders([...folders, folder]);
      setSelectedFolder(folder.id);
      setNewFolder('');
      message.success('Folder created');
    } catch (e) {
      message.error('Failed to create folder');
    }
  };

  const handleStartRecording = async () => {
    if (!url) {
      message.error('Please enter a URL to record');
      return;
    }
    setLoading(true);
    try {
      await recordTestCase(url);
      setStep('save');
      message.success('Recording complete. Please save your test case.');
    } catch (e) {
      message.error('Failed to record test case');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!testCaseName || !selectedFolder) {
      message.error('Please select a folder and enter a test case name');
      return;
    }
    setLoading(true);
    try {
      let finalName = testCaseName;
      if (!finalName.startsWith('test_')) {
        finalName = 'test_' + finalName;
      }
      await saveTestCase(finalName, selectedFolder);
      message.success('Test case saved!');
      onSuccess();
      onClose();
    } catch (e) {
      message.error('Failed to save test case');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={visible} onCancel={onClose} footer={null} title="Generate Test Case">
      {step === 'record' ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Form layout="vertical" style={{ maxWidth: 400, margin: '0 auto' }}>
            <Form.Item label="Enter URL to record" required>
              <Input
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com/login"
                autoFocus
              />
            </Form.Item>
            <Button type="primary" loading={loading} onClick={handleStartRecording} block>
              Start Recording
            </Button>
          </Form>
        </div>
      ) : (
        <Form layout="vertical" style={{ maxWidth: 400, margin: '0 auto' }}>
          <Form.Item label="Select Folder">
            <Select
              value={selectedFolder ?? undefined}
              onChange={setSelectedFolder}
              style={{ width: '100%' }}
              placeholder="Select a folder"
              dropdownRender={menu => (
                <>
                  {menu}
                  <div style={{ display: 'flex', gap: 8, padding: 8 }}>
                    <Input
                      placeholder="New folder name"
                      value={newFolder}
                      onChange={e => setNewFolder(e.target.value)}
                      onPressEnter={handleCreateFolder}
                    />
                    <Button type="link" onClick={handleCreateFolder}>Add</Button>
                  </div>
                </>
              )}
            >
              {folders.map(folder => (
                <Select.Option key={folder.id} value={folder.id}>{folder.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Test Case Name">
            <Input
              value={testCaseName}
              onChange={e => setTestCaseName(e.target.value)}
              placeholder="e.g. login_valid_cred.py"
            />
          </Form.Item>
          <Button type="primary" loading={loading} onClick={handleSave} block>
            Save Test Case
          </Button>
        </Form>
      )}
    </Modal>
  );
};

export default GenerateTestCaseModal; 