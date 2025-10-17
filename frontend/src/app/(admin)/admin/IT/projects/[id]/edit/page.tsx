"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MultiSelectDropdown } from "@/components/MultiSelectDropdown";
import type { Project } from "../../../../types";
import axios from "@/lib/axiosInstance";

// Simple interface for dropdown options
interface DropdownOption {
  id: string | number;
  name: string;
  role?: string;
}

// Interface for API response data
interface MemberData {
  id?: string | number;
  _id?: string;
  name?: string;
  memberName?: string;
  role?: string;
}

export default function EditProjectPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [allDepartments, setAllDepartments] = useState<DropdownOption[]>([]);
  const [allMembers, setAllMembers] = useState<DropdownOption[]>([]);
  const [allManagers, setAllManagers] = useState<DropdownOption[]>([]);
  // Local state for skills text
  const [skillsText, setSkillsText] = useState<string>("");

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await axios.get(`/projects/${id}`);
        if (!res.data) {
          router.push("/admin/IT/projects");
        } else {
          setProject(res.data);
          setSkillsText(
            Array.isArray(res.data.skillsRequired)
              ? res.data.skillsRequired.join(", ")
              : ""
          );
        }
      } catch {
        router.push("/admin/IT/projects");
      }
    }
    async function fetchOptions() {
      try {
        // Fetch departments
        const deptRes = await axios.get("/departments");
        console.log("Departments response:", deptRes.data);
        
        if (deptRes.data && deptRes.data.success && Array.isArray(deptRes.data.data)) {
          const formattedDepartments: DropdownOption[] = deptRes.data.data.map((d: { _id?: string; id?: string; name: string }) => ({
            id: d._id ?? d.id ?? d.name,
            name: d.name,
          }));
          setAllDepartments(formattedDepartments);
        } else {
          setAllDepartments([]);
        }

        // Fetch organization members
        let memberRes;
        try {
          memberRes = await axios.get("/IT/org-members");
        } catch {
          console.log("First API failed, trying alternative...");
          // Try alternative API if the first one fails
          try {
            memberRes = await axios.get("/IT/org-members/empInfo");
          } catch {
            console.log("Second API failed, trying third alternative...");
            // Try another alternative
            memberRes = await axios.get("/departments/6889a9394f263f6b1e23a7e2");
          }
        }
        
        console.log("Members response:", memberRes.data);
        
        const members = Array.isArray(memberRes.data) ? memberRes.data : [];
        
        // Filter and format members with proper structure
        const formattedMembers: DropdownOption[] = members
          .filter((m: MemberData) => m && (m.name || m.memberName))
          .map((m: MemberData) => ({
            id: m.id || m._id || m.name || m.memberName || 'unknown',
            name: m.name || m.memberName || 'Unknown',
            role: (m.role || 'employee').toLowerCase(),
          }));

        setAllMembers(formattedMembers);
        
        // Filter managers
        const managers = formattedMembers.filter(
          (m: DropdownOption) =>
            m.role && m.role.toLowerCase().trim() === "manager" && m.name
        );
        setAllManagers(managers);
        
        console.log("Formatted members:", formattedMembers);
        console.log("Filtered managers:", managers);
        
      } catch (error) {
        console.error("Error fetching options:", error);
        setAllDepartments([]);
        setAllMembers([]);
        setAllManagers([]);
      }
    }
    if (id) fetchProject();
    fetchOptions();
  }, [id, router]);

  const handleChange = <K extends keyof Project>(key: K, value: Project[K]) => {
    if (!project) return;
    setProject({ ...project, [key]: value });
  };

  const handleSubmit = async () => {
    if (!project) return;
    try {
      await axios.put(`/projects/${id}`, project);
      console.log("Project updated successfully");
      router.push(`/admin/IT/projects/${id}`);
    } catch {
      alert("Failed to update project. Please try again.");
    }
  };

  if (!project) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save Changes
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Project</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field
            label="Name"
            value={project.name}
            onChange={(val) => handleChange("name", val as string)}
          />
          <Field
            label="Assign Date"
            value={project.assignDate ? new Date(project.assignDate).toISOString().slice(0, 10) : ""}
            type="date"
            onChange={(val) => {
              // Store the date string directly
              handleChange("assignDate", val || "");
            }}
          />
          <Field
            label="Start Date"
            value={project.startDate ? new Date(project.startDate).toISOString().slice(0, 10) : ""}
            type="date"
            onChange={(val) => {
              // Store the date string directly
              handleChange("startDate", val || "");
            }}
          />
          <Field
            label="Deadline"
            value={project.deadline ? new Date(project.deadline).toISOString().slice(0, 10) : ""}
            type="date"
            onChange={(val) => {
              // Store the date string directly
              handleChange("deadline", val || "");
            }}
          />
          {/* Show end date and duration fields if project is 100% complete or status is completed */}
          {(project.completionPercentage === 100 || project.status === "completed") && (
            <>
              <Field
                label="End Date"
                value={project.endDate ? new Date(project.endDate).toISOString().slice(0, 10) : ""}
                type="date"
                onChange={(val) => handleChange("endDate", val || "")}
              />
              <Field
                label="Duration (days)"
                value={project.startDate && project.endDate ? Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24)) : ""}
                type="number"
                onChange={() => {}}
                // Duration is calculated, not editable
              />
            </>
          )}
          <Field
            label="Price"
            value={
              project.amount === undefined ||
              project.amount === null ||
              project.amount === 0
                ? ""
                : project.amount
            }
            type="number"
            placeholder="Enter price"
            onChange={(val) =>
            handleChange("amount", val === "" ? 0 : Number(val))
            }
          />
          <Field
            label="Completion %"
            value={
              project.completionPercentage === undefined ||
              project.completionPercentage === null
                ? ""
                : project.completionPercentage
            }
            type="number"
            placeholder="Enter completion %"
            onChange={(val) => {
              if (val === "") {
              handleChange("completionPercentage", 0);
              } else {
                const newVal = Number(val);
                handleChange("completionPercentage", newVal);
              }
            }}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={project.status || "pending"}
            onChange={(e) => handleChange("status", e.target.value as Project["status"])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Project Links (comma-separated URLs) */}
        <TextArea
          label="Project Links (comma-separated URLs)"
          value={Array.isArray(project.links) ? project.links.join(", ") : ""}
          onChange={val => handleChange("links", val.split(",").map(s => s.trim()).filter(Boolean))}
          placeholder="https://example.com, https://another.com"
        />

        <div className="space-y-6">
          <TextArea
            label="Project Scope"
            value={project.projectScope}
            onChange={(val) => handleChange("projectScope", val)}
          />
          <TextArea
            label="Client Inputs"
            value={project.clientInputs}
            onChange={(val) => handleChange("clientInputs", val)}
          />
          <TextArea
            label="Effect Analysis"
            value={project.effectAnalysis || ""}
            onChange={(val) => handleChange("effectAnalysis", val)}
          />
          {/* Conditionally show additional fields if status is completed */}
          {project.status === "completed" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field
                label="Budget vs Actual ($)"
                value={project.budgetVsActual?? ""}
                onChange={(val) => handleChange("budgetVsActual", val)}
                placeholder="e.g. $60,000 / $58,000"
              />
              <Field
                label="Cost Efficiency"
                value={project.costEfficiency ?? ""}
                onChange={(val) => handleChange("costEfficiency", val)}
                placeholder="e.g. 3% saved"
              />
              <Field
                label="Success Rate (%)"
                value={project.successRate ?? ""}
                onChange={(val) => handleChange("successRate", val)}
                placeholder="e.g. 95%"
              />
              <Field
                label="Quality Score"
                value={project.qualityScore ?? ""}
                onChange={(val) => handleChange("qualityScore", val)}
                placeholder="e.g. 4.5/5"
              />
              <Field
                label="Client Satisfaction"
                value={project.clientSatisfaction ?? ""}
                onChange={(val) => handleChange("clientSatisfaction", val)}
                placeholder="e.g. Excellent"
              />
            </div>
          )}
          <MultiSelectDropdown
            label="Departments"
            options={allDepartments}
            selected={(project.departmentsInvolved ?? []).map(
              (name: string) =>
                allDepartments.find((d) => d.name === name) || {
                  id: name,
                  name,
                }
            )}
            onAdd={(d) =>
              handleChange("departmentsInvolved", [
                ...(project.departmentsInvolved ?? []),
                d.name,
              ])
            }
            onRemove={(idx) =>
              handleChange(
                "departmentsInvolved",
                (project.departmentsInvolved ?? []).filter(
                  (_: unknown, i: number) => i !== idx
                )
              )
            }
            getOptionLabel={(d) => d.name}
            getOptionKey={(d) => d.id}
          />
          <TextArea
            label="Skills Required (comma-separated)"
            value={typeof skillsText === "string" ? skillsText : ""}
            onChange={setSkillsText}
            onBlur={() =>
              handleChange(
                "skillsRequired",
                (typeof skillsText === "string" ? skillsText : "")
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
          />
          <MultiSelectDropdown
            label="Members"
            options={allMembers}
            selected={(project.membersInvolved ?? []).map(
              (name: string) =>
                allMembers.find((m) => m.name === name) || { id: name, name }
            )}
            onAdd={(m) =>
              handleChange("membersInvolved", [
                ...(project.membersInvolved ?? []),
                m.name,
              ])
            }
            onRemove={(idx) =>
              handleChange(
                "membersInvolved",
                (project.membersInvolved ?? []).filter(
                  (_: unknown, i: number) => i !== idx
                )
              )
            }
            getOptionLabel={(m) => m.name}
            getOptionKey={(m) => m.id}
          />
          <MultiSelectDropdown
            label="Managers"
            options={allManagers}
            selected={(project.managersInvolved ?? []).map(
              (name: string) =>
                allManagers.find((m) => m.name === name) || { id: name, name }
            )}
            onAdd={(m) =>
              handleChange("managersInvolved", [
                ...(project.managersInvolved ?? []),
                m.name,
              ])
            }
            onRemove={(idx) =>
              handleChange(
                "managersInvolved",
                (project.managersInvolved ?? []).filter(
                  (_: unknown, i: number) => i !== idx
                )
              )
            }
            getOptionLabel={(m) => m.name}
            getOptionKey={(m) => m.id}
          />
        </div>
      </div>
    </div>
  );
}



function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string | number;
  type?: string;
  placeholder?: string;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  onBlur,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  onBlur?: () => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        spellCheck={true}
        autoCorrect="on"
        autoComplete="off"
      />
    </div>
  );
}
