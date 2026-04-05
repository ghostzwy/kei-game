import React from 'react';
import TargetList from '@/components/TargetList';

const DashboardPage = () => {
  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <h1 className="text-4xl font-bold text-[#00ff41] mb-4">Admin Dashboard</h1>
      <p className="text-gray-400 mb-6">Manage your targets in real-time.</p>
      <TargetList />
    </div>
  );
};

export default DashboardPage;