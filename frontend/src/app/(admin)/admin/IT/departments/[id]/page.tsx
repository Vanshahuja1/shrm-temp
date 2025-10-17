"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "@/lib/axiosInstance";
import { Edit, ArrowLeft, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import EditForm from "./EditForm";
import type { OrganizationMember } from "@/types";

export default function DepartmentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  type Department = {
    name: string;
    head: string;
    managers: OrganizationMember[];
    employees: OrganizationMember[];
    interns: OrganizationMember[];
    budget: number;
  };
  
  const [dept, setDept] = useState<Department | null>(null);
  const [editData, setEditData] = useState<Department>({
    name: "",
    head: "",
    budget: 0,
    managers: [],
    employees: [],
    interns: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    axios.get(`/departments/${id}`)
      .then((res) => {
        console.log("Department response:", res.data);
        if (res.data && res.data.success && res.data.data) {
          const deptData = {
            name: res.data.data.name || "",
            head: res.data.data.head || "",
            budget: res.data.data.budget || 0,
            managers: res.data.data.managers || [],
            employees: res.data.data.employees || [],
            interns: res.data.data.interns || []
          };
          setDept(deptData);
          setEditData(deptData);
        } else {
          console.error("Invalid response format:", res.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching department:", error);
      });
  }, [id]);

  const handleUpdate = async () => {
    await axios.put(`/departments/${id}`, editData);
    console.log("Department updated successfully");
    setDept(editData);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/departments/${id}`);
      console.log("Department deleted successfully");
      setIsDeleteDialogOpen(false);
      router.push("/admin/IT/departments");
    } catch (error) {
      console.error("Error deleting department:", error);
      alert("Failed to delete department. Please try again.");
    }
  };

  if (!dept) return <div className="p-6 text-gray-600">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/admin/IT/departments")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          <ArrowLeft size={16} />
          Back to Departments
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Edit size={16} />
            {isEditing ? "Cancel" : "Edit"}
          </button>
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                <Trash2 size={16} />
                Delete
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Delete Department</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete the{" "}
                  <strong>{dept?.name}</strong> department? This action cannot
                  be undone and will permanently remove the department and all
                  its associated data.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <button
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
                >
                  Delete Department
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
        {isEditing ? (
          <EditForm
            editData={editData}
            setEditData={setEditData}
            onSave={handleUpdate}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{dept.name}</h1>
              <p className="text-gray-600">Department Head: {dept.head}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                label="Managers"
                value={dept.managers.length}
                color="blue"
              />
              <StatCard
                label="Employees"
                value={dept.employees.length}
                color="green"
              />
              <StatCard
                label="Interns"
                value={dept.interns.length}
                color="purple"
              />
              <StatCard
                label="Budget"
                value={`$${dept.budget.toLocaleString()}`}
                color="orange"
              />
            </div>

            {/* Team Members Section */}
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-3">
                Team Members
              </h2>

              <div className="space-y-8">
                {/* Managers Section */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-blue-900 flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">M</span>
                      </div>
                      Managers
                    </h3>
                    <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full font-semibold">
                      {dept.managers.length} Members
                    </span>
                  </div>

                  {dept.managers && dept.managers.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {dept.managers.map((manager: OrganizationMember, index: number) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-5 border border-blue-200 cursor-pointer hover:border-blue-400 hover:shadow-lg transition-all duration-300 group"
                          onClick={() =>
                            router.push(
                              `/admin/IT/members/${manager.id}`
                            )
                          }
                        >
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                              <span className="text-blue-700 font-bold text-lg">
                                {manager.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-700 transition-colors">
                                {manager.name}
                              </h4>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-blue-600 text-2xl">👥</span>
                      </div>
                      <p className="text-blue-700 font-medium">
                        No managers assigned
                      </p>
                      <p className="text-blue-600 text-sm mt-1">
                        Managers will appear here when assigned
                      </p>
                    </div>
                  )}
                </div>

                {/* Employees Section */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-green-900 flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">E</span>
                      </div>
                      Employees
                    </h3>
                    <span className="bg-green-600 text-white text-sm px-3 py-1 rounded-full font-semibold">
                      {dept.employees.length} Members
                    </span>
                  </div>

                  {dept.employees && dept.employees.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                      {dept.employees.map((employee: OrganizationMember, index: number) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-5 border border-green-200 cursor-pointer hover:border-green-400 hover:shadow-lg transition-all duration-300 group"
                          onClick={() =>
                            router.push(
                              `/admin/IT/members/${employee.id}`
                            )
                          }
                        >
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                              <span className="text-green-700 font-bold text-lg">
                                {employee.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-green-700 transition-colors">
                                {employee.name}
                              </h4>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-green-600 text-2xl">👨‍💼</span>
                      </div>
                      <p className="text-green-700 font-medium">
                        No employees assigned
                      </p>
                      <p className="text-green-600 text-sm mt-1">
                        Employees will appear here when assigned
                      </p>
                    </div>
                  )}
                </div>

                {/* Interns Section */}
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-yellow-900 flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">I</span>
                      </div>
                      Interns
                    </h3>
                    <span className="bg-yellow-600 text-white text-sm px-3 py-1 rounded-full font-semibold">
                      {dept.interns.length} Members
                    </span>
                  </div>

                  {dept.interns && dept.interns.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                      {dept.interns.map((intern: OrganizationMember, index: number) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-5 border border-yellow-200 cursor-pointer hover:border-yellow-400 hover:shadow-lg transition-all duration-300 group"
                          onClick={() =>
                            router.push(
                              `/admin/IT/members/${intern.id}`
                            )
                          }
                        >
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-yellow-200 transition-colors">
                              <span className="text-yellow-700 font-bold text-lg">
                                {intern.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-yellow-700 transition-colors">
                                {intern.name}
                              </h4>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-yellow-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-yellow-600 text-2xl">🎓</span>
                      </div>
                      <p className="text-yellow-700 font-medium">
                        No interns assigned
                      </p>
                      <p className="text-yellow-600 text-sm mt-1">
                        Interns will appear here when assigned
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  const colorMap = {
    blue: "text-blue-600 bg-blue-50 border-blue-200",
    green: "text-green-600 bg-green-50 border-green-200",
    purple: "text-purple-600 bg-purple-50 border-purple-200",
    orange: "text-orange-600 bg-orange-50 border-orange-200",
  } as Record<string, string>;

  return (
    <div className={`p-4 rounded-lg border ${colorMap[color]}`}>
      <p className={`text-2xl font-bold ${colorMap[color].split(" ")[0]}`}>
        {value}
      </p>
      <p className={`${colorMap[color].split(" ")[0]} text-sm`}>{label}</p>
    </div>
  );
}
