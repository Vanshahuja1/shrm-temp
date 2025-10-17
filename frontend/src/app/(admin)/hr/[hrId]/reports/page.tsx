"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@/lib/axiosInstance";

type Employee = {
  id: string; // accept string ID
  name: string;
  employeeId: string;
  email: string;
  department: string;
  designation: string;
  status: "Active" | "Inactive";
  joinedDate?: string;
};

export default function EmployeeReports() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");
  const [departmentFilter, setDepartmentFilter] = useState<string>("All");
  const router = useRouter();

  const { hrId } = useParams<{ hrId: string }>();

  const handleRowClick = (employeeId: string) => {
    router.push(`/hr/${hrId}/reports/${employeeId}`);
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get("/reports/employees");
        if (!(res.status === 200)) throw new Error("Failed to fetch");
        
        // Access the data array from the API response structure
        const apiData = res.data?.data || [];
        
        // Transform API data
        const transformed = Array.isArray(apiData)
          ? apiData
              .filter((raw: {name:string}) => raw.name) // Skip items with no name!
              .map((raw: {id:string, name:string, email:string, departmentName:string, role:string, status:string, joiningDate:string}, idx: number) => ({
                id: raw.id ?? `emp-${idx}`,
                name: raw.name ?? "Unknown",
                employeeId: raw.id ?? "",
                email: raw.email ?? "N/A",
                department: raw.departmentName ?? "N/A",
                designation: raw.role ?? "N/A",
                status: raw.status === "Active" ? "Active" : "Inactive",
                joinedDate: raw.joiningDate,
              }))
          : [];
        // Fix: Ensure status is typed as "Active" | "Inactive"
        setEmployees(
          transformed.map((emp) => ({
            ...emp,
            status: emp.status === "Active" ? "Active" : "Inactive",
          }))
        );
      } catch (err) {
        console.error("Failed to fetch employee data:", err);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Filtering logic
  const filteredEmployees = employees.filter((emp) => {
    const term = searchTerm.toLowerCase();
    const searchFields =
      emp.name.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      emp.employeeId.toLowerCase().includes(term);

    const statusMatch = statusFilter === "All" || emp.status === statusFilter;
    const departmentMatch =
      departmentFilter === "All" || emp.department === departmentFilter;
    return searchFields && statusMatch && departmentMatch;
  });

  // Unique departments (skip "N/A")
  const uniqueDepartments = Array.from(
    new Set(employees.map((emp) => emp.department).filter((d) => d && d !== "N/A"))
  ).sort();

  if (loading)
    return <p className="text-gray-500">Loading employee data...</p>;

  if (!loading && employees.length === 0)
    return (
      <p className="text-red-500 px-8 py-10 bg-white rounded-lg">
        Failed to load employee data.
      </p>
    );

  return (
    <div className="bg-white border rounded-xl shadow-sm">
      {/* Header Section */}
      <div className="px-6 py-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <span className="text-red-600">🧑‍💼</span> Employee Reports
          </h2>
        </div>

        {/* Search and Filters */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
          {/* Departments */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
          >
            <option value="All">All Departments</option>
            {uniqueDepartments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-gray-50 text-gray-600">
              <th className="px-6 py-3 border-b border-gray-200 font-medium">
                Employee
              </th>
              <th className="px-6 py-3 border-b border-gray-200 font-medium">
                Email Address
              </th>
              <th className="px-6 py-3 border-b border-gray-200 font-medium">
                Department
              </th>
              <th className="px-6 py-3 border-b border-gray-200 font-medium">
                Job Title
              </th>
              <th className="px-6 py-3 border-b border-gray-200 font-medium">
                Joined Date
              </th>
              <th className="px-6 py-3 border-b border-gray-200 font-medium">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  No employees found for your criteria.
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => (
                <tr
                  key={emp.id}
                  className="hover:bg-red-500/5 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(emp.employeeId)}
                  tabIndex={0}
                  role="button"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 flex-shrink-0 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="font-medium text-red-700">
                          {emp.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 hover:text-red-600">
                          {emp.name}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {emp.employeeId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {emp.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {emp.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {emp.designation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {emp.joinedDate
                      ? new Date(emp.joinedDate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        emp.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : emp.status === "Inactive"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="sm:hidden divide-y divide-gray-200">
        {filteredEmployees.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No employees found for your criteria.</div>
        ) : (
          filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => handleRowClick(emp.employeeId)}
              tabIndex={0}
              role="button"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="font-medium text-red-700">
                    {emp.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900 hover:text-red-600">
                    {emp.name}
                  </div>
                  <div className="text-gray-500 text-sm">{emp.employeeId}</div>
                </div>
              </div>
              <div className="ml-13 space-y-1 text-sm">
                <div className="text-gray-600">{emp.email}</div>
                <div className="text-gray-600">
                  {emp.designation} • {emp.department}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      emp.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : emp.status === "Inactive"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {emp.status}
                  </span>
                  <span className="text-gray-500 text-xs">
                    Joined:{" "}
                    {emp.joinedDate
                      ? new Date(emp.joinedDate).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}