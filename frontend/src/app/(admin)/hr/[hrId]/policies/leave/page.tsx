'use client';

import { useEffect, useState } from 'react';

type LeaveViolator = {
  id: number;
  name: string;
  email: string;
  usedLeaves: number;
  leaveQuota: number;
};

type MailLog = {
  [key: string]: string;
};

const LeavePolicyPage: React.FC = () => {
  const [violators, setViolators] = useState<LeaveViolator[]>([]);
  const [mailLog, setMailLog] = useState<MailLog>({});

  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        const res = await fetch('/api/policymanagement/leave');
        if (!res.ok) throw new Error('Failed to fetch leave data');
        const data: LeaveViolator[] = await res.json();
        const defaulters = data.filter((e) => e.usedLeaves > e.leaveQuota);
        setViolators(defaulters);
      } catch {
        const fallback: LeaveViolator[] = [
          { id: 1, name: 'Arjun Rao', email: 'arjun@company.com', usedLeaves: 24, leaveQuota: 20 },
          { id: 2, name: 'Simran Joshi', email: 'simran@company.com', usedLeaves: 18, leaveQuota: 20 },
          { id: 3, name: 'Kabir Singh', email: 'kabir@company.com', usedLeaves: 26, leaveQuota: 20 },
        ];
        setViolators(fallback.filter((e) => e.usedLeaves > e.leaveQuota));
      }
    };

    fetchLeaveData();
  }, []);

  const sendMail = async (emp: LeaveViolator) => {
    const key = `leave-${emp.id}`;
    if (mailLog[key]) return;

    await fetch('/api/policymanagement/send-leave-warning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: emp.email,
        name: emp.name,
        usedLeaves: emp.usedLeaves,
        leaveQuota: emp.leaveQuota,
      }),
    });

    const now = new Date().toLocaleString();
    setMailLog((prev) => ({ ...prev, [key]: now }));
    alert(`📤 Warning sent to ${emp.name}`);
  };

  return (
    <div className="bg-white border rounded-xl p-6 shadow text-gray-800">
      <h2 className="text-xl font-bold mb-4 text-gray-800">🏖️ Leave Quota Violations</h2>
      {violators.length === 0 ? (
        <p className="text-gray-500">✅ No leave violations found</p>
      ) : (
        <>
          {/* Mobile View */}
          <div className="block sm:hidden space-y-4">
            {violators.map((e) => {
              const key = `leave-${e.id}`;
              return (
                <div key={e.id} className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm shadow-sm">
                  <p><span className="font-semibold">Name:</span> {e.name}</p>
                  <p><span className="font-semibold">Email:</span> {e.email}</p>
                  <p><span className="font-semibold">Used / Quota:</span>{' '}
                    <span className="text-red-600">{e.usedLeaves} / {e.leaveQuota}</span>
                  </p>
                  <div className="mt-2">
                    <button
                      onClick={() => sendMail(e)}
                      disabled={!!mailLog[key]}
                      className={`w-full text-xs px-3 py-2 rounded ${
                        mailLog[key]
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      {mailLog[key] ? 'Warning Sent' : 'Send Warning'}
                    </button>
                    {mailLog[key] && (
                      <p className="text-[11px] text-gray-500 mt-1">Sent: {mailLog[key]}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm border rounded min-w-[500px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-2 border-b">Name</th>
                  <th className="text-left px-4 py-2 border-b">Email</th>
                  <th className="text-left px-4 py-2 border-b">Used / Quota</th>
                  <th className="text-left px-4 py-2 border-b">Action</th>
                </tr>
              </thead>
              <tbody>
                {violators.map((e) => {
                  const key = `leave-${e.id}`;
                  return (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border-b">{e.name}</td>
                      <td className="px-4 py-2 border-b">{e.email}</td>
                      <td className="px-4 py-2 border-b text-red-600">
                        {e.usedLeaves} / {e.leaveQuota}
                      </td>
                      <td className="px-4 py-2 border-b">
                        <div className="flex flex-col">
                          <button
                            onClick={() => sendMail(e)}
                            disabled={!!mailLog[key]}
                            className={`px-3 py-1 text-xs rounded ${
                              mailLog[key]
                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                : 'bg-red-500 text-white hover:bg-red-600'
                            }`}
                          >
                            {mailLog[key] ? 'Warning Sent' : 'Send Warning'}
                          </button>
                          {mailLog[key] && (
                            <span className="text-[11px] text-gray-500">Sent: {mailLog[key]}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default LeavePolicyPage;
