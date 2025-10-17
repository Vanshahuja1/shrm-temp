"use client";
import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  
  Calendar,
  Target,
  Wallet,
  Briefcase,
  FileText,
  Users,
  BarChart3,
  Mail,

} from "lucide-react";
import {LogOut, X } from "lucide-react";
import { useState } from "react";
import { Organization } from "../admin/page";
import axios from "@/lib/axiosInstance";
import Image from "next/image";
interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  hrName?: string;
  hrId: string;
}

export default function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  hrName,
  hrId,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { id: "", label: "Dashboard", icon: Target },
    { id: "attendance", label: "Attendance", icon: Calendar },
    { id: "payroll", label: "Payroll", icon: Wallet },
    { id: "recruitment", label: "Recruitment", icon: Briefcase },
    { id: "emails", label: "Email System", icon: Mail },
    { id: "employees", label: "Employees", icon: Users },
    { id: "policies", label: "Policies", icon: FileText },
    { id: "reports", label: "Reports", icon: BarChart3 },
  ];

const [org, setOrg] = useState<Organization | null>(null)
  const fetchOrg = async () => {
    const response = await axios.get(`organizations/6889a9394f263f6b1e23a7e2`)
    setOrg(response.data.data)
  }
  useEffect(() => {
    fetchOrg()
  }, [])


  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={`w-72 bg-white border-r border-gray-200 shadow-xl h-full flex-shrink-0 transform transition-transform duration-300 ease-in-out lg:translate-x-0 fixed lg:relative z-50 lg:z-auto ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                 <Image
                              src="/one_aim.jpg"
                              alt="SHRM Logo"
                              width={56}
                              height={56}
                              className="w-14 h-14 object-cover rounded-2xl shadow-lg relative z-10"
                              draggable={false}
                              priority
                            />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                   {org?.name || "Organization"}
                  </h1>
                  <p className="text-sm text-gray-500">HR Dashboard</p>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              // Update the active logic for dashboard
              const active =
                item.id === ""
                  ? pathname === `/hr/${hrId}`
                  : pathname.startsWith(`/hr/${hrId}/${item.id}`);
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    router.push(
                      item.id === "" ? `/hr/${hrId}` : `/hr/${hrId}/${item.id}`
                    );
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                    active
                      ? "bg-blue-50 text-red-700 border-l-4 border-red-600 font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-semibold">
                M
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {hrName ? hrName : "HR"}
                </p>
              </div>
              <button className="text-gray-400 hover:text-red-600">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
