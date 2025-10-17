"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { MultiSelectDropdown } from "@/components/MultiSelectDropdown";
import { useParams, useRouter } from "next/navigation";
import axios from "@/lib/axiosInstance";
import type {
  OrganizationMember,
  UpdateMemberPayload,
} from "../../../../types";
type Subordinate = { id: string | number; upperManager: string; name?: string };
type Organization = { _id: string; name: string };
type Department = { _id: string; name: string };

export default function EditMemberPage() {
  const { id } = useParams();
  const router = useRouter();
  const [member, setMember] = useState<OrganizationMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [projectsText, setProjectsText] = useState<string>("");
  const [allEmployees, setAllEmployees] = useState<OrganizationMember[]>([]);
  const [allInterns, setAllInterns] = useState<OrganizationMember[]>([]);
  const [allManagers, setAllManagers] = useState<OrganizationMember[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [departments, setDepartments] = useState<Department[]>([]);
  
  const fetchDepartments = async (orgId: string) => {
    if (!orgId) {
      setDepartments([]);
      return;
    }
    try {
      const deptsResponse = await axios.get(`/departments/org/${orgId}`);
      const depts = deptsResponse.data.data || deptsResponse.data;
      setDepartments(depts);
    } catch (error) {
      console.log("Error fetching departments:", error);
      setDepartments([]);
    }
  };
  

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const response = await axios.get(`/IT/org-members/${id}`);
        const data = response.data;
        setMember({
          ...data,
          employees: data.employees || [],
          interns: data.interns || [],
        });
        setProjectsText(
          Array.isArray(data.projects) ? data.projects.join(", ") : ""
        );
      } catch (error) {
        console.error("Error fetching member:", error);
        router.push("/admin/IT/members");
      } finally {
        setLoading(false);
      }
    };

    const fetchMembers = async () => {
      try {
        const response = await axios.get("/IT/org-members/empInfo");
        const allMembers = response.data;
        console.log("All members:", allMembers); // Debug log
        
        setAllEmployees(
          allMembers.filter(
            (m: OrganizationMember) => m.role.toLowerCase() === "employee"
          )
        );
        setAllInterns(
          allMembers.filter(
            (m: OrganizationMember) => m.role.toLowerCase() === "intern"
          )
        );
        setAllManagers(
          allMembers.filter(
            (m: OrganizationMember) => {
              const role = m.role.toLowerCase();
              return role === "manager" || role === "head";
            }
          )
        );
        
        console.log("Filtered managers:", allMembers.filter(
          (m: OrganizationMember) => {
            const role = m.role.toLowerCase();
            return role === "manager" || role === "head";
          }
        )); // Debug log
        
      } catch {
        console.log("Error fetching organization members, using sample data");
      }
    };

    const fetchOrganizations = async () => {
      try {
        const orgsResponse = await axios.get("/organizations");
        const orgs = orgsResponse.data.data || orgsResponse.data;
        setOrganizations(orgs);
      } catch (error) {
        console.log("Error fetching organizations:", error);
      }
    };

    fetchMember();
    fetchMembers();
    fetchOrganizations();
  }, [id, router]);

  // Fetch departments when selectedOrgId changes
  useEffect(() => {
    if (selectedOrgId) {
      fetchDepartments(selectedOrgId);
    } else {
      setDepartments([]);
    }
  }, [selectedOrgId]);

  // Helper functions (single set only)
  const handleChange = useCallback(<K extends keyof OrganizationMember>(
    key: K,
    value: OrganizationMember[K]
  ) => {
    setMember(prev => prev ? { ...prev, [key]: value } : null);
  }, []); // Empty dependency array since we're using the prev pattern

  const handleContactChange = useCallback(
    (key: keyof OrganizationMember["contactInfo"], value: string) => {
      setMember((prev) =>
        prev
          ? {
              ...prev,
              contactInfo: {
                email: prev.contactInfo?.email || "",
                phone: prev.contactInfo?.phone || "",
                address: prev.contactInfo?.address || "",
                [key]: value,
              },
            }
          : prev
      );
    },
    []
  );

  // Helper functions (single set only)
  const handleDocumentChange = useCallback(
    (key: keyof OrganizationMember["documents"], value: string) => {
      setMember((prev) =>
        prev
          ? {
              ...prev,
              documents: {
                pan: prev.documents?.pan || "",
                aadhar: prev.documents?.aadhar || "",
                [key]: value,
              },
            }
          : prev
      );
    },
    []
  );

  const handlePerformanceChange = useCallback((
    key: keyof OrganizationMember["performanceMetrics"],
    value: number
  ) => {
    setMember(prev => {
      if (!prev) return null;
      return {
        ...prev,
        performanceMetrics: { 
          tasksPerDay: prev.performanceMetrics?.tasksPerDay || 0,
          attendanceScore: prev.performanceMetrics?.attendanceScore || 0,
          managerReviewRating: prev.performanceMetrics?.managerReviewRating || 0,
          combinedPercentage: prev.performanceMetrics?.combinedPercentage || 0,
          [key]: value 
        },
      };
    });
  }, []);

  const handleProjectsChange = useCallback((val: string) => {
    setProjectsText(val);
  }, []);

  // Create memoized callback for organization selection
  const handleOrganizationChange = useCallback((val: string) => {
    setSelectedOrgId(val);
    // Clear department when org changes
    handleChange("department", "");
  }, [handleChange]);

  // Create memoized callback for manager selection
  const handleManagerChange = useCallback((val: string) => {
    setMember((prev) => {
      if (!prev) return prev;
      const selected = allManagers.find((m) => String(m.id) === val);
      return {
        ...prev,
        upperManager: val,
        upperManagerName: selected?.name || "",
      };
    });
  }, [allManagers]);

  const handleProjectsBlur = useCallback(() => {
    // Process projects when user finishes editing (on blur)
    const projectsList = projectsText
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p);
    setMember(prev => prev ? { ...prev, projects: projectsList } : null);
  }, [projectsText]);

  const handleSubmit = async () => {
    if (!member) return;
    const projectsList = projectsText
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p);

    // Map frontend fields to backend expected fields with proper typing
    const memberToSubmit: UpdateMemberPayload = {
      name: member.name,
      role: member.role,
      department: member.department, // Maps to departmentName in backend
      upperManager: member.upperManager,
      upperManagerName: member.upperManagerName || "",
      salary: Number(member.salary) || 0,
      projects: projectsList,
      experience: Number(member.experience) || 0,
      joiningDate: member.joiningDate,
      contactInfo: {
        email: member.contactInfo?.email || "",
        phone: member.contactInfo?.phone || "",
        address: member.contactInfo?.address || "", // Maps to currentAddress in backend
      },
      documents: {
        pan: member.documents?.pan || "", // Maps to panCard in backend
        aadhar: member.documents?.aadhar || "", // Maps to adharCard in backend
      },
      performanceMetrics: {
        tasksPerDay: Number(member.performanceMetrics?.tasksPerDay) || 0, // Maps to taskCountPerDay
        attendanceScore: Number(member.performanceMetrics?.attendanceScore) || 0, // Maps to attendanceCount30Days
        managerReviewRating: Number(member.performanceMetrics?.managerReviewRating) || 0,
        combinedPercentage: Number(member.performanceMetrics?.combinedPercentage) || 0, // Maps to performance
      },
      attendance: {
        todayPresent: member.attendance?.todayPresent ?? true, // Maps to isActive
      },
    };

    // Add manager-specific fields
    if (member.role.toLowerCase() === "manager") {
      memberToSubmit.employees = (member.employees || []).map((e: Subordinate) => ({
        id: String(e.id),
        name: e.name
      }));
      memberToSubmit.interns = (member.interns || []).map((i: Subordinate) => ({
        id: String(i.id),
        name: i.name
      }));
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    
    console.log("Submitting member data:", memberToSubmit); // Debug log
    
    try {
      const response = await axios.put(`/IT/org-members/${id}`, memberToSubmit);
      console.log("Update response:", response.data); // Debug log
      setSuccess("Member updated successfully!");
      setTimeout(() => {
        router.push(`/admin/IT/members/${id}`);
      }, 1500);
    } catch (error: unknown) {
      console.error("Error updating member:", error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to update member";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Memoized field components to prevent re-renders
  const MemoizedField = useMemo(() => {
    return function Field({
      label,
      value,
      onChange,
      type = "text",
    }: {
      label: string;
      value: string | number;
      onChange: (val: string | number) => void;
      type?: string;
    }) {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
          <input
            type={type}
            value={value}
            onChange={(e) =>
              onChange(type === "number" ? Number(e.target.value) : e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      );
    };
  }, []);

  const MemoizedSelectField = useMemo(() => {
    return function SelectField({
      label,
      value,
      options,
      onChange,
    }: {
      label: string;
      value: string;
      options: { label: string; value: string }[];
      onChange: (val: string) => void;
    }) {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    };
  }, []);

  const MemoizedFieldWithSuffix = useMemo(() => {
    return function FieldWithSuffix({
      label,
      value,
      suffix,
      onChange,
      type = "text",
    }: {
      label: string;
      value: string | number;
      suffix: string;
      type?: string;
      onChange: (val: string | number) => void;
    }) {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
          <div className="relative">
            <input
              type={type}
              value={value}
              onChange={(e) =>
                onChange(
                  type === "number" ? Number(e.target.value) : e.target.value
                )
              }
              className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
              {suffix}
            </span>
          </div>
        </div>
      );
    };
  }, []);

  const MemoizedFieldWithPrefix = useMemo(() => {
    return function FieldWithPrefix({
      label,
      value,
      prefix,
      onChange,
      type = "text",
    }: {
      label: string;
      value: string | number;
      prefix: string;
      type?: string;
      onChange: (val: string | number) => void;
    }) {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
              {prefix}
            </span>
            <input
              type={type}
              value={value}
              onChange={(e) =>
                onChange(
                  type === "number" ? Number(e.target.value) : e.target.value
                )
              }
              className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      );
    };
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (!member) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Member</h1>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MemoizedField
            label="Name"
            value={member.name}
            onChange={(val) => handleChange("name", val as string)}
          />
          <MemoizedSelectField
            label="Role"
            value={member.role}
            options={[
              { label: "Manager", value: "Manager" },
              { label: "Employee", value: "Employee" },
              { label: "Intern", value: "Intern" },
              { label: "Head", value: "Head" },
              { label: "Admin", value: "Admin" },
            ]}
            onChange={(val: string) =>
              handleChange("role", val as OrganizationMember["role"])
            }
          />
          <MemoizedSelectField
            label="Organization"
            value={selectedOrgId}
            options={[
              { label: "Select Organization", value: "" },
              ...organizations.map((org) => ({
                label: org.name,
                value: org._id,
              }))
            ]}
            onChange={handleOrganizationChange}
          />
          <MemoizedSelectField
            label="Department"
            value={member.department}
            options={[
              { label: "Select Department", value: "" },
              ...departments.map((dept) => ({
                label: dept.name,
                value: dept.name,
              }))
            ]}
            onChange={(val: string) =>
              handleChange("department", val as string)
            }
          />
          {["employee", "intern"].includes(member.role.toLowerCase()) && (
            <MemoizedSelectField
              label="Manager"
              value={member.upperManager || ""}
              options={[
                { label: "Select Manager", value: "" },
                ...allManagers.map((m) => ({
                  label: m.name,
                  value: String(m.id),
                }))
              ]}
              onChange={handleManagerChange}
            />
          )}
          <MemoizedFieldWithPrefix
            label="Salary"
            value={member.salary}
            type="number"
            prefix="LKR "
            onChange={(val: string | number) =>
              handleChange("salary", Number(val))
            }
          />
          <MemoizedField
            label="Joining Date"
            value={member.joiningDate}
            type="date"
            onChange={(val) => handleChange("joiningDate", val as string)}
          />
          <MemoizedFieldWithSuffix
            label="Experience"
            value={
              typeof member.experience === "string"
                ? parseInt(member.experience) || 0
                : member.experience
            }
            type="number"
            suffix="Years"
            onChange={(val: string | number) =>
              handleChange("experience", Number(val))
            }
          />
          <MemoizedField
            label="Email"
            value={member.contactInfo?.email || ""}
            onChange={(val) =>
              handleContactChange("email", val as string)
            }
          />
          <MemoizedField
            label="Phone"
            value={member.contactInfo?.phone || ""}
            onChange={(val) =>
              handleContactChange("phone", val as string)
            }
          />
        </div>

        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Address"
          value={member.contactInfo?.address || ""}
          onChange={(e) => handleContactChange("address", e.target.value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MemoizedField
            label="PAN Number"
            value={member.documents?.pan || ""}
            onChange={(val) => handleDocumentChange("pan", val as string)}
          />
          <MemoizedField
            label="Aadhar Number"
            value={member.documents?.aadhar || ""}
            onChange={(val) => handleDocumentChange("aadhar", val as string)}
          />
        </div>

        {/* Performance Metrics */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Performance Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MemoizedField
              label="Tasks Per Day"
              value={member.performanceMetrics?.tasksPerDay || 0}
              type="number"
              onChange={(val: string | number) =>
                handlePerformanceChange("tasksPerDay", Number(val))
              }
            />
            <MemoizedFieldWithSuffix
              label="Attendance Score"
              value={member.performanceMetrics?.attendanceScore || 0}
              type="number"
              suffix="%"
              onChange={(val: string | number) =>
                handlePerformanceChange("attendanceScore", Number(val))
              }
            />
            <MemoizedFieldWithSuffix
              label="Manager Review Rating"
              value={member.performanceMetrics?.managerReviewRating || 0}
              type="number"
              suffix="/5"
              onChange={(val: string | number) =>
                handlePerformanceChange("managerReviewRating", Number(val))
              }
            />
            <MemoizedFieldWithSuffix
              label="Combined Performance"
              value={member.performanceMetrics?.combinedPercentage || 0}
              type="number"
              suffix="%"
              onChange={(val: string | number) =>
                handlePerformanceChange("combinedPercentage", Number(val))
              }
            />
          </div>
        </div>

        {/* Projects */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Projects (comma-separated)"
            value={projectsText}
            onChange={(e) => handleProjectsChange(e.target.value)}
            onBlur={handleProjectsBlur}
          />
          <p className="text-xs text-gray-500">
            Enter project names separated by commas (e.g., &quot;Project A,
            Project B, Project C&quot;)
          </p>
        </div>

        {/* If manager, show employee/intern selection */}
        {member.role.toLowerCase() === "manager" &&
          (() => {
            type ManagerWithMembers = OrganizationMember & {
              employees?: OrganizationMember[];
              interns?: OrganizationMember[];
            };
            const manager = member as ManagerWithMembers;

            return (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <MultiSelectDropdown
                  label="Employees Under Manager"
                  options={allEmployees}
                  selected={
                    Array.isArray(manager.employees) ? manager.employees : []
                  }
                  getOptionLabel={(emp) => emp.name}
                  getOptionKey={(emp) => emp.id}
                  onAdd={(emp) =>
                    setMember((prev) =>
                      prev
                        ? {
                            ...prev,
                            employees: [
                              ...((prev.employees as Subordinate[]) || []),
                              {
                                id: emp.id,
                                name: emp.name,
                                upperManager: prev.name || "", // required
                              },
                            ],
                          }
                        : prev
                    )
                  }
                  onRemove={(idx: number) =>
                    setMember((prev): OrganizationMember | null =>
                      prev
                        ? {
                            ...prev,
                            employees: (
                              (prev as ManagerWithMembers).employees || []
                            ).filter((_, i) => i !== idx),
                          }
                        : null
                    )
                  }
                />

                <MultiSelectDropdown
                  label="Interns Under Manager"
                  options={allInterns}
                  selected={
                    Array.isArray(manager.interns) ? manager.interns : []
                  }
                  getOptionLabel={(intern) => intern.name}
                  getOptionKey={(intern) => intern.id}
                  onAdd={(intern) =>
                    setMember((prev) =>
                      prev
                        ? {
                            ...prev,
                            interns: [
                              ...((prev.interns as Subordinate[]) || []),
                              {
                                id: intern.id,
                                name: intern.name,
                                upperManager: prev.name || "",
                              },
                            ],
                          }
                        : prev
                    )
                  }
                  onRemove={(idx: number) =>
                    setMember((prev): OrganizationMember | null =>
                      prev
                        ? {
                            ...prev,
                            interns: (
                              (prev as ManagerWithMembers).interns || []
                            ).filter((_, i) => i !== idx),
                          }
                        : null
                    )
                  }
                />
              </div>
            );
          })()}
      </div>
    </div>
  );
}
