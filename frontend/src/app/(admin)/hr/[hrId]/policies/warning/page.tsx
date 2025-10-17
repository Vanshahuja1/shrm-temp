'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axiosInstance';
import { X } from 'lucide-react';
import { useParams } from 'next/navigation';

interface Employee {
  id: number;
  name: string;
  email: string;
  organization: string;
  department: string;
  role: string;
}

export default function WarningPolicyPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [sentIds, setSentIds] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: 'Official Warning',
    message: '',
    policyType: 'Attendance',
  });
  const [sending, setSending] = useState(false);
  const { hrId } = useParams<{ hrId: string }>();

  const policyTypes = [
    { value: 'Attendance', label: 'Attendance Policy' },
    { value: 'Leave', label: 'Leave Policy' },
    { value: 'Discipline', label: 'Discipline Policy' },
    { value: 'Other', label: 'Other' },
  ];

  // Auto-update subject/message when policyType changes
  function handlePolicyTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const type = e.target.value;
    let subject = 'Official Warning';
    let message = '';
    if (type === 'Attendance') {
      subject = 'Attendance Policy Warning';
      message = 'This is an official warning regarding your attendance policy violation.';
    } else if (type === 'Leave') {
      subject = 'Leave Policy Warning';
      message = 'This is an official warning regarding your leave policy violation.';
    } else if (type === 'Discipline') {
      subject = 'Discipline Policy Warning';
      message = 'This is an official warning regarding your discipline policy violation.';
    } else {
      subject = 'Official Warning';
      message = '';
    }
    setEmailForm((prev) => ({ ...prev, policyType: type, subject, message }));
  }

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('/IT/org-members/empInfo');
        setEmployees(
          response.data.map((emp: {_id :string , name :string , email :string , organization :string , department :string , role :string , id :string }) => ({
            id: emp._id || emp.id,
            name: emp.name || emp.email.split('@')[0],
            email: emp.email,
            organization: emp.organization || 'N/A',
            department: emp.department || 'N/A',
            role: emp.role || 'N/A',
          }))
        );
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };
    fetchEmployees();
  }, []);

  const filtered = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white border border-red-100 rounded-xl p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">⚠️ Send Warning</h2>
        <div className="text-sm text-gray-500">{employees.length} Employees</div>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search employee by name, org, or role"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-red-100 rounded-lg text-sm shadow-sm text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
        />
      </div>
      <div className="overflow-hidden rounded-lg border border-red-100">
        <table className="min-w-full divide-y divide-red-100">
          <thead className="bg-red-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">Employee</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">Department</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">Role</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-red-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-red-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                  {searchTerm ? 'No employees match your search' : 'No employees found'}
                </td>
              </tr>
            ) : (
              filtered.map((emp) => (
                <tr
                  key={emp.id}
                  className={`hover:bg-red-50 transition-colors ${selectedId === emp.id ? 'bg-red-50' : ''}`}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                        <div className="text-sm text-gray-500">{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{emp.department}</div>
                    <div className="text-xs text-gray-500">{emp.organization}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedId(emp.id);
                        setEmailForm((prev) => ({ ...prev, to: emp.email, message: '', policyType: 'Attendance' }));
                        setShowModal(true);
                      }}
                      disabled={sentIds.includes(emp.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                        sentIds.includes(emp.id)
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      {sentIds.includes(emp.id) ? 'Warning Sent' : 'Send Warning'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Warning Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Compose Warning Email</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSending(true);
                try {
                  await axios.post('/mail/send', {
                    type: 'warning',
                    from: hrId,
                    senderId: hrId,
                    to: emailForm.to,
                    recipientId: selectedId,
                    subject: emailForm.subject,
                    text: emailForm.message,
                    policyType: emailForm.policyType,
                  });
                  if (selectedId) {
                    setSentIds((prev) => [...prev, selectedId]);
                  }
                  setEmailForm({ to: '', subject: 'Official Warning', message: '', policyType: 'Attendance' });
                  setShowModal(false);
                  setSelectedId(null);
                } catch (error) {
                  console.error('Error sending warning:', error);
                  alert('Failed to send warning. Please try again.');
                } finally {
                  setSending(false);
                }
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Policy Type:</label>
                  <select
                    value={emailForm.policyType}
                    onChange={handlePolicyTypeChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    {policyTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To:</label>
                  <input
                    type="email"
                    value={emailForm.to}
                    onChange={(e) => setEmailForm((prev) => ({ ...prev, to: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject:</label>
                  <input
                    type="text"
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm((prev) => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message:</label>
                  <textarea
                    value={emailForm.message}
                    onChange={(e) => setEmailForm((prev) => ({ ...prev, message: e.target.value }))}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:bg-red-300"
                  >
                    {sending ? 'Sending...' : 'Send Warning'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}