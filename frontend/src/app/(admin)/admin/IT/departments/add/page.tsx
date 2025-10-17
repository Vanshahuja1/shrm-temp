"use client"

import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { sampleMembers } from "@/lib/sampleData"
import { useRouter } from "next/navigation"
import axios from "@/lib/axiosInstance"
import { MultiSelectDropdown } from "@/components/MultiSelectDropdown"

type Member = {
  id: string;
  name: string;
  role: string;
};
type FormData = {
  name: string;
  head: string;
  budget: string;
  organizationId: string;
  managers: Member[];
  employees: Member[];
  interns: Member[];
};

export default function AddDepartmentPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    name: "",
    head: "",
    budget: "",
    organizationId: "",
    managers: [],
    employees: [],
    interns: [],
  })
  const [orgMembers, setOrgMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [organizations, setOrganizations] = useState<{ _id: string; name: string }[]>([])

  // Fetch all organizations
  const fetchOrganizations = async () => {
    try {
      const res = await axios.get("/organizations");
      console.log("Organizations API response:", res.data);
      
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setOrganizations(res.data.data);
      } else {
        console.error("Invalid organizations response structure:", res.data);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgMembers = async () => {
    try {
      const res = await axios.get("/IT/org-members");
      console.log("API response:", res.data);
      
      // Ensure res.data is an array and filter out null/undefined members
      const responseData = Array.isArray(res.data) ? res.data : [];
      
      const validMembers = responseData
        .filter((member: { name?: string; role?: string }) => {
          // Filter out null, undefined, or members without required properties
          return member !== null && 
                 member !== undefined && 
                 member.name && 
                 member.role &&
                 typeof member.name === 'string' &&
                 typeof member.role === 'string';
        })
        .map((member: { id?: string; _id?: string; name: string; role: string }) => ({
          id: member.id || member._id || String(Math.random()),
          name: member.name,
          role: member.role.toLowerCase() // Ensure consistent role formatting
        }));
      
      console.log("Valid members:", validMembers);
      setOrgMembers(validMembers);
    } catch (error) {
      console.error("Error fetching org members:", error);
      setOrgMembers(sampleMembers.map(m => ({ id: String(m.id), name: m.name, role: m.role })));
    }
  };

  // Fetch organization members on component mount
  useEffect(() => {
    fetchOrganizations();
    fetchOrgMembers();
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log("Form data before submission:", formData);
    console.log("Organization ID:", formData.organizationId);
    
    if (!formData.organizationId) {
      alert("Organization not found. Please try again.");
      return;
    }
    
    const payload = {
      ...formData,
      budget: Number(formData.budget) || 0,
      managers: formData.managers,
      employees: formData.employees,
      interns: formData.interns,
    }

    console.log("Payload being sent:", payload);

    try {
      await axios.post("/departments", payload)
      console.log("Department added successfully")
      router.push("/admin/IT/departments")
    } catch (err) {
      console.error("Failed to add department:", err instanceof Error ? err.message : "Unknown error")
      alert("Error creating department. Please try again.")
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Add New Department</h1>
      {loading ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <p className="text-center text-gray-600">Loading organization data...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Department Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter department name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Organization *</label>
          <select
            value={formData.organizationId}
            onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select an organization</option>
            {organizations.map((org) => (
              <option key={org._id} value={org._id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Department Head</label>
          <div className="relative">
            <select
              value={formData.head}
              onClick={async () => {
                if (orgMembers.length === 0) {
                  try {
                    const res = await axios.get("/org-members");
                    setOrgMembers(res.data);
                  } catch {
                    // fallback to sample data (only names of employees)
                    setOrgMembers(sampleMembers.filter(m => m.role === "Employee").map(m => ({ id: String(m.id), name: m.name, role: m.role })));
                  }
                }
              }}
              onChange={e => setFormData({ ...formData, head: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none"
              required
            >
              <option value="" disabled>Select department head</option>
              {orgMembers.map((member, idx) => (
                <option key={idx} value={member.name}>{member.name}</option>
              ))}
            </select>
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown size={20} />
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
          <input
            type="number"
            value={formData.budget}
            min={0}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            placeholder="Enter budget in LKR"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <MultiSelectDropdown
            label="Managers"
            options={orgMembers.filter(m => m.role === "manager")}
            selected={formData.managers}
            onAdd={m => setFormData(prev => ({ ...prev, managers: [...prev.managers, m] }))}
            onRemove={idx => setFormData(prev => ({ ...prev, managers: prev.managers.filter((_, i) => i !== idx) }))}
            getOptionLabel={m => m.name}
            getOptionKey={m => m.id}
            buttonLabel="Add"
            onDropdownOpen={fetchOrgMembers}
          />
          <MultiSelectDropdown
            label="Employees"
            options={orgMembers.filter(m => m.role === "employee")}
            selected={formData.employees}
            onAdd={m => setFormData(prev => ({ ...prev, employees: [...prev.employees, m] }))}
            onRemove={idx => setFormData(prev => ({ ...prev, employees: prev.employees.filter((_, i) => i !== idx) }))}
            getOptionLabel={m => m.name}
            getOptionKey={m => m.id}
            buttonLabel="Add"
            onDropdownOpen={fetchOrgMembers}
          />
          <MultiSelectDropdown
            label="Interns"
            options={orgMembers.filter(m => m.role === "intern")}
            selected={formData.interns}
            onAdd={m => setFormData(prev => ({ ...prev, interns: [...prev.interns, m] }))}
            onRemove={idx => setFormData(prev => ({ ...prev, interns: prev.interns.filter((_, i) => i !== idx) }))}
            getOptionLabel={m => m.name}
            getOptionKey={m => m.id}
            buttonLabel="Add"
            onDropdownOpen={fetchOrgMembers}
          />
        </div>
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Department
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/IT/departments")}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
        </form>
      )}
    </div>
  );
}
 