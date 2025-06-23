import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ApiList from './pages/ApiList';
import Performance from './pages/Performance';
import { ApiProvider } from './context/ApiContext';
import LoadTesting from 'pages/LoadTesting';

function App() {
  return (
    <ApiProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 p-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/apis" element={<ApiList />} />
                <Route path="/performance" element={<Performance />} />
                <Route path="/loadtesting" element={<LoadTesting />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </ApiProvider>
  );
}

export default App;
