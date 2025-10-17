'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import axios from '@/lib/axiosInstance';
import Axios from 'axios';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Candidate {
  name: string;
  email: string;
  department: {
    _id: string;
    name: string;
  };
  appliedDate: string;
  screeningScore: number;
  source: string;
  portfolio: string;
  location: string;
  currentCompany: string;
  jobTitle: string;
  shortlisted: boolean;
  status: string;
  notes: string;
  resume: File | null;
  expectedSalary: string;
}

const AddCandidateForm: React.FC = () => {
  const router = useRouter();
  const [candidate, setCandidate] = useState<Candidate>({
    name: '',
    department:{
      _id: '',
      name: '',

    },
    email: '',
    appliedDate: '',
    screeningScore: 0,
    source: '',
    portfolio: '',
    location: '',
    currentCompany: '',
    jobTitle: '',
    shortlisted: false,
    status: '',
    notes: '',
    resume: null,
    expectedSalary: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [departments, setDepartments] = useState<{_id: string; name: string;}[]>([]);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('/departments/org/6889a9394f263f6b1e23a7e2');
        console.log('Departments response:', response.data); // Debug log
        
        // Handle the response structure - check if data is nested
        const departmentsData = response.data.data || response.data;
        
        setDepartments(
          departmentsData.map((dept: { _id: string; name: string }) => ({
            _id: dept._id,
            name: dept.name
          }))
        );
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      }
    };
    fetchDepartments();
  }, []);

  const sourceOptions = [
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'indeed', label: 'Indeed' },
    { value: 'company website', label: 'Company Website' },
    { value: 'referral', label: 'Referral' },
    { value: 'job board', label: 'Job Board' },
    { value: 'recruitment agency', label: 'Recruitment Agency' },
    { value: 'direct application', label: 'Direct Application' },
    { value: 'career fair', label: 'Career Fair' },
    { value: 'social media', label: 'Social Media' },
    { value: 'other', label: 'Other' }
  ];

  const statusOptions = [
    { value: 'application received', label: 'Application Received' },
    { value: 'under review', label: 'Under Review' },
    { value: 'phone screening', label: 'Phone Screening' },
    { value: 'technical interview', label: 'Technical Interview' },
    { value: 'final interview', label: 'Final Interview' },
    { value: 'reference check', label: 'Reference Check' },
    { value: 'offer extended', label: 'Offer Extended' },
    { value: 'offer accepted', label: 'Offer Accepted' },
    { value: 'offer declined', label: 'Offer Declined' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'withdrawn', label: 'Withdrawn' },
    { value: 'hired', label: 'Hired' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, type, value } = e.target;
    let fieldValue: string | boolean = value;
    if (type === 'checkbox' && 'checked' in e.target) {
      fieldValue = (e.target as HTMLInputElement).checked;
    }
    setCandidate(prev => ({
      ...prev,
      [name]: fieldValue
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'department') {
      // Find the selected department object
      const selectedDept = departments.find(dept => dept._id === value);
      setCandidate(prev => ({
        ...prev,
        department: selectedDept || { _id: '', name: '' }
      }));
    } else {
      setCandidate(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (file: File | null) => {
    setCandidate(prev => ({
      ...prev,
      resume: file
    }));
  };

  const handleFileUpload = async (file: File) => {
    setUploadingResume(true);
    setMessage('');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await axios.post('/upload/single', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const fileUrl = response.data.data.url;
        setCandidate(prev => ({
          ...prev,
          resume: file // Keep the file object for display purposes
        }));
        setMessage('✅ Resume uploaded successfully!');
        setTimeout(() => setMessage(''), 3000);
        return fileUrl;
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('File upload error:', error);
      setMessage('❌ Error uploading resume. Please try again.');
      setTimeout(() => setMessage(''), 3000);
      throw error;
    } finally {
      setUploadingResume(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        try {
          await handleFileUpload(file);
        } catch {
          // Error already handled in handleFileUpload
        }
      } else {
        setMessage('❌ Please upload a PDF file only');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        try {
          await handleFileUpload(file);
        } catch {
          // Error already handled in handleFileUpload
        }
      } else {
        setMessage('❌ Please upload a PDF file only');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Ensure name and email are set
      if (!candidate.name.trim() || !candidate.email.trim()) {
        setMessage('❌ Name and email are required fields');
        setLoading(false);
        return;
      }

      let resumeUrl = '';
      
      // Upload resume if file is selected but not yet uploaded
      if (candidate.resume && typeof candidate.resume !== 'string') {
        try {
          resumeUrl = await handleFileUpload(candidate.resume);
        } catch {
          setLoading(false);
          return; // Upload failed, don't proceed with form submission
        }
      }
      
      // Create candidate data object
      const candidateData = {
        department: candidate.department,
        name: candidate.name,
        email: candidate.email,
        appliedDate: candidate.appliedDate || new Date().toISOString().split('T')[0],
        screeningScore: candidate.screeningScore,
        source: candidate.source,
        portfolio: candidate.portfolio,
        location: candidate.location,
        currentCompany: candidate.currentCompany,
        jobTitle: candidate.jobTitle,
        shortlisted: candidate.shortlisted,
        status: candidate.status || 'application received',
        notes: candidate.notes,
        expectedSalary: candidate.expectedSalary,
        resume: resumeUrl || '' // Use uploaded file URL
      };

      console.log('Submitting candidate data:', candidateData);
      
      const response = await axios.post('/recruitment/candidate', candidateData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Server response:', response.data);
      setMessage('✅ Candidate added successfully!');
      setCandidate({
        name: '',
        email: '',
        department: {
          _id: '',
          name: '',
        },
        appliedDate: '',
        screeningScore: 0,
        source: '',
        portfolio: '',
        location: '',
        currentCompany: '',
        jobTitle: '',
        shortlisted: false,
        status: '',
        notes: '',
        resume: null,
        expectedSalary: ''
      });
    } catch (error: unknown) {
      if (Axios.isAxiosError(error)) {
        console.error('Error details:', error);
        setMessage(`\u274c Error adding candidate: ${error.response?.data?.message || error.message}`);
      } else {
        console.error('Unexpected error:', error);
        setMessage('\u274c An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      <form 
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow space-y-6 p-6"
      >
        <h2 className="text-2xl font-semibold text-center">Add New Candidate</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={candidate.name}
            onChange={handleChange}
            placeholder="Enter candidate name"
            required
            className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={candidate.email}
            onChange={handleChange}
            placeholder="Enter email address"
            required
            className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <Select
            value={candidate.department._id}
            onValueChange={(value) => handleSelectChange('department', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select department..." />
            </SelectTrigger>
            <SelectContent>
              {departments.length === 0 ? (
                <SelectItem value="no-departments" disabled>
                  No departments available
                </SelectItem>
              ) : (
                departments.map((dept) => (
                  <SelectItem key={dept._id} value={dept._id}>
                    {dept.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {/* Debug info - remove this after fixing */}
          <p className="text-xs text-gray-500 mt-1">
            Departments loaded: {departments.length}
          </p>
        </div>

        <div>
          <label htmlFor="appliedDate" className="block text-sm font-medium text-gray-700 mb-1">
            Applied Date
          </label>
          <input
            type="date"
            id="appliedDate"
            name="appliedDate"
            value={candidate.appliedDate}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div>
          <label htmlFor="screeningScore" className="block text-sm font-medium text-gray-700 mb-1">
            Screening Score
          </label>
          <input
            type="number"
            id="screeningScore"
            name="screeningScore"
            value={candidate.screeningScore}
            onChange={handleChange}
            placeholder="Enter score (0-100)"
            min="0"
            max="100"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div>
          <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
            Source
          </label>
          <Select
            value={candidate.source}
            onValueChange={(value) => handleSelectChange('source', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select source..." />
            </SelectTrigger>
            <SelectContent>
              {sourceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 mb-1">
            Portfolio URL
          </label>
          <input
            type="url"
            id="portfolio"
            name="portfolio"
            value={candidate.portfolio}
            onChange={handleChange}
            placeholder="https://portfolio.example.com"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={candidate.location}
            onChange={handleChange}
            placeholder="City, State/Country"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div>
          <label htmlFor="currentCompany" className="block text-sm font-medium text-gray-700 mb-1">
            Current Company
          </label>
          <input
            type="text"
            id="currentCompany"
            name="currentCompany"
            value={candidate.currentCompany}
            onChange={handleChange}
            placeholder="Current employer"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div>
          <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
            Job Title
          </label>
          <input
            type="text"
            id="jobTitle"
            name="jobTitle"
            value={candidate.jobTitle}
            onChange={handleChange}
            placeholder="Current job title"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <Select
            value={candidate.status}
            onValueChange={(value) => handleSelectChange('status', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status..." />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-1">
            Resume (PDF only)
          </label>
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300 hover:border-red-400 hover:bg-gray-50'
            } ${uploadingResume ? 'opacity-50 pointer-events-none' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="resume"
              name="resume"
              accept=".pdf"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploadingResume}
            />
            <div className="space-y-2">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {uploadingResume ? (
                <div>
                  <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm font-medium text-red-600">
                    Uploading resume...
                  </p>
                  <p className="text-xs text-gray-500">
                    Please wait while we upload your file
                  </p>
                </div>
              ) : candidate.resume ? (
                <div>
                  <p className="text-sm font-medium text-green-600">
                    ✓ {candidate.resume.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(candidate.resume.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    onClick={() => handleFileChange(null)}
                    className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Drop your resume here, or click to browse
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF files only, up to 10MB
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="expectedSalary" className="block text-sm font-medium text-gray-700 mb-1">
            Expected Salary
          </label>
          <input
            type="text"
            id="expectedSalary"
            name="expectedSalary"
            value={candidate.expectedSalary}
            onChange={handleChange}
            placeholder="e.g., $75,000 - $85,000"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="shortlisted"
          name="shortlisted"
          checked={candidate.shortlisted}
          onChange={handleChange}
          className="w-5 h-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
        />
        <label htmlFor="shortlisted" className="text-sm font-medium text-gray-700">
          Mark as shortlisted
        </label>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={candidate.notes}
          onChange={handleChange}
          placeholder="Additional notes about the candidate..."
          className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
          rows={3}
        />
      </div>

      <button
        type="submit"
        disabled={loading || uploadingResume}
        className="w-full py-2 bg-red-500 text-white font-semibold rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? 'Adding...' : uploadingResume ? 'Uploading Resume...' : 'Add Candidate'}
      </button>

      {message && (
        <p className="text-center text-sm">{message}</p>
      )}
      </form>
    </div>
  );
};

export default AddCandidateForm;