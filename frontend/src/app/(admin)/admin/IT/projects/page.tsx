"use client"

import { JSX, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  Plus,
  Search,
  Filter,
  Briefcase,
  CheckCircle,
  Clock,
  Users,
  Building2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "@/lib/axiosInstance";
import type { Project } from "@/types/index";



export default function ProjectPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await axios.get("/projects");
        console.log("projects fetched");
        setProjects(res.data);
      } catch {
        setProjects([]);
      }
    }
    fetchProjects();
  }, []);

  function matches(p: Project) {
    return (
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.client.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const ongoingProjects = projects.filter((p) => (p.status !== "completed" && p.completionPercentage !== 100) && matches(p))
  const completedProjects = projects.filter((p) => (p.status === "completed" || p.completionPercentage === 100) && matches(p))

  const getStatusIcon = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return <Clock className="text-blue-600" size={16} />
      case "completed":
        return <CheckCircle className="text-green-600" size={16} />
      case "pending":
        return <AlertCircle className="text-yellow-600" size={16} />
      case "on-hold":
        return <AlertCircle className="text-orange-600" size={16} />
      case "cancelled":
        return <AlertCircle className="text-red-600" size={16} />
      default:
        return <AlertCircle className="text-gray-600" size={16} />
    }
  }

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "on-hold":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <button
          onClick={() => router.push("/admin/IT/projects/add")}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Project
        </button>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Filter size={20} />
          Filter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard icon={<Briefcase className="text-blue-600" size={24} />} label="Total Projects" value={projects.length} bg="bg-blue-100" />
        <StatsCard icon={<CheckCircle className="text-green-600" size={24} />} label="Completed" value={completedProjects.length} bg="bg-green-100" />
        <StatsCard icon={<Clock className="text-yellow-600" size={24} />} label="Ongoing" value={ongoingProjects.length} bg="bg-yellow-100" />
      </div>

      <ProjectList title="Ongoing Projects" projects={ongoingProjects} router={router} getStatusIcon={getStatusIcon} getStatusColor={getStatusColor} />
      <ProjectList title="Completed Projects" projects={completedProjects} router={router} getStatusIcon={getStatusIcon} getStatusColor={getStatusColor} />
    </div>
  )
}

function StatsCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: number; bg: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg ${bg}`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-gray-600">{label}</p>
        </div>
      </div>
    </div>
  )
}

function ProjectList({
  title,
  projects,
  router,
  getStatusIcon,
  getStatusColor,
}: {
  title: string
  projects: Project[]
  router: ReturnType<typeof useRouter>
  getStatusIcon: (status: Project["status"]) => JSX.Element
  getStatusColor: (status: Project["status"]) => string
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
          {projects.length}
        </span>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Clock size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No projects found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((p) => (
            <motion.div
              key={p.id}
              whileHover={{ y: -2, scale: 1.01 }}
              className="cursor-pointer bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all space-y-4"
              onClick={() => router.push(`/admin/IT/projects/${p.id}`)}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1 mr-4">{p.name}</h3>
                <div className="flex items-center gap-1">
                  {getStatusIcon(p.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(p.status)}`}>
                    {p.status}
                  </span>
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium text-gray-700">Client:</span> {p.client}</p>
                <p><span className="font-medium text-gray-700">Deadline:</span> {p.deadline ? (() => {
                  const d = new Date(p.deadline);
                  const day = String(d.getDate()).padStart(2, '0');
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  const year = d.getFullYear();
                  return `${day}/${month}/${year}`;
                })() : "-"}</p>
              </div>

              {p.status !== "completed" && (
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-medium text-blue-600">{p.completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${p.completionPercentage}%` }}></div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {(p.departmentsInvolved ?? []).slice(0, 3).map((dept, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                    {dept}
                  </span>
                ))}
                {(p.departmentsInvolved ?? []).length > 3 && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">+{(p.departmentsInvolved ?? []).length - 3}</span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {(p.skillsRequired ?? []).slice(0, 3).map((skill, idx) => (
                  <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                    {skill}
                  </span>
                ))}
                {(p.skillsRequired ?? []).length > 3 && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">+{(p.skillsRequired ?? []).length - 3}</span>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Users size={16} className="text-gray-400" />
                    {(p.membersInvolved ?? []).length} members
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Building2 size={16} className="text-gray-400" />
                    {(p.managersInvolved ?? []).length} managers
                  </div>
                </div>
                {/* Project Links in Card */}
                {p.links && p.links.length > 0 && (
                  <div className="flex gap-2">
                    {p.links.slice(0, 2).map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 text-xs"
                      >
                        Link <ExternalLink size={12} />
                      </a>
                    ))}
                    {p.links.length > 2 && (
                      <span className="text-xs text-gray-500">+{p.links.length - 2} more</span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
