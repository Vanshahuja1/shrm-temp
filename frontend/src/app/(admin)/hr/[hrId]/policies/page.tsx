'use client';

import { JSX, useState } from 'react';
// import LeavePolicy from './leave/page';
// import AttendancePolicy from './attendance/page';
// import DisciplinePolicy from './discipline/page';
import WarningPolicyPage from './warning/page';

const tabs = ['Warning'] as const;

// const tabs = ['Warning'] as const;
export default function PolicyManagementPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<number>(0);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">
        📋 Policy Management
      </h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-2 rounded-full font-medium text-sm ${
              activeTab === index
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-red-100 text-red-700 hover:bg-red-50'
            }`}
          >
            {/* {tab === 'Leave' && '📄 Leave'}
            {tab === 'Attendance' && '🕒 Attendance'}
            {tab === 'Discipline' && '⚠️ Discipline'} */}
            {tab === 'Warning' && '⚠️ Warning'}
          </button>
        ))}
      </div>

      <div className="transition-all">
        {/* {activeTab === 0 && <LeavePolicy />}
        {activeTab === 1 && <AttendancePolicy />}
        {activeTab === 2 && <DisciplinePolicy />} */}
        {activeTab === 0 && <WarningPolicyPage />}
      </div>
    </div>
  );
}
