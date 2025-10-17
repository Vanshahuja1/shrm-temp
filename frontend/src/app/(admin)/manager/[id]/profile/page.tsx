"use client"

import { useEffect, useState } from "react"
import axios from "@/lib/axiosInstance"
import { useParams} from "next/navigation"
import { User, Users, Star, Award } from "lucide-react"
import  { ManagerInfo } from "../types";
// import { calculatePerformanceMetrics } from "../utils/performance"
import { mockManagerInfo } from "../data/mockData";



export default function ProfileSection() {
  const [manager, setManager] = useState<ManagerInfo | null>(null);
  type OrgMemberInfo = {
    id: string;
    name: string;
    role?: string;
    department?: string;
    joiningDate?: string;
    contactInfo?: { email?: string; phone?: string };
    performanceMetrics?: {
      tasksPerDay?: number;
      attendanceScore?: number;
      managerReviewRating?: number;
      combinedPercentage?: number;
    };
    duration?: string;
    mentor?: string;
    startDate?: string;
    endDate?: string;
  };
  const [employeeDetails, setEmployeeDetails] = useState<OrgMemberInfo[]>([]);
  const [internDetails, setInternDetails] = useState<OrgMemberInfo[]>([]);
  const { id: managerId } = useParams();

  useEffect(() => {
    const fetchManagerProfile = async () => {
      try {
        const response = await axios.get(`/IT/org-members/${managerId}`);
        const data = response.data;
        setManager({
          ...data,
          employees: data.employees || [],
          interns: data.interns || [],
          bankDetails: data.bankDetails || {
            accountNumber: '',
            bankName: '',
            ifsc: '',
            branch: ''
          },
          salary: typeof data.salary === 'object' ? data.salary : {
            basic: 0,
            allowances: 0,
            total: typeof data.salary === 'number' ? data.salary : 0,
            lastAppraisal: ''
          },
          email: data.contactInfo?.email || '',
          phone: data.contactInfo?.phone || '',
        });

        // Fetch details for each employee
        if (data.employees && Array.isArray(data.employees)) {
          const employeePromises = data.employees.map((emp: OrgMemberInfo) => axios.get(`/IT/org-members/${emp.id}`));
          const employeeResults = await Promise.allSettled(employeePromises);
          setEmployeeDetails(
            employeeResults
              .filter((r): r is PromiseFulfilledResult<{ data: OrgMemberInfo }> => r.status === 'fulfilled')
              .map((r) => r.value.data)
          );
        } else {
          setEmployeeDetails([]);
        }

        // Fetch details for each intern
        if (data.interns && Array.isArray(data.interns)) {
          const internPromises = data.interns.map((intern: OrgMemberInfo) => axios.get(`/IT/org-members/${intern.id}`));
          const internResults = await Promise.allSettled(internPromises);
          setInternDetails(
            internResults
              .filter((r): r is PromiseFulfilledResult<{ data: OrgMemberInfo }> => r.status === 'fulfilled')
              .map((r) => r.value.data)
          );
        } else {
          setInternDetails([]);
        }
      } catch {
        console.error("Error fetching manager profile");
        setManager(mockManagerInfo); // Use mock data in case of error
        setEmployeeDetails([]);
        setInternDetails([]);
      }
    };
    fetchManagerProfile();
  }, [managerId]);

  return (
    <div className="space-y-6">
      {/* Manager Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{String(manager?.name ?? '')}</h2>
            <p className="text-red-600 font-medium text-lg">{String(manager?.department ?? '')}</p>
            <p className="text-gray-600">{String(manager?.email ?? '')}</p>
            <p className="text-gray-600">{String(manager?.phone ?? '')}</p>
            {/* <p className="text-sm text-gray-500">Employee ID: {manager?.personalInfo?.employeeId}</p> */}
          </div>
        </div>
      </div>

      {/* Associated Employees */}
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-6 h-6 text-red-500 mr-2" />
          Associated Employees ({employeeDetails.length})
        </h3>
        <div className="grid gap-4">
          {employeeDetails.map((employee) => (
            <div key={employee.id} className="border border-red-100 rounded-lg p-4 hover:shadow-md transition-shadow bg-red-50">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">{employee.name}</h4>
                  <p className="text-red-600 font-medium">{employee.role}</p>
                  <p className="text-gray-600">{employee.department}</p>
                  {/* <p className="text-gray-500 text-sm">Joined: {employee.joiningDate}</p> */}
                  <p className="text-gray-600 text-sm">{employee.contactInfo?.email}</p>
                </div>
                <div className="text-right">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="bg-blue-50 rounded-lg p-2 mb-2">
                        <span className="text-xs text-blue-700 font-medium flex items-center"><Star className="w-4 h-4 text-blue-500 mr-1" /> Tasks/Day</span>
                        <div className="text-2xl font-bold text-blue-600">{employee.performanceMetrics?.tasksPerDay ?? '-'}/5</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2 mb-2">
                        <span className="text-xs text-green-700 font-medium flex items-center">Attendance</span>
                        <div className="text-2xl font-bold text-green-600">{employee.performanceMetrics?.attendanceScore ?? '-'}%</div>
                      </div>
                    </div>
                    <div>
                      <div className="bg-purple-50 rounded-lg p-2 mb-2">
                        <span className="text-xs text-purple-700 font-medium flex items-center">Manager Rating</span>
                        <div className="text-2xl font-bold text-purple-600">{employee.performanceMetrics?.managerReviewRating ?? '-'}/5</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-2 mb-2">
                        <span className="text-xs text-orange-700 font-medium flex items-center">Performance</span>
                        <div className="text-2xl font-bold text-orange-600">{employee.performanceMetrics?.combinedPercentage ?? '-'}%</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="bg-blue-50 rounded-lg px-3 py-1 inline-block">
                      <span className="text-blue-700 font-medium">Joining Date: {employee.joiningDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Associated Interns */}
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Award className="w-6 h-6 text-red-500 mr-2" />
          Associated Interns ({internDetails.length})
        </h3>
        <div className="grid gap-4">
          {internDetails.map((intern) => (
            <div key={intern.id} className="border border-red-100 rounded-lg p-4 bg-red-50">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">{intern.name}</h4>
                  <p className="text-red-600 font-medium">{intern.department}</p>
                  {/* <p className="text-gray-600">Duration: {intern.duration}</p> */}
                  {/* <p className="text-gray-500 text-sm">Mentor: {intern.mentor}</p> */}
                  {/* <p className="text-gray-500 text-sm">{intern.startDate} - {intern.endDate}</p> */}
                </div>
                <div className="text-right">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="bg-blue-50 rounded-lg p-2 mb-2">
                        <span className="text-xs text-blue-700 font-medium flex items-center"><Star className="w-4 h-4 text-blue-500 mr-1" /> Tasks/Day</span>
                        <div className="text-2xl font-bold text-blue-600">{intern.performanceMetrics?.tasksPerDay ?? '-'}/5</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2 mb-2">
                        <span className="text-xs text-green-700 font-medium flex items-center">Attendance</span>
                        <div className="text-2xl font-bold text-green-600">{intern.performanceMetrics?.attendanceScore ?? '-'}%</div>
                      </div>
                    </div>
                    <div>
                      <div className="bg-purple-50 rounded-lg p-2 mb-2">
                        <span className="text-xs text-purple-700 font-medium flex items-center">Manager Rating</span>
                        <div className="text-2xl font-bold text-purple-600">{intern.performanceMetrics?.managerReviewRating ?? '-'}/5</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-2 mb-2">
                        <span className="text-xs text-orange-700 font-medium flex items-center">Performance</span>
                        <div className="text-2xl font-bold text-orange-600">{intern.performanceMetrics?.combinedPercentage ?? '-'}%</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="bg-blue-50 rounded-lg px-3 py-1 inline-block">
                      <span className="text-blue-700 font-medium">Joining Date: {intern.joiningDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
