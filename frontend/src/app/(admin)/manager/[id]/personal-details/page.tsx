"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  Clock,
  Award,
  Target,
  UserIcon,
  Edit,
  Save,
  X,
} from "lucide-react";
import axios from "@/lib/axiosInstance";
import type { OrganizationMember } from "@/types";

export default function ManagerPersonalDetailsPage() {
  const { id } = useParams();
  const [manager, setManager] = useState<OrganizationMember | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({
    email: "",
    phone: "",
    address: "",
    tasksPerDay: 0,
    projects: "",
  });

  useEffect(() => {
    const fetchManager = async () => {
      try {
        const response = await axios.get(`/IT/org-members/${id}`);
        const managerData = response.data;
        setManager(managerData);
        // Initialize edit data with current values
        setEditData({
          email: managerData.contactInfo?.email || "",
          phone: managerData.contactInfo?.phone || "",
          address: managerData.contactInfo?.address || "",
          tasksPerDay: managerData.performanceMetrics?.tasksPerDay || 0,
          projects: Array.isArray(managerData.projects) ? managerData.projects.join(", ") : "",
        });
      } catch (error) {
        console.error("Error fetching manager:", error);
      }
    };
    fetchManager();
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset edit data to original values
    if (manager) {
      setEditData({
        email: manager.contactInfo?.email || "",
        phone: manager.contactInfo?.phone || "",
        address: manager.contactInfo?.address || "",
        tasksPerDay: manager.performanceMetrics?.tasksPerDay || 0,
        projects: Array.isArray(manager.projects) ? manager.projects.join(", ") : "",
      });
    }
  };

  const handleSave = async () => {
    if (!manager) return;
    
    setSaving(true);
    try {
      const projectsList = editData.projects
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p);

      const updatePayload = {
        contactInfo: {
          email: editData.email,
          phone: editData.phone,
          address: editData.address,
        },
        performanceMetrics: {
          tasksPerDay: editData.tasksPerDay,
          attendanceScore: manager.performanceMetrics?.attendanceScore || 0,
          managerReviewRating: manager.performanceMetrics?.managerReviewRating || 0,
          combinedPercentage: manager.performanceMetrics?.combinedPercentage || 0,
        },
        projects: projectsList,
      };

      await axios.put(`/IT/org-members/${id}`, updatePayload);
      
      // Update local state with new data
      setManager({
        ...manager,
        contactInfo: {
          ...manager.contactInfo,
          email: editData.email,
          phone: editData.phone,
          address: editData.address,
        },
        performanceMetrics: {
          ...manager.performanceMetrics,
          tasksPerDay: editData.tasksPerDay,
        },
        projects: projectsList,
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating manager:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!manager) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {manager.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{manager.name}</h1>
              <p className="text-xl text-red-600 font-medium">
                {manager.role} – {manager.department}
              </p>
            </div>
          </div>
          
          {/* Edit Button */}
          <div className="flex gap-2">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Edit size={16} />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tasks/Day - Editable */}
          {isEditing ? (
            <div className="p-4 rounded-lg border bg-blue-50 border-red-200">
              <div className="flex items-center gap-2 mb-1 text-sm font-medium text-blue-600">
                <Target />
                Tasks/Day
              </div>
              <input
                type="number"
                value={editData.tasksPerDay}
                onChange={(e) => setEditData({...editData, tasksPerDay: Number(e.target.value)})}
                className="text-2xl font-bold bg-transparent border border-blue-300 rounded px-2 py-1 w-20"
                min="0"
                max="10"
              />
              <span className="text-2xl font-bold">/5</span>
            </div>
          ) : (
            <InfoCard
              title="Tasks/Day"
              value={`${manager.performanceMetrics.tasksPerDay}/5`}
              icon={<Target />}
              color="blue"
              theme="red"
            />
          )}
          
          <InfoCard
            title="Attendance"
            value={`${manager.performanceMetrics.attendanceScore}%`}
            icon={<Clock />}
            color="green"
            theme="red"
          />
          <InfoCard
            title="Manager Rating"
            value={`${manager.performanceMetrics.managerReviewRating}/5`}
            icon={<Award />}
            color="purple"
            theme="red"
          />
          <InfoCard
            title="Performance"
            value={`${manager.performanceMetrics.combinedPercentage}%`}
            icon={<TrendingUp />}
            color="orange"
            theme="red"
          />
        </div>

        {/* Contact + Professional Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Contact Info</h2>
            
            {/* Email */}
            <div className="flex items-center gap-3">
              <Mail className="text-gray-500" size={20} />
              {isEditing ? (
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                  className="border border-gray-300 rounded px-3 py-1 flex-1"
                  placeholder="Email address"
                />
              ) : (
                <span>{manager.contactInfo.email}</span>
              )}
            </div>
            
            {/* Phone */}
            <div className="flex items-center gap-3">
              <Phone className="text-gray-500" size={20} />
              {isEditing ? (
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  className="border border-gray-300 rounded px-3 py-1 flex-1"
                  placeholder="Phone number"
                />
              ) : (
                <span>{manager.contactInfo.phone}</span>
              )}
            </div>
            
            {/* Address */}
            <div className="flex items-start gap-3">
              <MapPin className="text-gray-500 mt-1" size={20} />
              {isEditing ? (
                <textarea
                  value={editData.address}
                  onChange={(e) => setEditData({...editData, address: e.target.value})}
                  className="border border-gray-300 rounded px-3 py-1 flex-1 min-h-[60px]"
                  placeholder="Address"
                />
              ) : (
                <span>{manager.contactInfo.address}</span>
              )}
            </div>
            
            {manager.upperManager && manager.role.toLowerCase() !== "manager" && (
              <div className="flex items-center gap-3">
                <UserIcon className="text-gray-500" size={20} />
                Reports to: {manager.upperManager}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Professional Info</h2>
            <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 font-semibold">
              Salary: ${manager.salary.toLocaleString()}
            </div>
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 font-semibold">
              Joining Date: {manager.joiningDate}
            </div>
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 font-semibold">
              Experience: {manager.experience}
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="font-semibold text-gray-700 mb-1">PAN</p>
              <p className="text-lg font-mono text-yellow-800">
                {manager.documents.pan}
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="font-semibold text-gray-700 mb-1">Aadhar</p>
              <p className="text-lg font-mono text-orange-800">
                {manager.documents.aadhar}
              </p>
            </div>
          </div>
        </div>

        {/* Projects */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Projects</h2>
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editData.projects}
                onChange={(e) => setEditData({...editData, projects: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 min-h-[80px]"
                placeholder="Enter project names separated by commas (e.g., Project A, Project B, Project C)"
              />
              <p className="text-xs text-gray-500">
                Enter project names separated by commas
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {manager.projects.map((project: string, index: number) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {project}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// InfoCard component
function InfoCard({
  title,
  value,
  icon,
  color,
  theme = "red",
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple" | "orange";
  theme?: "red" | "default";
}) {
  const themeMap = {
    red: {
      blue: "bg-blue-50 text-blue-600 border-red-200",
      green: "bg-green-50 text-green-600 border-red-200",
      purple: "bg-purple-50 text-purple-600 border-red-200",
      orange: "bg-orange-50 text-orange-600 border-red-200",
    },
    default: {
      blue: "bg-blue-50 text-blue-600 border-blue-200",
      green: "bg-green-50 text-green-600 border-green-200",
      purple: "bg-purple-50 text-purple-600 border-purple-200",
      orange: "bg-orange-50 text-orange-600 border-orange-200",
    },
  };
  const bgMap = themeMap[theme][color];

  return (
    <div className={`p-4 rounded-lg border ${bgMap}`}>
      <div className="flex items-center gap-2 mb-1 text-sm font-medium">
        {icon}
        {title}
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
