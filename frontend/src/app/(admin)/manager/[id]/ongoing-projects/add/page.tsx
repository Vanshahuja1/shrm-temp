"use client"

import React, { useState } from "react"
import { MultiSelectDropdown } from "@/components/MultiSelectDropdown"
import axios from "@/lib/axiosInstance"
import { useParams } from "next/dist/client/components/navigation"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import type { Project, Department, OrganizationMember } from "@/types/index"

export default function NewProjectModal() {
  const router = useRouter()
  const { id: managerId } = useParams()

  type ProjectForm = Omit<Project, "id" | "amount"> & { assignDate: string; amount: string };
  const [formData, setFormData] = useState<ProjectForm>({
    name: "",
    description: "",
    departmentsInvolved: [],
    membersInvolved: [],
    assignDate: "",
    startDate: "",
    deadline: "",
    managersInvolved: [],
    completionPercentage: 0,
    amount: "",
    client: "",
    projectScope: "",
    clientInputs: "",
    skillsRequired: [],
    status: "pending",
  });
  
  // For tag input UX
  const [skillInput, setSkillInput] = useState("");
  const [allMembers, setAllMembers] = useState<OrganizationMember[]>([]);
  React.useEffect(() => {
    async function fetchOptions() {
      try {
        // Fetch all org members
        const memberRes = await axios.get("/IT/org-members");
        const members = memberRes.data || [];
        setAllMembers(members);
      } catch {
        setAllMembers([]);
      }
    }
    fetchOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        assignDate: formData.assignDate || undefined,
        startDate: formData.startDate || undefined,
        deadline: formData.deadline || undefined,
        description: formData.description,
        client: formData.client,
        amount: formData.amount === "" ? undefined : Number(formData.amount),
        managersInvolved: formData.managersInvolved.map((m) => typeof m === "string" ? m : (m as OrganizationMember).name),
        departmentsInvolved: formData.departmentsInvolved.map((d) => typeof d === "string" ? d : (d as Department).name),
        membersInvolved: formData.membersInvolved.map((m) => typeof m === "string" ? m : (m as OrganizationMember).name),
        skillsRequired: formData.skillsRequired,
        completionPercentage: formData.completionPercentage,
        projectScope: formData.projectScope,
        clientInputs: formData.clientInputs,
        status: formData.status,
      };
      await axios.post("/projects", payload);
      console.log("Project added successfully");
      router.push(`/manager/${managerId}/ongoing-projects`);
    } catch (err) {
      console.log("Failed to add project. Please try again.", err);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4">Add New Project</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field
              label="Project Name"
              value={formData.name}
              onChange={(val) => setFormData({ ...formData, name: val })}
              placeholder="Enter project name"
            />
            <Field
              label="Client"
              value={formData.client}
              onChange={(val) => setFormData({ ...formData, client: val })}
              placeholder="Enter client name"
            />
            <Field
              label="Assign Date"
              type="date"
              value={formData.assignDate}
              onChange={(val) => setFormData({ ...formData, assignDate: val })}
              placeholder="Select assign date"
            />
          </div>

          <TextArea
            label="Description"
            value={formData.description}
            onChange={(val) => setFormData({ ...formData, description: val })}
            placeholder="Enter project description"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Skills Required</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.skillsRequired.map((skill, idx) => (
                <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                  {skill}
                  <button type="button" className="ml-1 text-blue-500 hover:text-red-500" onClick={() => setFormData(prev => ({
                    ...prev,
                    skillsRequired: prev.skillsRequired.filter((_, i) => i !== idx)
                  }))}>
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => {
                if ((e.key === "," || e.key === " ") && skillInput.trim().length > 0) {
                  e.preventDefault();
                  const newSkill = skillInput.trim();
                  if (!formData.skillsRequired.includes(newSkill)) {
                    setFormData(prev => ({
                      ...prev,
                      skillsRequired: [...prev.skillsRequired, newSkill]
                    }));
                  }
                  setSkillInput("");
                }
              }}
              placeholder="Type a skill and hit comma or space (e.g. React, Node.js)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Amount"
              type="number"
              value={formData.amount}
              placeholder="Enter amount"
              onChange={(val) => setFormData({ ...formData, amount: val })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Project["status"] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <Field
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(val) => setFormData({ ...formData, startDate: val })}
            />
            <Field
              label="Deadline"
              type="date"
              value={formData.deadline}
              onChange={(val) => setFormData({ ...formData, deadline: val })}
            />
          </div>

          <TextArea
            label="Project Scope"
            value={formData.projectScope}
            onChange={(val) => setFormData({ ...formData, projectScope: val })}
            placeholder="Describe the scope of the project"
          />

          <TextArea
            label="Client Inputs"
            value={formData.clientInputs}
            onChange={(val) => setFormData({ ...formData, clientInputs: val })}
            placeholder="Enter any client inputs or requirements"
          />

          <MultiSelectDropdown<OrganizationMember>
            label="Members"
            options={allMembers}
            selected={allMembers.filter(m => formData.membersInvolved.includes(m.name))}
            onAdd={m => setFormData(prev => ({ ...prev, membersInvolved: [...prev.membersInvolved, m.name] }))}
            onRemove={idx => setFormData(prev => ({ ...prev, membersInvolved: prev.membersInvolved.filter((_, i) => i !== idx) }))}
            getOptionLabel={m => m.name}
            getOptionKey={m => m.id}
          />

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  name: "",
                  description: "",
                  departmentsInvolved: [],
                  membersInvolved: [],
                  assignDate: "",
                  startDate: "",
                  deadline: "",
                  managersInvolved: [],
                  completionPercentage: 0,
                  amount: "",
                  client: "",
                  projectScope: "",
                  clientInputs: "",
                  skillsRequired: [],
                  status: "pending",
                });
                router.back();
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
              <Plus size={18} />
              Add Project
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

type TextAreaProps = {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
};

function TextArea({ label, value, onChange, placeholder }: TextAreaProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder={placeholder || ""}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
      />
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
};

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
      />
    </div>
  );
}
