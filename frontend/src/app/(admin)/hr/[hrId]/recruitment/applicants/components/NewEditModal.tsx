'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axiosInstance';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import toast from 'react-hot-toast';

// Updated type to match the actual Applicant type
type EditApplicantModalProps = {
  isOpen: boolean;
  onClose: () => void;
  applicant: {
    _id?: string;
    name: string;
    department: {
      _id: string;
      name: string;
    };
    email: string;
    appliedDate?: string | Date; // Made optional and allow Date
    screeningScore?: number; // Made optional
    source?: string; // Made optional
    portfolio?: string; // Made optional
    location?: string; // Made optional
    currentCompany?: string; // Made optional
    jobTitle?: string; // Made optional
    shortlisted?: boolean; // Made optional
    status?: string; // Made optional
    notes?: string; // Made optional
    resume?: string; // Made optional
    expectedSalary?: string; // Made optional
  };
  onUpdate: () => void;
};

export default function EditApplicantModal({ isOpen, onClose, applicant, onUpdate }: EditApplicantModalProps) {
  const [departments, setDepartments] = useState<{ _id: string; name: string; }[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    department: {
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
    resume: "",
    expectedSalary: ''
  });

  const sourceOptions = [
    'LinkedIn',
    'Indeed',
    'Company Website',
    'Referral',
    'Job Board',
    'Recruitment Agency',
    'Direct Application',
    'Career Fair',
    'Social Media',
    'Other'
  ];

  const statusOptions = [
    'Application Received',
    'Under Review',
    'Phone Screening',
    'Technical Interview',
    'Final Interview',
    'Reference Check',
    'Offer Extended',
    'Offer Accepted',
    'Offer Declined',
    'Rejected',
    'Withdrawn',
    "Hired"
  ];

  useEffect(() => {
    if (applicant) {
      // Handle the appliedDate conversion properly
      let appliedDateString = '';
      if (applicant.appliedDate) {
        if (typeof applicant.appliedDate === 'string') {
          // If it's already a string, try to format it for date input
          const date = new Date(applicant.appliedDate);
          if (!isNaN(date.getTime())) {
            appliedDateString = date.toISOString().split('T')[0];
          } else {
            appliedDateString = applicant.appliedDate;
          }
        } else {
          // If it's a Date object
          appliedDateString = applicant.appliedDate.toISOString().split('T')[0];
        }
      }

      setFormData({
        name: applicant.name || '',
        department: applicant.department || { _id: '', name: '' },
        email: applicant.email || '',
        appliedDate: appliedDateString,
        screeningScore: applicant.screeningScore || 0,
        source: applicant.source || '',
        portfolio: applicant.portfolio || '',
        location: applicant.location || '',
        currentCompany: applicant.currentCompany || '',
        jobTitle: applicant.jobTitle || '',
        shortlisted: applicant.shortlisted || false,
        status: applicant.status || '',
        notes: applicant.notes || '',
        resume: applicant.resume || '',
        expectedSalary: applicant.expectedSalary || ''
      });
    }
  }, [applicant]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('/departments/org/6889a9394f263f6b1e23a7e2');
        const departmentsData = response.data.data || response.data;
        setDepartments(departmentsData.map((dept: { _id: string; name: string }) => ({
          _id: dept._id,
          name: dept.name
        })));
      } catch (error) {
        console.error('Failed to fetch departments:', error);
        toast.error('Failed to load departments');
      }
    };

    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, type, value } = e.target;
    let fieldValue: string | boolean | number = value;
    
    if (type === 'checkbox' && 'checked' in e.target) {
      fieldValue = (e.target as HTMLInputElement).checked;
    }
    if (name === 'screeningScore') {
      fieldValue = parseInt(value) || 0;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'department') {
      const selectedDept = departments.find(dept => dept._id === value);
      if (selectedDept) {
        setFormData(prev => ({
          ...prev,
          department: {
            _id: selectedDept._id,
            name: selectedDept.name
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (!applicant?._id) return;

      await axios.put(`/recruitment/candidate/${applicant._id}`, formData);
      toast.success('Candidate updated successfully');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating candidate:', error);
      toast.error('Failed to update candidate');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Candidate</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter candidate name"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <Select
              value={formData.department._id}
              onValueChange={(value) => handleSelectChange('department', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select department..." />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept._id} value={dept._id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Applied Date
            </label>
            <input
              type="date"
              name="appliedDate"
              value={formData.appliedDate}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Screening Score
            </label>
            <input
              type="number"
              name="screeningScore"
              value={formData.screeningScore}
              onChange={handleChange}
              placeholder="Enter score (0-100)"
              min="0"
              max="100"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source
            </label>
            <Select
              value={formData.source}
              onValueChange={(value) => handleSelectChange('source', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select source..." />
              </SelectTrigger>
              <SelectContent>
                {sourceOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Portfolio URL
            </label>
            <input
              type="url"
              name="portfolio"
              value={formData.portfolio}
              onChange={handleChange}
              placeholder="https://portfolio.example.com"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, State/Country"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Company
            </label>
            <input
              name="currentCompany"
              value={formData.currentCompany}
              onChange={handleChange}
              placeholder="Current employer"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title
            </label>
            <input
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              placeholder="Current job title"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleSelectChange('status', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Salary
            </label>
            <input
              name="expectedSalary"
              value={formData.expectedSalary}
              onChange={handleChange}
              placeholder="e.g., $75,000 - $85,000"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="shortlisted"
                checked={formData.shortlisted}
                onChange={(e) => handleChange(e)}
                className="w-5 h-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Mark as shortlisted
              </label>
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes about the candidate..."
              className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            Update Candidate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}