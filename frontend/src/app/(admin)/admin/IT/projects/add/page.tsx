"use client"
import React, { useState } from "react"
import { MultiSelectDropdown } from "@/components/MultiSelectDropdown"
import axios from "@/lib/axiosInstance"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import type { Project, Department, OrganizationMember } from "@/types/index"



export default function AddProjectPage() {
  const router = useRouter();

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

  // For dropdown options
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [allMembers, setAllMembers] = useState<OrganizationMember[]>([]);
  const [allManagers, setAllManagers] = useState<OrganizationMember[]>([]);

  React.useEffect(() => {
    async function fetchOptions() {
      try {
        // Fetch all org members
        const memberRes = await axios.get("/IT/org-members");
        const members = memberRes.data || [];
        setAllMembers(members);
        setAllManagers(members.filter((m: OrganizationMember) => m.role && m.role.toLowerCase().trim() === "manager" && m.name));

        // Fetch all departments for real names and IDs
        const deptRes = await axios.get("/departments");
        const departments = deptRes.data?.data || deptRes.data || [];
        setAllDepartments(departments.map((d: Department) => ({ id: d._id ?? d.id, name: d.name })));
      } catch (error) {
        console.error("Error fetching options:", error);
        setAllDepartments([]);
        setAllMembers([]);
        setAllManagers([]);
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
        // You can add links, documentation, ongoing if needed
      };
      await axios.post("/projects", payload);
      console.log("Project added successfully");
      router.push("/admin/IT/projects");
    } catch (err) {
      console.log("Failed to add project. Please try again.", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Add New Project</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

        <MultiSelectDropdown<Department>
          label="Departments"
          options={allDepartments}
          selected={allDepartments.filter(d => formData.departmentsInvolved.includes(d.name))}
          onAdd={d => setFormData(prev => ({ ...prev, departmentsInvolved: [...prev.departmentsInvolved, d.name] }))}
          onRemove={idx => setFormData(prev => ({ ...prev, departmentsInvolved: prev.departmentsInvolved.filter((_, i) => i !== idx) }))}
          getOptionLabel={d => d.name}
          getOptionKey={d => d.id}
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

        <MultiSelectDropdown<OrganizationMember>
          label="Managers"
          options={allManagers}
          selected={allManagers.filter(m => formData.managersInvolved.includes(m.name))}
          onAdd={m => setFormData(prev => ({ ...prev, managersInvolved: [...prev.managersInvolved, m.name] }))}
          onRemove={idx => setFormData(prev => ({ ...prev, managersInvolved: prev.managersInvolved.filter((_, i) => i !== idx) }))}
          getOptionLabel={m => m.name}
          getOptionKey={m => m.id}
        />

        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Project
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/IT/projects")}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
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
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}
