"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  Clock,
  Award,
  Target,
  Pencil,
  Trash2,
  UserIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "@/lib/axiosInstance";
import type { OrganizationMember } from "../../../types";

export default function MemberDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [member, setMember] = useState<OrganizationMember | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const response = await axios.get(`/IT/org-members/${id}`);
        setMember(response.data);
      } catch (error) {
        console.error("Error fetching member:", error);
      }
    };
    fetchMember();
  }, [id]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/IT/org-members/${id}`);
      setIsDeleteDialogOpen(false);
      router.push("/admin/IT/members");
    } catch (error) {
      console.error("Error deleting member:", error);
      alert("An error occurred while deleting the member.");
    }
  };

  if (!member) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/admin/IT/members/${member.id}/edit`)}
            className="flex items-center gap-2 text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Pencil size={16} /> Edit Member
          </button>
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 text-sm px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">
                <Trash2 size={16} /> Delete Member
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Delete Member</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete <strong>{member.name}</strong>
                  ? This action cannot be undone and will permanently remove all
                  their data from the system.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <button
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
                >
                  Delete Member
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {member.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{member.name}</h1>
            <p className="text-xl text-gray-600">
              {member.role} – {member.department}
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <InfoCard
            title="Tasks/Day"
            value={`${member.performanceMetrics.tasksPerDay}/5`}
            icon={<Target />}
            color="blue"
          />
          <InfoCard
            title="Attendance"
            value={`${member.performanceMetrics.attendanceScore}%`}
            icon={<Clock />}
            color="green"
          />
          <InfoCard
            title="Manager Rating"
            value={`${member.performanceMetrics.managerReviewRating}/5`}
            icon={<Award />}
            color="purple"
          />
          <InfoCard
            title="Performance"
            value={`${member.performanceMetrics.combinedPercentage}%`}
            icon={<TrendingUp />}
            color="orange"
          />
        </div>

        {/* Contact + Professional Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Contact Info</h2>
            <div className="flex items-center gap-3">
              <Mail className="text-gray-500" size={20} />
              {member.contactInfo.email}
            </div>
            <div className="flex items-center gap-3">
              <Phone className="text-gray-500" size={20} />
              {member.contactInfo.phone}
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="text-gray-500" size={20} />
              {member.contactInfo.address}
            </div>
            {member.upperManager && !["manager", "admin"].includes(member.role.toLowerCase()) && (
              <div className="flex items-center gap-3">
                <UserIcon className="text-gray-500" size={20} />
                Reports to: {member.upperManagerName}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              Professional Info
            </h2>
            <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 font-semibold">
              Salary: LKR {member.salary.toLocaleString()}
            </div>
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-semibold">
              Joining Date: {member.joiningDate}
            </div>
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 font-semibold">
              Experience: {member.experience}
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
                {member.documents.pan}
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="font-semibold text-gray-700 mb-1">Aadhar</p>
              <p className="text-lg font-mono text-orange-800">
                {member.documents.aadhar}
              </p>
            </div>
          </div>
        </div>

        {/* Associated Employees and Interns (for managers) */}
        {member.role.toLowerCase() === "manager" &&
          (() => {
            type ManagerWithMembers = OrganizationMember & {
              employees?: Array<{ id: string; name?: string }>;
              interns?: Array<{ id: string; name?: string }>;
            };
            const manager = member as ManagerWithMembers;
            return (
              <div className="space-y-4">
                {Array.isArray(manager.employees) && manager.employees.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Employees</h2>
                    <ul className="list-disc list-inside text-gray-700 text-base ml-4">
                      {manager.employees.map((emp) => (
                        <li key={emp.id}>{emp.name ? emp.name : emp.id}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {Array.isArray(manager.interns) && manager.interns.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Interns</h2>
                    <ul className="list-disc list-inside text-gray-700 text-base ml-4">
                      {manager.interns.map((intern) => (
                        <li key={intern.id}>{intern.name ? intern.name : intern.id}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })()}

        {/* Projects */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Projects</h2>
          <div className="flex flex-wrap gap-2">
            {member.projects.map((project, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {project}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple" | "orange";
}) {
  const bgMap = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
  }[color];

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
