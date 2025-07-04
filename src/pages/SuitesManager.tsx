import React, { useEffect, useState } from 'react';
import { Button, Popconfirm, message } from 'antd';
import { getFolders, deleteFolder, deleteTestCase } from '../services/api';
import { Folder, TestCase } from '../types';

interface SuitesManagerProps {
  runTestCases: (ids: number[]) => Promise<void>;
}

const SuitesManager: React.FC<SuitesManagerProps> = ({ runTestCases }) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getFolders();
      setFolders(data);
      if (data.length > 0 && selectedFolderId === null) {
        setSelectedFolderId(data[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFolder = async (id: number) => {
    await deleteFolder(id);
    message.success('Folder deleted');
    fetchData();
    if (selectedFolderId === id) {
      setSelectedFolderId(null);
    }
  };

  const handleDeleteTestCase = async (id: number) => {
    await deleteTestCase(id);
    message.success('Test case deleted');
    fetchData();
  };

  const handleRunTestCase = async (id: number) => {
    setLoading(true);
    await runTestCases([id]);
    setLoading(false);
  };

  const handleRunFolder = async (folder: Folder) => {
    if (!folder.testcases || folder.testcases.length === 0) return;
    setLoading(true);
    const ids = folder.testcases.map(tc => tc.id);
    await runTestCases(ids);
    setLoading(false);
  };

  const handleRunAll = async () => {
    const ids = folders.flatMap(f => f.testcases?.map(tc => tc.id) || []);
    if (ids.length === 0) return;
    setLoading(true);
    await runTestCases(ids);
    setLoading(false);
  };

  const selectedFolder = folders.find(f => f.id === selectedFolderId) || null;

  return (
    <div className="flex gap-8">
      {/* Folders List */}
      <div className="w-64 bg-white rounded-lg shadow p-4 h-fit">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Folders</h3>
          <Button onClick={handleRunAll} disabled={loading} size="small" type="primary">
            Run All
          </Button>
        </div>
        <ul className="space-y-1">
          {folders.map(folder => (
            <li
              key={folder.id}
              className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer transition-colors ${selectedFolderId === folder.id ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
              onClick={() => setSelectedFolderId(folder.id)}
            >
              <div>
                <span className="font-medium text-gray-700">{folder.name}</span>
                <span className="ml-2 text-xs text-gray-400">({folder.testcases?.length || 0})</span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity" style={{ pointerEvents: 'auto' }}>
                <Button size="small" onClick={e => { e.stopPropagation(); handleRunFolder(folder); }} disabled={loading}>
                  ▶
                </Button>
                <Popconfirm title="Delete this folder and all test cases?" onConfirm={e => { e?.stopPropagation(); handleDeleteFolder(folder.id); }}>
                  <Button size="small" danger onClick={e => e.stopPropagation()}>🗑️</Button>
                </Popconfirm>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {/* Test Cases for Selected Folder */}
      <div className="flex-1 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {selectedFolder ? `Test Cases in "${selectedFolder.name}"` : 'Select a folder to view test cases'}
        </h3>
        {selectedFolder && selectedFolder.testcases && selectedFolder.testcases.length > 0 ? (
          <table className="min-w-full bg-white text-gray-900 border border-gray-200 rounded">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b border-gray-200 text-left">Test Case ID</th>
                <th className="px-4 py-2 border-b border-gray-200 text-left">Test Case Name</th>
                <th className="px-4 py-2 border-b border-gray-200 text-left">Path</th>
                <th className="px-4 py-2 border-b border-gray-200 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {selectedFolder.testcases.map(tc => (
                <tr key={tc.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2">{tc.id}</td>
                  <td className="px-4 py-2">{tc.name}</td>
                  <td className="px-4 py-2">{tc.path}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <Button size="small" onClick={() => handleRunTestCase(tc.id)} disabled={loading}>
                        Run
                      </Button>
                      <Popconfirm title="Delete this test case?" onConfirm={() => handleDeleteTestCase(tc.id)}>
                        <Button size="small" danger>Delete</Button>
                      </Popconfirm>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-gray-400 text-sm">No test cases in this folder.</div>
        )}
      </div>
    </div>
  );
};

export default SuitesManager; 