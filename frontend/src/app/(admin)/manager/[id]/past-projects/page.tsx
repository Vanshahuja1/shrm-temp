"use client"

import { JSX, useEffect, useState } from "react"
import type { Project } from "@/types/index"
import axios from "@/lib/axiosInstance"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, CheckCircle, DollarSign, ExternalLink, Users, X } from 'lucide-react'

function StatBlock({ icon, label, value, color }: { icon: JSX.Element; label: string; value: string; color: "green" | "blue" | "purple" | "orange" }) {
  const colorMap = {
    green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-600" },
    blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600" },
    purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-600" },
    orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-600" },
  };
  const styles = colorMap[color];

  return (
    <div className={`p-4 md:p-5 rounded-lg border ${styles.bg} ${styles.border} min-h-[100px] md:min-h-[120px] flex flex-col justify-center`}>
      <div className="flex items-center gap-2 mb-2 text-sm md:text-base text-gray-700 font-medium">
        <span className={`${styles.text}`}>{icon}</span>
        <span className="break-words">{label}</span>
      </div>
      <p className={`text-xl md:text-2xl font-bold ${styles.text} break-words`} title={value}>{value}</p>
    </div>
  );
}

function DetailItem({ label, content }: { label: string; content: string }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
      <p className="text-gray-700 mt-1">{content}</p>
    </div>
  );
}

function TagGroup({ title, items, color }: { title: string; items: string[]; color: "blue" | "green" }) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {(items ?? []).map((item, idx) => (
          <span key={idx} className={`px-3 py-1 rounded-full text-sm font-medium ${colorMap[color]}`}>{item}</span>
        ))}
      </div>
    </div>
  );
}

function AvatarList({ title, items, color }: { title: string; items: string[]; color: "blue" | "yellow" }) {
  const bgMap = {
    blue: "bg-blue-600",
    yellow: "bg-yellow-600",
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <div className="space-y-2">
        {(items ?? []).map((name, idx) => (
          <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
            <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold text-sm ${bgMap[color]}`}>
              {name.split(" ").map((n) => n[0]).join("")}
            </div>
            <span className="text-gray-900 font-medium">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  return (
    <div className={`fixed top-6 right-6 z-50 px-4 py-2 rounded shadow-lg text-white ${type === "success" ? "bg-green-600" : "bg-red-600"}`}>
      <span>{message}</span>
      <button className="ml-3 text-white" onClick={onClose}><X size={16} /></button>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-900 bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-6xl max-h-[95vh] overflow-y-auto relative border border-gray-200">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 z-10" onClick={onClose}>
          <X size={24} />
        </button>
        {children}
      </div>
    </div>
  );
}

export default function PastProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true)
        const response = await axios.get("/projects")
        const data: Project[] = response.data
        // Filter for completed projects only
        const completed = data.filter((p) => p.completionPercentage === 100)
        setProjects(completed)
      } catch (error) {
        console.error("Error fetching projects:", error)
        setProjects([])
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleEdit = (project: Project) => {
    setEditingProject({ ...project })
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!editingProject) return
    try {
      const response = await axios.put(`/projects/${editingProject.id}`, editingProject)
      const updatedProject = response.data
      
      // Update the projects list
      setProjects(projects.map(p => p.id === updatedProject._id ? updatedProject : p))
      setSelectedProject(updatedProject)
      setIsEditing(false)
      setEditingProject(null)
      setToast({ message: "Project updated successfully!", type: "success" })
    } catch (error) {
      console.error('Error updating project:', error)
      setToast({ message: "Failed to update project.", type: "error" })
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditingProject(null)
  }

  const openDetailModal = (project: Project) => {
    setSelectedProject(project)
    setShowDetailModal(true)
    setIsEditing(false)
    setEditingProject(null)
  }

  const closeDetailModal = () => {
    setShowDetailModal(false)
    setSelectedProject(null)
  }

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Past Projects</h2>
            <p className="text-gray-600 mt-2">Review completed projects with detailed analytics and performance metrics</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">{projects.length}</div>
            <div className="text-sm text-gray-600">Completed Projects</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                    <div className="flex items-center space-x-4">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="text-right ml-6">
                    <div className="h-12 w-20 bg-gray-200 rounded mb-1"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="h-5 bg-gray-200 rounded w-1/4 mb-3"></div>
                  <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j}>
                        <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                        <div className="h-5 bg-gray-200 rounded w-20"></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((k) => (
                      <div key={k}>
                        <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                        <div className="h-5 bg-gray-200 rounded w-12"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Past Projects Found</h3>
            <p className="text-gray-600">Once projects are completed, they will appear here with detailed analytics.</p>
          </div>
        ) : (
          projects.map((project) => (
            <div 
              key={project.id} 
              className="bg-white rounded-lg shadow-sm border border-red-200 p-6 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
              onClick={() => openDetailModal(project)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
                  <p className="text-gray-600 mt-2">{project.projectScope}</p>
                  <div className="flex items-center space-x-4 mt-3 text-sm">
                    <Badge className="bg-green-100 text-green-800">
                      COMPLETED
                    </Badge>
                    <span className="text-gray-500">
                      {formatDate(project.assignDate)} - {formatDate(project.endDate || "")}
                    </span>
                  </div>
                </div>
                <div className="text-right ml-6">
                  <span className="text-4xl font-bold text-green-500">100%</span>
                  <p className="text-sm text-gray-600 mt-1">Completed</p>
                </div>
              </div>
              
              {/* Historical Data */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-3">Historical Data</h4>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <p className="font-medium">
                      {project.assignDate && project.endDate
                        ? `${Math.ceil((new Date(project.endDate).getTime() - new Date(project.assignDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} months`
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Team Size:</span>
                    <p className="font-medium">{Array.isArray(project.membersInvolved) ? project.membersInvolved.length : 0} members</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Budget vs Actual:</span>
                    <p className="font-medium">
                      {project.budgetVsActual ? project.budgetVsActual : "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Cost Efficiency:</span>
                    <p className="font-medium text-green-600">
                      {project.costEfficiency ? project.costEfficiency : "-"}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Performance Analysis */}
              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Performance Analysis</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Success Rate:</span>
                    <p className="font-medium text-green-600">{project.successRate ? project.successRate : "-"}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Quality Score:</span>
                    <p className="font-medium text-blue-600">{project.qualityScore ? project.qualityScore : "-"}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Client Satisfaction:</span>
                    <p className="font-medium text-red-600">{project.clientSatisfaction ? project.clientSatisfaction : "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Project Detail Modal */}
      {showDetailModal && selectedProject && (
        <Modal onClose={closeDetailModal}>
          <div className="space-y-8 p-4 lg:p-6 max-w-full overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-200 pb-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">{selectedProject?.name}</span>
                  <span className="text-sm text-gray-600 mt-1">Complete Project Details</span>
                </div>
                <div className="flex space-x-3 shrink-0">
                  {!isEditing ? (
                    <Button onClick={() => handleEdit(selectedProject!)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 text-sm sm:text-base">
                      Edit Project
                    </Button>
                  ) : (
                    <>
                      <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 text-sm sm:text-base">
                        Save Changes
                      </Button>
                      <Button onClick={handleCancel} variant="outline" className="border-gray-300 hover:bg-gray-50 px-4 sm:px-6 py-2 text-sm sm:text-base">
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Project Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Project Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <StatBlock icon={<DollarSign size={24} />} label="Value" value={`$${(selectedProject?.amount ?? 0).toLocaleString()}`} color="green" />
                <StatBlock icon={<Calendar size={24} />} label="Assign Date" value={selectedProject?.assignDate ? new Date(selectedProject.assignDate).toLocaleDateString() : "-"} color="blue" />
                <StatBlock icon={<Calendar size={24} />} label="Start Date" value={selectedProject?.startDate ? new Date(selectedProject.startDate).toLocaleDateString() : "-"} color="blue" />
                <StatBlock icon={<Calendar size={24} />} label="Deadline" value={selectedProject?.deadline ? new Date(selectedProject.deadline).toLocaleDateString() : "-"} color="blue" />
                <StatBlock icon={<Users size={24} />} label="Members" value={Array.isArray(selectedProject?.membersInvolved) ? selectedProject.membersInvolved.length.toString() : "-"} color="purple" />
                <StatBlock icon={<CheckCircle size={24} />} label="Progress" value={typeof selectedProject?.completionPercentage === "number" ? `${selectedProject.completionPercentage}%` : "-"} color="orange" />
                {selectedProject?.completionPercentage === 100 && (
                  <>
                    <StatBlock icon={<Calendar size={24} />} label="End Date" value={selectedProject?.endDate ? new Date(selectedProject.endDate).toLocaleDateString() : "-"} color="green" />
                    <StatBlock
                      icon={<CheckCircle size={24} />}
                      label="Duration"
                      value={
                        selectedProject?.startDate && selectedProject?.endDate
                          ? `${Math.ceil((new Date(selectedProject.endDate).getTime() - new Date(selectedProject.startDate).getTime()) / (1000 * 60 * 60 * 24))} days`
                          : "-"
                      }
                      color="blue"
                    />
                  </>
                )}
              </div>
            </div>

            <Separator className="my-8" />

            {/* Team & Resources */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                Team & Resources
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <AvatarList title="Team Members" items={selectedProject?.membersInvolved || []} color="blue" />
                <AvatarList title="Managers" items={selectedProject?.managersInvolved || []} color="yellow" />
              </div>
              <div className="mt-6">
                <TagGroup title="Departments" items={selectedProject?.departmentsInvolved || []} color="blue" />
                <TagGroup title="Skills Required" items={selectedProject?.skillsRequired || []} color="green" />
              </div>
            </div>

            <Separator className="my-8" />

            {/* Project Links */}
            {selectedProject?.links && selectedProject.links.length > 0 && (
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></span>
                  Project Links
                </h3>
                <ul className="space-y-2">
                  {selectedProject.links.map((url, idx) => (
                    <li key={idx}>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                        {url} <ExternalLink size={14} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Separator className="my-8" />

            {/* Feedback / Client Info */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Client & Feedback
              </h3>
              <DetailItem label="Client" content={selectedProject?.client || ""} />
              <DetailItem label="Client Inputs" content={selectedProject?.clientInputs || ""} />
              {selectedProject?.effectAnalysis && <DetailItem label="Effect Analysis" content={selectedProject.effectAnalysis} />}
            </div>

            <Separator className="my-8" />

            {/* Performance Metrics */}
            {selectedProject?.status === "completed" && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                  Performance Metrics & Analytics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedProject?.budgetVsActual && (
                    <StatBlock icon={<DollarSign size={20} />} label="Budget vs Actual" value={selectedProject.budgetVsActual} color="green" />
                  )}
                  {selectedProject?.costEfficiency && (
                    <StatBlock icon={<DollarSign size={20} />} label="Cost Efficiency" value={selectedProject.costEfficiency} color="green" />
                  )}
                  {selectedProject?.successRate && (
                    <StatBlock icon={<CheckCircle size={20} />} label="Success Rate" value={selectedProject.successRate} color="blue" />
                  )}
                  {selectedProject?.qualityScore && (
                    <StatBlock icon={<CheckCircle size={20} />} label="Quality Score" value={selectedProject.qualityScore} color="purple" />
                  )}
                  {selectedProject?.clientSatisfaction && (
                    <StatBlock icon={<Users size={20} />} label="Client Satisfaction" value={selectedProject.clientSatisfaction} color="orange" />
                  )}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
