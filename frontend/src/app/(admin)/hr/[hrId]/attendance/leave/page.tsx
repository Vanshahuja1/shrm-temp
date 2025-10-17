'use client';

import React, { useEffect, useState } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Clock, ChevronRight, Eye, CheckCircle, XCircle, AlertCircle,
} from 'lucide-react';

interface LeaveType {
  label: string;
  code: string;
  count: number;
  total: number | null;
}

interface MyLeave {
  id: number;
  startDate: string;
  endDate?: string;
  reason: string;
  duration: string;
  status: 'approved' | 'rejected' | 'pending';
}

interface LeaveRequest {
  id: number;
  name: string;
  role: string;
  startDate: string;
  endDate?: string;
  reason: string;
  duration: string;
  avatar: string;
}

interface LeaveHistory extends LeaveRequest {
  status: 'approved' | 'rejected' | 'pending';
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const LeaveManagementDashboard = () => {
  const currentDate = new Date().toLocaleString();

  const [weeklyData, setWeeklyData] = useState<number[]>([]);
  const [monthlyData, setMonthlyData] = useState<number[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [myLeaves, setMyLeaves] = useState<MyLeave[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [leaveHistory, setLeaveHistory] = useState<LeaveHistory[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState({ startDate: '', endDate: '', reason: '', type: '' });
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        throw new Error('Simulated API failure');
      } catch {
        setWeeklyData([3, 2, 1, 4, 5, 1, 0]);
        setMonthlyData([2, 3, 1, 0, 1, 0, 0, 0, 4, 0, 0, 2]);
        setLeaveTypes([
          { label: 'Privilege Leave', code: 'PL', count: 8, total: 12 },
          { label: 'Casual Leave', code: 'CL', count: 2, total: 12 },
          { label: 'Sick Leave', code: 'SL', count: 5, total: 12 },
          { label: 'Maternity Leave', code: 'ML', count: 0, total: null },
        ]);
        setMyLeaves([
          { id: 1, startDate: '2023-09-29', endDate: '2023-09-30', reason: 'Leaving for Dussehra', duration: '2 days', status: 'pending' },
          { id: 2, startDate: '2023-09-05', reason: 'Teacher\'s day speaking at my old high school', duration: '1 day', status: 'approved' },
          { id: 3, startDate: '2023-09-04', reason: 'Traveling for teacher\'s day at high school', duration: '1 day', status: 'rejected' },
        ]);
        setLeaveRequests([
          { id: 1, name: 'Alena Gouse', role: 'UI Designer • UX02', startDate: '2023-08-10', reason: 'Birthday', duration: '01 day', avatar: '/api/placeholder/32/32' },
          { id: 2, name: 'Miracle Vetrovs', role: 'UI Designer • UX02', startDate: '2023-08-24', endDate: '2023-08-26', reason: 'Raksha bandhan leave', duration: '03 days', avatar: '/api/placeholder/32/32' },
        ]);
        setLeaveHistory([
          { id: 1, name: 'Nehal Garg', role: 'UI Designer • UX03', startDate: '2023-07-20', endDate: '2023-07-22', reason: 'EID', duration: '03 days', status: 'approved', avatar: '/api/placeholder/32/32' },
          { id: 2, name: 'Supreme Comma...', role: 'UI Designer • UX02', startDate: '2023-08-24', endDate: '2023-09-05', reason: 'Himalayas trip', duration: '12 days', status: 'rejected', avatar: '/api/placeholder/32/32' },
        ]);
      }
    };
    fetchDashboardData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const map = {
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700',
    };
    return <Badge className={map[status as keyof typeof map]}>{status}</Badge>;
  };

  const formatDateRange = (start?: string, end?: string) => {
    if (!start) return 'n/a';
    return end && end !== start ? `${start} - ${end}` : start;
  };

  const handleApplyLeave = () => {
    console.log('Applied Leave:', formState);
    setShowForm(false);
  };

  const handleRequestView = (req: LeaveRequest) => setSelectedRequest(req);

  const TooltipBarChart = ({ data, labels }: { data: number[]; labels: string[] }) => {
    const max = Math.max(...data);
    return (
      <div className="flex items-end gap-2 h-24 overflow-hidden min-h-28">
        {data.map((val, i) => (
          <div key={i} className="group flex flex-col items-center flex-1 text-xs">
            <div className="w-full bg-red-500 rounded-t relative group-hover:opacity-80" style={{ height: `${(val / max) * 60}px` }}>
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 scale-90 hidden group-hover:block text-[10px] px-1 py-[1px] rounded bg-gray-700 text-white">{val}</span>
            </div>
            <span className="mt-1 text-gray-500">{labels[i]}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, Sourav!</h1>
            <p className="text-sm text-gray-700">{leaveRequests.length} leave requests pending</p>
          </div>
          <div className="text-sm text-gray-700 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {currentDate}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader><CardTitle className="text-lg font-semibold text-gray-900">Weekly Leave Pattern</CardTitle></CardHeader>
            <CardContent><TooltipBarChart data={weeklyData} labels={days} /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg font-semibold text-gray-900">Monthly Stats</CardTitle></CardHeader>
            <CardContent><TooltipBarChart data={monthlyData} labels={months} /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg font-semibold text-gray-900">Consumed Leave Types</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {leaveTypes.map((l) => (
                <div key={l.code} className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className="font-medium text-gray-800">{l.label}</span><span className="text-xs text-gray-500">({l.code})</span></div>
                  <div className="font-semibold text-gray-800">{l.total ? `${l.count} / ${l.total}` : 'n/a'}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold text-gray-900">My Leaves</CardTitle>
              <Button variant="ghost" className="text-red-600 text-sm" onClick={() => setShowForm(true)}>
                Apply <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {myLeaves.map((leave) => (
                <div key={leave.id} className="flex justify-between items-center bg-red-50 rounded-md p-3">
                  <div className="flex gap-2 items-start">
                    {getStatusIcon(leave.status)}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{formatDateRange(leave.startDate, leave.endDate)}</div>
                      <div className="text-xs text-gray-600">{leave.reason}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-800">{leave.duration}</span>
                    {getStatusBadge(leave.status)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold text-gray-900">Leave Requests</CardTitle>
              <Button variant="ghost" className="text-red-600 text-sm" onClick={() => setShowRequestsModal(true)}>
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {leaveRequests.map((req) => (
                <div key={req.id} className="flex justify-between items-center bg-red-50 rounded-md p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8"><AvatarImage src={req.avatar} /><AvatarFallback>{req.name[0]}</AvatarFallback></Avatar>
                    <div><div className="text-sm font-medium text-gray-900">{req.name}</div><div className="text-xs text-gray-600">{req.role}</div></div>
                  </div>
                  <div className="text-right"><div className="text-sm font-medium text-gray-900">{formatDateRange(req.startDate, req.endDate)}</div><div className="text-xs text-gray-600">{req.reason}</div></div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{req.duration}</span>
                    <Eye className="w-4 h-4 text-red-600 cursor-pointer" onClick={() => handleRequestView(req)} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Apply for Leave</h2>
            <div className="grid gap-3">
              <input type="date" className="border p-2 rounded" value={formState.startDate} onChange={(e) => setFormState({ ...formState, startDate: e.target.value })} />
              <input type="date" className="border p-2 rounded" value={formState.endDate} onChange={(e) => setFormState({ ...formState, endDate: e.target.value })} />
              <input type="text" className="border p-2 rounded" placeholder="Reason" value={formState.reason} onChange={(e) => setFormState({ ...formState, reason: e.target.value })} />
              <select className="border p-2 rounded" value={formState.type} onChange={(e) => setFormState({ ...formState, type: e.target.value })}>
                <option value="">Select Leave Type</option>
                {leaveTypes.map((lt) => (<option key={lt.code} value={lt.code}>{lt.label}</option>))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleApplyLeave}>Submit</Button>
            </div>
          </div>
        </div>
      )}

      {showRequestsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-3xl h-[70vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">All Leave Requests</h2>
              <Button variant="ghost" onClick={() => setShowRequestsModal(false)}>Close</Button>
            </div>
            <div className="space-y-3">
              {leaveRequests.map((req) => (
                <div key={req.id} className="p-3 border rounded-md flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-gray-800">{req.name}</div>
                    <div className="text-xs text-gray-600">{req.role}</div>
                    <div className="text-sm text-gray-700 mt-1">{req.reason}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{req.duration}</div>
                    <div className="text-xs text-gray-500">{formatDateRange(req.startDate, req.endDate)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded shadow-md w-full max-w-sm space-y-4">
            <h2 className="text-lg font-semibold">Leave Request Details</h2>
            <div>
              <p><strong>Name:</strong> {selectedRequest.name}</p>
              <p><strong>Role:</strong> {selectedRequest.role}</p>
              <p><strong>Reason:</strong> {selectedRequest.reason}</p>
              <p><strong>Dates:</strong> {formatDateRange(selectedRequest.startDate, selectedRequest.endDate)}</p>
              <p><strong>Duration:</strong> {selectedRequest.duration}</p>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setSelectedRequest(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagementDashboard;
