"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import axios from "@/lib/axiosInstance"

interface EmployeeRecord {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  phone: string;
  designation: string;
  department?: string;
  joinedDate?: string;
  status: "Active" | "On Leave" | "Inactive";
}

// API Response interface to match the actual response structure
interface APIEmployee {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  departmentName: string;
  joiningDate: string;
  isActive: boolean;
}

export default function EmployeeRecords() {
  const [records, setRecords] = useState<EmployeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "On Leave" | "Inactive"
  >("All");
  const router = useRouter();

  const { hrId } = useParams<{ hrId: string }>();

  // Function to transform API response to component interface
  const transformAPIData = (apiEmployees: APIEmployee[]): EmployeeRecord[] => {
    return apiEmployees.map((emp) => ({
      id: emp._id,
      name: emp.name,
      employeeId: emp.id,
      email: emp.email,
      phone: emp.phone,
      designation: emp.role,
      department: emp.departmentName,
      joinedDate: emp.joiningDate,
      status: emp.isActive ? "Active" : "Inactive"
    }));
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/user`);
        const apiData = response.data;
      
        // Check if response has success and data properties
        const employees = apiData.success ? apiData.data : apiData;
        const transformedData = transformAPIData(employees);
        // console.log("Transformed employee data:", transformedData);
        // console.log("Employee records set:", transformedData);
        setRecords(transformedData);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const filteredRecords = records.filter((emp) => {
    const matchesSearch = emp?.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || emp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRowClick = (employeeId: string) => {
    router.push(`/hr/${hrId}/employees/${employeeId}`);
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="bg-white border rounded-xl shadow-sm">
      {/* Header Section */}
      <div className="px-6 py-4 border-b">
        <div className="flex justify-between items-center">
          <div className="h-7 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-9 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        
        {/* Search and Filter Skeleton */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="w-full sm:w-48 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Table Skeleton - Desktop */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 border-b border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              </th>
              <th className="px-6 py-3 border-b border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </th>
              <th className="px-6 py-3 border-b border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              </th>
              <th className="px-6 py-3 border-b border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </th>
              <th className="px-6 py-3 border-b border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </th>
              <th className="px-6 py-3 border-b border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[...Array(5)].map((_, index) => (
              <tr key={index}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-gray-200 rounded-full animate-pulse"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-32 mb-1 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Skeleton */}
      <div className="sm:hidden divide-y divide-gray-200">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-1 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
            </div>
            <div className="ml-13 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-40 animate-pulse"></div>
              <div className="flex items-center justify-between mt-2">
                <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Show loading skeleton while data is being fetched
  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="bg-white border rounded-xl shadow-sm">
      {/* Header Section */}
      <div className="px-6 py-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <span className="text-red-600">📋</span> Employee Records
          </h2>
          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2" onClick={() => router.push(`/hr/${hrId}/employees/add`)}>
            <span>+</span> Add Employee
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as typeof statusFilter)
            }
            className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
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
            {filteredRecords.map((emp) => (
              <tr
                key={emp.id}
                className="hover:bg-red-500/5 transition-colors cursor-pointer"
                onClick={() => handleRowClick(emp.employeeId)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 flex-shrink-0 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="font-medium text-red-700">
                        {emp?.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {emp?.name}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {emp?.employeeId}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {emp.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {emp.department || "N/A"}
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
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${emp.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : emp.status === "On Leave"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                      }`}
                  >
                    {emp.status}
                  </span>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="sm:hidden divide-y divide-gray-200">
        {filteredRecords.map((emp) => (
          <div
            key={emp.id}
            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => handleRowClick(emp.employeeId)}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <span className="font-medium text-red-700">
                  {emp?.name?.charAt(0)}
                </span>
              </div>
              <div>
                <div className="font-medium text-gray-900">{emp?.name}</div>
                <div className="text-gray-500 text-sm">{emp?.employeeId}</div>
              </div>
            </div>
            <div className="ml-13 space-y-1 text-sm">
              <div className="text-gray-600">{emp.email}</div>
              <div className="text-gray-600">
                {emp.designation} • {emp.department || "No Department"}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${emp.status === "Active"
                    ? "bg-green-100 text-green-800"
                    : emp.status === "On Leave"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                    }`}
                >
                  {emp.status}
                </span>

              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Records Message */}
      {filteredRecords.length === 0 && (
        <div className="px-6 py-8 text-center text-gray-500">
          <div className="text-gray-400 text-4xl mb-2">👥</div>
          <p className="text-lg font-medium">No employees found</p>
          <p className="text-sm">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}