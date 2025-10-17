"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Building,
  Briefcase,
  Activity,
  Users,
  CheckSquare,
  Mail,
  X,
  LogOut,
  // TrendingUp,
  BarChart3,
} from "lucide-react";
import { Organization } from "../page";
import { useEffect, useState } from "react";
import axios from "@/lib/axiosInstance";
import Image from "next/image";

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  adminName?: string;
  organizationName?: string;
}

export default function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  adminName,
  organizationName,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [org, setOrg] = useState<Organization | null>(null);

  const fetchOrg = async () => {
    try {
      const response = await axios.get(
        `organizations/6889a9394f263f6b1e23a7e2`
      );
      setOrg(response.data.data);
    } catch (error) {
      console.error("Error fetching organization:", error);
    }
  };

  useEffect(() => {
    fetchOrg();
  }, []);

  const menuItems = [
    { id: "overview", label: "Dashboard", icon: Home },
    { id: "departments", label: "Departments", icon: Building },
    { id: "projects", label: "Projects", icon: Briefcase },
    { id: "members", label: "Organization Members", icon: Users },
    { id: "hierarchy", label: "Organization Hierarchy", icon: Activity },
    { id: "task", label: "Task Management", icon: CheckSquare },
    { id: "analytics", label: "Analytics & Charts", icon: BarChart3 },
    // { id: "performance", label: "Performance", icon: TrendingUp },
    { id: "emails", label: "Email System", icon: Mail },
  ];

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed left-0 top-0 h-full w-72 bg-white border-r border-gray-200 shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:-translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <Image
                    src="/one_aim.jpg"
                    alt="SHRM Logo"
                    width={48}
                    height={48}
                    className="w-14 h-14 object-cover rounded-2xl shadow-lg relative z-10"
                    draggable={false}
                    priority
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {organizationName || org?.name || "Organization"}
                  </h1>
                  <p className="text-sm text-gray-500">Admin Dashboard</p>
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

          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(`/admin/IT/${item.id}`);
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    // if (item.id === "overview") {
                    //   router.push("/admin")
                    // } else {
                    //   router.push(`/admin/IT/${item.id}`)
                    // }
                    router.push(`/admin/IT/${item.id}`);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                    active
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold">
                A
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {adminName || "Admin User"}
                </p>
                <p className="text-sm text-gray-500">System Administrator</p>
              </div>
              <button
                onClick={() => router.push("/admin")}
                className="text-gray-400 hover:text-blue-600"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
