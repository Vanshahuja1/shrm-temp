
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
// import Link from 'next/link';
import EditApplicantModal from '../components/NewEditModal';
import toast, { Toaster } from 'react-hot-toast';
import axios from '@/lib/axiosInstance';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { useRouter } from 'next/navigation';

type Applicant = {
  _id?: string;
  name: string;
  email: string;
  appliedDate?: string | Date;
  screeningScore?: number;
  department?: {
    _id: string;
    name: string;
  };
  interviewScheduled?: {
    isScheduled?: boolean;
    scheduledDate?: string | Date;
    interviewer?: {
      id?: string;
      name?: string;
    };
  } | null;
  source?: string;
  portfolio?: string;
  
  location?: string;
  currentCompany?: string;
  jobTitle?: string;
  shortlisted?: boolean;
  status?: string;
  recruiterAssigned?: {
    isAssigned?: boolean;
    interviewer?: {
      id?: string;
      name?: string;
    };
  } | null;
  notes?: string;
  resume?: string;
  expectedSalary?: string;
};

type Interviewer = {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: string;
  department: string;
  organization: string;
  salary: number;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
};

export default function ApplicantDetailPage() {
  const { id } = useParams();
  const [applicant, setApplicant] = useState<Applicant>();
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [loading, setLoading] = useState(true);

  const [interviewDate, setInterviewDate] = useState('');
  const [selectedInterviewer, setSelectedInterviewer] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [applicantRes, managersRes, hrRes] = await Promise.all([
          axios.get(`/recruitment/candidate/${id}`),
          axios.get('/IT/org-members/empInfo?role=manager'),
          axios.get('/IT/org-members/empInfo?role=hr')
        ]);

        setApplicant(applicantRes.data);
        setInterviewers([...managersRes.data, ...hrRes.data]);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load candidate data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleScheduleInterview = async () => {
    if (!interviewDate || !selectedInterviewer) {
      toast.error('Please select both interview date and interviewer');
      return;
    }

    try {
      await axios.post(`/recruitment/candidate/scheduleInterview/${applicant?._id}`, {
        scheduledDate: interviewDate,
        interviewer: {
          id: selectedInterviewer,
          name: interviewers.find(i => i.id === selectedInterviewer)?.name || '',
        }
      });

      toast.success('Interview scheduled successfully!');

      // Refresh applicant data
      const res = await axios.get(`/recruitment/candidate/${id}`);
      setApplicant(res.data);

      // Reset form
      setInterviewDate('');
      setSelectedInterviewer('');
    } catch (error) {
      console.error('Failed to schedule interview:', error);
      toast.error('Failed to schedule interview');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'shortlisted': 'bg-blue-100 text-blue-800',
      'interviewed': 'bg-purple-100 text-purple-800',
      'selected': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  const isInterviewScheduled = applicant?.interviewScheduled?.isScheduled;
  const isRecruiterAssigned = applicant?.recruiterAssigned?.isAssigned;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-lg">Loading candidate details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <Toaster position="top-right" />

      {/* Breadcrumb */}
      <div className="text-sm">
        <span
          onClick={() => { router.back() }}
          className="inline-flex items-center gap-1 cursor-pointer text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Records
        </span>
      </div>

      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{applicant?.name}</h1>
            <p className="text-lg text-gray-600 mt-1">{applicant?.jobTitle || 'Position Not Specified'}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {applicant?.status && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(applicant.status)}`}>
                {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
              </span>
            )}
            {applicant?.shortlisted && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Shortlisted
              </span>
            )}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Edit Details
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Contact Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{applicant?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Location</label>
              <p className="text-gray-900">{applicant?.location || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Current Company</label>
              <p className="text-gray-900">{applicant?.currentCompany || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Department</label>
              <p className="text-gray-900">{applicant?.department?.name || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Expected Salary</label>
              <p className="text-gray-900">{applicant?.expectedSalary || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Application Details */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Applied Date</label>
              <p className="text-gray-900">
                {applicant?.appliedDate
                  ? format(new Date(applicant.appliedDate), "dd MMM yyyy")
                  : 'Not available'
                }
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Source</label>
              <p className="text-gray-900">{applicant?.source || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Screening Score</label>
              <p className="text-gray-900">
                {applicant?.screeningScore !== undefined
                  ? `${applicant.screeningScore}/100`
                  : 'Not evaluated'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Process Status */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Process Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Interview</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${isInterviewScheduled
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
                }`}>
                {isInterviewScheduled ? 'Scheduled' : 'Not Scheduled'}
              </span>
            </div>

            {isInterviewScheduled && applicant?.interviewScheduled?.scheduledDate && (
              <div className="pl-4 border-l-2 border-green-200">
                <p className="text-sm text-gray-600">
                  <strong>Date:</strong> {format(new Date(applicant.interviewScheduled.scheduledDate), "dd MMM yyyy, HH:mm")}
                </p>
                {applicant.interviewScheduled.interviewer?.name && (
                  <p className="text-sm text-gray-600">
                    <strong>Interviewer:</strong> {applicant.interviewScheduled.interviewer.name}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Recruiter</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${isRecruiterAssigned
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
                }`}>
                {isRecruiterAssigned ? 'Assigned' : 'Not Assigned'}
              </span>
            </div>

            {isRecruiterAssigned && applicant?.recruiterAssigned?.interviewer?.name && (
              <div className="pl-4 border-l-2 border-green-200">
                <p className="text-sm text-gray-600">
                  <strong>Assigned to:</strong> {applicant.recruiterAssigned.interviewer.name}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Documents and Links */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents & Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Resume</label>
            {applicant?.resume ? (
              <a
                href={applicant.resume}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                📄 Download Resume
              </a>
            ) : (
              <p className="text-gray-400">Not available</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Portfolio</label>
            {applicant?.portfolio ? (
              <a
                href={applicant.portfolio}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                🌐 View Portfolio
              </a>
            ) : (
              <p className="text-gray-400">Not available</p>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      {applicant?.notes && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{applicant.notes}</p>
        </div>
      )}

      {/* Schedule Interview Section */}
      {!isInterviewScheduled && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📅 Schedule Interview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interview Date & Time
              </label>
              <input
                type="datetime-local"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Interviewer
              </label>
              <Select value={selectedInterviewer} onValueChange={setSelectedInterviewer}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose interviewer..." />
                </SelectTrigger>
                <SelectContent>
                  {interviewers.map((interviewer) => (
                    <SelectItem key={interviewer.id} value={interviewer.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{interviewer.name}</span>
                        <span className="text-xs text-gray-500">
                          {interviewer.role} - {interviewer.department}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleScheduleInterview}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Schedule Interview
              </button>
            </div>
          </div>
        </div>
      )}


{applicant && (
  <EditApplicantModal
    isOpen={isEditModalOpen}
    onClose={() => setIsEditModalOpen(false)}
    applicant={{
      ...applicant,
      department: applicant.department || { _id: '', name: 'Not Assigned' }
    }}
    onUpdate={async () => {
      try {
        const res = await axios.get(`/recruitment/candidate/${id}`);
        setApplicant(res.data);
        toast.success('Candidate details updated successfully');
      } catch (error) {
        console.error('Failed to refresh candidate data:', error);
        toast.error('Failed to refresh candidate data');
      }
    }}
  />
)}
    </div>
  );
}