"use client"
import { JSX, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { X, DollarSign, Calendar, Users, CheckCircle, ExternalLink, Plus } from "lucide-react"
import type { Project } from "@/types/index"
import axios from "@/lib/axiosInstance"
import { MultiSelectDropdown } from "@/components/MultiSelectDropdown"

type Member = { id: string; name: string };

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
            <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold text-sm ${bgMap[color]}`}>{name.split(" ").map((n) => n[0]).join("")}</div>
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
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 z-10" onClick={onClose}><X size={24} /></button>
        {children}
      </div>
    </div>
  );
}

export default function OngoingProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const params = useParams();
  const { id: managerId } = params;
  const router = useRouter();
  useEffect(() => {
    if (!managerId) {
      console.error("Manager ID is undefined. Redirecting to admin dashboard.");
      router.replace("/admin");
      return;
    }

    const fetchData = async () => {
      try {
        // First fetch manager data to get organization ID
        const managerResponse = await axios.get(`/user/${managerId}`);
        if (managerResponse.data.success) {
          const manager = managerResponse.data.data;

          // Fetch organization members using organization ID
          if (manager.organizationId) {
            try {
              // Try multiple possible endpoints for fetching organization members
              let membersResponse;
              try {
                // First try the org-members endpoint with empInfo
                membersResponse = await axios.get(`/IT/org-members/empInfo?organizationId=${manager.organizationId}`);
              } catch {
                try {
                  // If that fails, try the direct org-members endpoint
                  membersResponse = await axios.get(`/IT/org-members`);
                } catch {
                  // If both fail, try using organization name if available
                  if (manager.organizationName) {
                    membersResponse = await axios.get(`/IT/org-members/${manager.organizationName}`);
                  } else {
                    throw new Error('Unable to fetch organization members');
                  }
                }
              }
              
              console.log('Members response:', membersResponse.data);
              
              // Handle different response formats
              const membersData = Array.isArray(membersResponse.data) 
                ? membersResponse.data 
                : membersResponse.data.data || [];
              
              // Transform members data to match our Member interface
              const transformedMembers = membersData.map((member: { 
                id?: string; 
                _id?: string; 
                employeeId?: string; 
                name?: string; 
                firstName?: string; 
                lastName?: string; 
              }) => ({
                id: member.id || member._id || member.employeeId || String(Math.random()),
                name: member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unknown Member'
              })).filter((member: Member) => member.name !== 'Unknown Member');

              setAllMembers(transformedMembers);
              console.log('Transformed members:', transformedMembers);
            } catch (memberError) {
              console.error("Error fetching organization members:", memberError);
              // Fallback to empty array if members fetch fails
              setAllMembers([]);
            }
          }
        }

        // Fetch ongoing projects for the manager
        const response = await axios.get("/projects");
        const data = response.data;
        const ongoingProjects = data.filter((p: Project) => p.status !== "completed" && p.completionPercentage !== 100);
        setProjects(ongoingProjects);
      } catch (error) {
        console.error("Error fetching data:", error);
        setProjects([]);
        setAllMembers([]);
      }
    };

    fetchData();
  }, [managerId, router]);

  return (
    <>
      {/* Header with Add Project Button */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ongoing Projects</h1>
          <p className="text-gray-600 mt-2">Manage and track your active projects</p>
        </div>
        <button
          onClick={() => router.push(`/manager/${managerId}/ongoing-projects/add`)}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Project
        </button>
      </div>

      {/* Project List */}
      <div className="grid gap-6 mb-10 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {projects.length === 0 ? (
          <div className="text-center text-gray-500 py-10 col-span-full">No ongoing projects found.</div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-all duration-200 group"
              onClick={() => {
                setDetailProject(project);
                setShowDetailModal(true);
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-700 transition-colors truncate">{project.name}</h3>
                  <p className="text-gray-600 mt-2 text-sm line-clamp-2">{project.description}</p>
                  <div className="flex items-center space-x-4 mt-3 text-sm">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-red-100 text-red-800 border-red-200">
                      {project.status}
                    </span>
                  </div>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <span className="text-3xl font-extrabold text-blue-500 group-hover:text-red-600 transition-colors">{project.completionPercentage}%</span>
                  <p className="text-xs text-gray-600 mt-1">Completion</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Deadline</span>
                  <span className="truncate ml-2">
                    {project.deadline ? new Date(project.deadline).toLocaleDateString() : "not set"}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-red-300 transition-all duration-300 ease-in-out"
                    style={{ width: `${project.completionPercentage}%` }}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <span className="text-sm font-semibold text-gray-700 block mb-2">Team Members:</span>
                <div className="flex flex-wrap gap-1">
                  {(project.membersInvolved ?? []).slice(0, 3).map((member, idx) => (
                    <span
                      key={idx}
                      className="bg-red-50 text-red-700 px-2 py-1 rounded-full text-xs border border-red-200 font-medium truncate max-w-[80px]"
                      title={member}
                    >
                      {member}
                    </span>
                  ))}
                  {(project.membersInvolved ?? []).length > 3 && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                      +{(project.membersInvolved ?? []).length - 3} more
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4 border-t border-gray-100 mt-4">
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold shadow flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditProject(project);
                    setShowEditModal(true);
                  }}
                >
                  Edit Project
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Project Detail Modal */}
      {showDetailModal && detailProject && (
        <Modal onClose={() => setShowDetailModal(false)}>
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2 text-gray-900">{detailProject.name}</h2>
              <p className="text-gray-600 text-lg">{detailProject.projectScope}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <StatBlock
                icon={<DollarSign size={24} />}
                label="Value"
                value={`$${(detailProject.amount ?? 0).toLocaleString()}`}
                color="green"
              />
              <StatBlock
                icon={<Calendar size={24} />}
                label="Assign Date"
                value={detailProject.assignDate ? new Date(detailProject.assignDate).toLocaleDateString() : "-"}
                color="blue"
              />
              <StatBlock
                icon={<Calendar size={24} />}
                label="Start Date"
                value={detailProject.startDate ? new Date(detailProject.startDate).toLocaleDateString() : "-"}
                color="blue"
              />
              <StatBlock
                icon={<Calendar size={24} />}
                label="Deadline"
                value={detailProject.deadline ? new Date(detailProject.deadline).toLocaleDateString() : "-"}
                color="blue"
              />
              <StatBlock
                icon={<Users size={24} />}
                label="Members"
                value={Array.isArray(detailProject.membersInvolved) ? detailProject.membersInvolved.length.toString() : "-"}
                color="purple"
              />
              <StatBlock
                icon={<CheckCircle size={24} />}
                label="Progress"
                value={typeof detailProject.completionPercentage === "number" ? `${detailProject.completionPercentage}%` : "-"}
                color="orange"
              />
              {detailProject.completionPercentage === 100 && (
                <>
                  <StatBlock
                    icon={<Calendar size={24} />}
                    label="End Date"
                    value={detailProject.endDate ? new Date(detailProject.endDate).toLocaleDateString() : "-"}
                    color="green"
                  />
                  <StatBlock
                    icon={<CheckCircle size={24} />}
                    label="Duration"
                    value={detailProject.startDate && detailProject.endDate ? `${Math.ceil((new Date(detailProject.endDate).getTime() - new Date(detailProject.startDate).getTime()) / (1000 * 60 * 60 * 24))} days` : "-"}
                    color="blue"
                  />
                </>
              )}
            </div>
            {detailProject.status === "completed" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {detailProject.budgetVsActual && (
                  <StatBlock
                    icon={<DollarSign size={20} />}
                    label="Budget vs Actual"
                    value={detailProject.budgetVsActual}
                    color="green"
                  />
                )}
                {detailProject.costEfficiency && (
                  <StatBlock
                    icon={<DollarSign size={20} />}
                    label="Cost Efficiency"
                    value={detailProject.costEfficiency}
                    color="green"
                  />
                )}
                {detailProject.successRate && (
                  <StatBlock
                    icon={<CheckCircle size={20} />}
                    label="Success Rate"
                    value={detailProject.successRate}
                    color="blue"
                  />
                )}
                {detailProject.qualityScore && (
                  <StatBlock
                    icon={<CheckCircle size={20} />}
                    label="Quality Score"
                    value={detailProject.qualityScore}
                    color="purple"
                  />
                )}
                {detailProject.clientSatisfaction && (
                  <StatBlock
                    icon={<Users size={20} />}
                    label="Client Satisfaction"
                    value={detailProject.clientSatisfaction}
                    color="orange"
                  />
                )}
              </div>
            )}
            <DetailItem label="Client" content={detailProject.client} />
            <DetailItem label="Client Inputs" content={detailProject.clientInputs} />
            {detailProject.effectAnalysis && (
              <DetailItem label="Effect Analysis" content={detailProject.effectAnalysis} />
            )}
            <TagGroup title="Departments" items={detailProject.departmentsInvolved} color="blue" />
            <TagGroup title="Skills Required" items={detailProject.skillsRequired} color="green" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AvatarList title="Team Members" items={detailProject.membersInvolved} color="blue" />
              <AvatarList title="Managers" items={detailProject.managersInvolved} color="yellow" />
            </div>
            {detailProject.links && detailProject.links.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Links</h3>
                <ul className="space-y-1">
                  {detailProject.links.map((url, idx) => (
                    <li key={idx}>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                        {url} <ExternalLink size={14} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && editProject && (
        <Modal onClose={() => setShowEditModal(false)}>
          <div className="w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Edit Task</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!editProject) return;
                try {
                  await axios.put(`/projects/${editProject.id}`, editProject);
                  setToast({ message: "Project updated successfully!", type: "success" });
                  setShowEditModal(false);
                  setProjects((prev) =>
                    prev.map((p) => (p.id === editProject.id ? editProject : p))
                  );
                } catch {
                  setToast({ message: "Failed to update project.", type: "error" });
                }
              }}
              className="space-y-6"
            >
              {/* Basic Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Project Name</label>
                  <input
                    type="text"
                    value={editProject.name}
                    onChange={(e) =>
                      setEditProject({ ...editProject, name: e.target.value })
                    }
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Client</label>
                  <input
                    type="text"
                    value={editProject.client}
                    onChange={(e) =>
                      setEditProject({ ...editProject, client: e.target.value })
                    }
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
                  />
                </div>
              </div>

              {/* Date Fields */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Start Date</label>
                  <input
                    type="date"
                    value={
                      editProject.startDate
                        ? new Date(editProject.startDate).toISOString().slice(0, 10)
                        : ""
                    }
                    onChange={(e) =>
                      setEditProject({ ...editProject, startDate: e.target.value })
                    }
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Deadline</label>
                  <input
                    type="date"
                    value={
                      editProject.deadline
                        ? new Date(editProject.deadline).toISOString().slice(0, 10)
                        : ""
                    }
                    onChange={(e) =>
                      setEditProject({ ...editProject, deadline: e.target.value })
                    }
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
                  />
                </div>
              </div>

              {/* Progress and Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Progress (%)</label>
                  <input
                    type="number"
                    value={editProject.completionPercentage ?? ""}
                    onChange={(e) =>
                      setEditProject({
                        ...editProject,
                        completionPercentage: Number(e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
                    min={0}
                    max={100}
                    placeholder="0-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Status</label>
                  <select
                    value={editProject.status}
                    onChange={(e) =>
                      setEditProject({
                        ...editProject,
                        status: e.target.value as Project["status"],
                      })
                    }
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Skills Required */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Skills Required</label>
                <textarea
                  value={Array.isArray(editProject.skillsRequired) ? editProject.skillsRequired.join(', ') : editProject.skillsRequired || ""}
                  onChange={(e) =>
                    setEditProject({
                      ...editProject,
                      skillsRequired: e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0),
                    })
                  }
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
                  rows={3}
                  placeholder="Enter skills separated by commas (e.g., JavaScript, React, Node.js)"
                />
              </div>

              {/* Team Members */}
              <div>
                <MultiSelectDropdown
                  label="Team Members"
                  options={allMembers}
                  selected={(editProject.membersInvolved ?? []).map(
                    (name) =>
                      allMembers.find((m) => m.name === name) || { id: name, name }
                  )}
                  onAdd={(m) =>
                    setEditProject({
                      ...editProject,
                      membersInvolved: [...(editProject.membersInvolved ?? []), m.name],
                    })
                  }
                  onRemove={(idx) =>
                    setEditProject({
                      ...editProject,
                      membersInvolved: (editProject.membersInvolved ?? []).filter(
                        (_, i) => i !== idx
                      ),
                    })
                  }
                  getOptionLabel={(m) => m.name}
                  getOptionKey={(m) => m.id}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold text-base"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
