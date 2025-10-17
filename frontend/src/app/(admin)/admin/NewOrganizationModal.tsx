"use client"

import React, { useState } from 'react';
import { X } from 'lucide-react';
import axios from '@/lib/axiosInstance';

interface NewOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  organization?: OrganizationFormData & { _id?: string }; // Add optional org for edit
  isEdit?: boolean;
  fetchOrgs?: () => void;
}

interface OrganizationFormData {
  name: string;
  description: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
}

export default function NewOrganizationModal({ isOpen, onClose, onSuccess, organization, isEdit, fetchOrgs }: NewOrganizationModalProps) {
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: organization?.name || '',
    description: organization?.description || '',
    address: organization?.address || '',
    contactEmail: organization?.contactEmail || '',
    contactPhone: organization?.contactPhone || '',
    website: organization?.website || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isEdit && organization) {
      setFormData({
        name: organization.name || '',
        description: organization.description || '',
        address: organization.address || '',
        contactEmail: organization.contactEmail || '',
        contactPhone: organization.contactPhone || '',
        website: organization.website || ''
      });
    } else if (!isEdit) {
      setFormData({
        name: '',
        description: '',
        address: '',
        contactEmail: '',
        contactPhone: '',
        website: ''
      });
    }
  }, [isOpen, isEdit, organization]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      let res;
      if (isEdit && organization?._id) {
        res = await axios.put(`/organizations/${organization._id}`, formData);
      } else {
        res = await axios.post('/organizations', formData);
      }
      if (res.status === 200 || res.status === 201) {
        alert(isEdit ? 'Organization updated' : 'Organization created');
        onSuccess();
        if (fetchOrgs) {
          fetchOrgs();
        }
        onClose();
      }
    } catch (err: unknown) {
      let errorMessage = `Failed to ${isEdit ? 'update' : 'create'} organization`;
      
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        if (response?.data?.message) {
          errorMessage = response.data.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof OrganizationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50  flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative border border-red-200">
        <button 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors" 
          onClick={onClose}
        >
          <X size={24} />
        </button>
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{isEdit ? 'Edit Organization' : 'Add New Organization'}</h2>
          <p className="text-gray-600">{isEdit ? 'Update organization details.' : 'Create a new organization to expand your enterprise portfolio.'}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Organization Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="Enter organization name"
                required
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                rows={3}
                placeholder="Enter organization description"
                required
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                rows={2}
                placeholder="Enter organization address"
                required
              />
            </div>

            {/* Contact Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email *
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="Enter contact email"
                required
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone *
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="Enter contact phone"
                required
              />
            </div>

            {/* Website URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isEdit ? 'Saving...' : 'Creating...'}</span>
                </>
              ) : (
                <span>{isEdit ? 'Save Changes' : 'Create Organization'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}