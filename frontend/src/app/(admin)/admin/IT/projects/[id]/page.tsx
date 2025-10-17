"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, JSX } from "react";
import {
  ExternalLink,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
} from "lucide-react";
import type { Project } from "@/types/index";
import axios from "@/lib/axiosInstance";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await axios.get(`/projects/${id}`);
        if (!res.data) {
          router.push("/admin/IT/projects");
        } else {
          setProject(res.data);
        }
      } catch {
        router.push("/admin/IT/projects");
      }
    }
    if (id) fetchProject();
  }, [id, router]);

  if (!project) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/admin/IT/projects")}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Projects
        </button>
        {project.showcaseLink && (
          <a
            href={project.showcaseLink}
            target="_blank"
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            View Project <ExternalLink size={16} />
          </a>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/admin/IT/projects/${id}/edit`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Edit
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Delete Project?</h2>
            <p className="mb-6">Are you sure you want to delete this project? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setDeleting(true);
                  try {
                    await axios.delete(`/projects/${id}`);
                    console.log("Project deleted successfully");
                    setShowDeleteModal(false);
                    router.push("/admin/IT/projects");
                  } catch {
                    alert("Failed to delete project. Please try again.");
                  } finally {
                    setDeleting(false);
                  }
                }}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            {project.name}
          </h1>
          <p className="text-gray-600">{project.projectScope}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatBlock
            icon={<DollarSign size={20} />}
            label="Value"
            value={`LKR ${(project.amount ?? 0).toLocaleString()}`}
            color="green"
          />
          <StatBlock
            icon={<Calendar size={20} />}
            label="Assign Date"
            value={project.assignDate ? new Date(project.assignDate).toLocaleDateString() : "-"}
            color="blue"
          />
          <StatBlock
            icon={<Calendar size={20} />}
            label="Start Date"
            value={project.startDate ? new Date(project.startDate).toLocaleDateString() : "-"}
            color="blue"
          />
          <StatBlock
            icon={<Calendar size={20} />}
            label="Deadline"
            value={project.deadline ? new Date(project.deadline).toLocaleDateString() : "-"}
            color="blue"
          />
          <StatBlock
            icon={<Users size={20} />}
            label="Members"
            value={Array.isArray(project.membersInvolved) ? project.membersInvolved.length.toString() : "-"}
            color="purple"
          />
          <StatBlock
            icon={<CheckCircle size={20} />}
            label="Progress"
            value={typeof project.completionPercentage === "number" ? `${project.completionPercentage}%` : "-"}
            color="orange"
          />
          {/* Show end date and duration if project is 100% complete */}
          {project.completionPercentage === 100 && (
            <>
              <StatBlock
                icon={<Calendar size={20} />}
                label="End Date"
                value={project.endDate ? new Date(project.endDate).toLocaleDateString() : "-"}
                color="green"
              />
              <StatBlock
                icon={<CheckCircle size={20} />}
                label="Duration"
                value={project.startDate && project.endDate ? `${Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))} days` : "-"}
                color="blue"
              />
            </>
          )}
        </div>

        {/* Completed Project Metrics */}
        {project.status === "completed" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {project.budgetVsActual && (
              <StatBlock
                icon={<DollarSign size={20} />}
                label="Budget vs Actual"
                value={project.budgetVsActual}
                color="green"
              />
            )}
            {project.costEfficiency && (
              <StatBlock
                icon={<DollarSign size={20} />}
                label="Cost Efficiency"
                value={project.costEfficiency}
                color="green"
              />
            )}
            {project.successRate && (
              <StatBlock
                icon={<CheckCircle size={20} />}
                label="Success Rate"
                value={project.successRate}
                color="blue"
              />
            )}
            {project.qualityScore && (
              <StatBlock
                icon={<CheckCircle size={20} />}
                label="Quality Score"
                value={project.qualityScore}
                color="purple"
              />
            )}
            {project.clientSatisfaction && (
              <StatBlock
                icon={<Users size={20} />}
                label="Client Satisfaction"
                value={project.clientSatisfaction}
                color="orange"
              />
            )}
          </div>
        )}

        <DetailItem label="Client" content={project.client} />
        <DetailItem label="Client Inputs" content={project.clientInputs} />

        {project.effectAnalysis && (
          <DetailItem
            label="Effect Analysis"
            content={project.effectAnalysis}
          />
        )}

        <TagGroup
          title="Departments"
          items={project.departmentsInvolved}
          color="blue"
        />
        <TagGroup
          title="Skills Required"
          items={project.skillsRequired}
          color="green"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AvatarList
            title="Team Members"
            items={project.membersInvolved}
            color="blue"
          />
          <AvatarList
            title="Managers"
            items={project.managersInvolved}
            color="yellow"
          />
        </div>

        {/* Project Links */}
        {project.links && project.links.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Links</h3>
            <ul className="space-y-1">
              {project.links.map((url, idx) => (
                <li key={idx}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {url} <ExternalLink size={14} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}



function StatBlock({
  icon,
  label,
  value,
  color,
}: {
  icon: JSX.Element;
  label: string;
  value: string;
  color: "green" | "blue" | "purple" | "orange";
}) {
  const colorMap = {
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-600",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-600",
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-600",
    },
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-600",
    },
  };

  const styles = colorMap[color];

  return (
    <div className={`p-4 rounded-lg border ${styles.bg} ${styles.border}`}>
      <div className="flex items-center gap-2 mb-1 text-sm text-gray-700 font-medium">
        <span className={`${styles.text}`}>{icon}</span>
        <span>{label}</span>
      </div>
      <p className={`text-xl font-bold ${styles.text}`}>{value}</p>
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

function TagGroup({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: "blue" | "green";
}) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {(items ?? []).map((item, idx) => (
          <span
            key={idx}
            className={`px-3 py-1 rounded-full text-sm font-medium ${colorMap[color]}`}
          >
            {item}
          </span>
        ))}

      </div>
    </div>
  );
}

function AvatarList({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: "blue" | "yellow";
}) {
  const bgMap = {
    blue: "bg-blue-600",
    yellow: "bg-yellow-600",
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <div className="space-y-2">
        {(items ?? []).map((name, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 bg-gray-50 rounded-lg p-3"
          >
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold text-sm ${bgMap[color]}`}
            >
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <span className="text-gray-900 font-medium">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
