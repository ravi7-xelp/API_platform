import React, { useState } from 'react';
import GenerateTestCaseModal from '../components/GenerateTestCaseModal';
import SuitesManager from './SuitesManager';

const TestCaseManagementPage: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshSuites, setRefreshSuites] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [testPassed, setTestPassed] = useState<boolean | null>(null);

  const runTestCases = async (selectedIds: number[]) => {
    const response = await fetch("http://localhost:9000/api/testcases/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selectedIds),
    });
    const data = await response.json();
    // Determine if all passed
    const allPassed = data.results && data.results.length > 0 && data.results.every((r: any) => r.status === 'pass');
    setTestPassed(allPassed);
    setShowResultModal(true);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Test Case Management</h1>
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => setModalVisible(true)}
      >
        Generate Test Case
      </button>
      <GenerateTestCaseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={() => setRefreshSuites(r => !r)}
      />
      <SuitesManager runTestCases={runTestCases} key={refreshSuites ? 'refresh' : 'no-refresh'} />
      {/* Result Modal */}
      {showResultModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: 16,
            boxShadow: '0 4px 32px rgba(0,0,0,0.12)',
            padding: 32,
            minWidth: 340,
            textAlign: 'center',
            position: 'relative'
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: testPassed ? '#d1fae5' : '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto'
            }}>
              {testPassed ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9.5 17L4 11.5" /></svg>
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              )}
            </div>
            <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 8 }}>
              {testPassed ? 'Test case(s) passed!' : 'Test case(s) failed!'}
            </div>
            <div style={{ color: '#6b7280', marginBottom: 24 }}>
              {testPassed
                ? 'All selected test cases passed successfully.'
                : 'One or more selected test cases failed. Please check the details in the results page.'}
            </div>
            <button
              style={{
                background: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                padding: '12px 0',
                width: '100%',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                marginTop: 8
              }}
              onClick={() => setShowResultModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestCaseManagementPage; 