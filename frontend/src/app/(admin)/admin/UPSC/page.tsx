"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Building,
  BarChart3,
  Activity,
  Menu,
  X,
  Home,
  Mail,
  Settings,
  Bell,
  LogOut,
  GraduationCap,
  BookOpen,
  Target,
} from "lucide-react";
import Overview from "./Overview/page";
import SubDepartments from "./SubDepartments/page";
import OngoingBatches from "./OngoingBatches/page";
import OrganizationMembers from "./OrganizationMembers/page";
import OrganizationHierarchy from "./OrganizationHierarchy/page";
import CRUDOperations from "./CRUDOperations/page";
import DashboardCharts from "./DashboardCharts/page";
import TaskManagement from "./TaskManagement/page";
import EmailSystem from "./EmailSystem/page";
import { Organization } from "../page";
import axios from "@/lib/axiosInstance";
import { useEffect } from "react";

// Sidebar Navigation
const Sidebar = ({
  activeTab,
  setActiveTab,
  isSidebarOpen,
  setIsSidebarOpen,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}) => {
  const [org, setOrg] = useState<Organization | null>(null)
  const fetchOrg = async () => {
    const response = await axios.get(`/organizations/6889a9494f263f6b1e23a7e4`)
    setOrg(response.data.data)
  }
  useEffect(() => {
    fetchOrg()
  }, [])
  const menuItems = [
    { id: "overview", label: "Dashboard", icon: Home },
    { id: "sub-departments", label: "Sub Departments", icon: Building },
    { id: "ongoing-batches", label: "Ongoing Batches", icon: BookOpen },
    { id: "organization-members", label: "Organization Members", icon: Users },
    {
      id: "organization-hierarchy",
      label: "Organization Hierarchy",
      icon: Activity,
    },
    { id: "crud-operations", label: "CRUD Operations", icon: Settings },
    { id: "dashboard-charts", label: "Dashboard Charts", icon: BarChart3 },
    { id: "task-management", label: "Task Management", icon: Target },
    { id: "email-system", label: "Email System", icon: Mail },
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
        className={`fixed left-0 top-0 h-full w-72 bg-white border-r border-gray-200 shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {org?.name}
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

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                    activeTab === item.id
                      ? "bg-red-50 text-red-700 border-l-4 border-red-600 font-semibold"
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
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-semibold">
                A
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Admin User</p>
                <p className="text-sm text-gray-500">System Administrator</p>
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
};

const TopHeader = ({ activeTab, setIsSidebarOpen }: { activeTab: string; setIsSidebarOpen: (open: boolean) => void }) => {
  const getPageTitle = (tab: string) => {
    const titles: Record<string, string> = {
      overview: "Dashboard Overview",
      "sub-departments": "Sub Departments",
      "ongoing-batches": "Ongoing Batches",
      "organization-members": "Organization Members",
      "organization-hierarchy": "Organization Hierarchy",
      "crud-operations": "CRUD Operations",
      "dashboard-charts": "Dashboard Charts",
      "task-management": "Task Management",
      "email-system": "Email System",
    };
    return titles[tab] || "Dashboard";
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <Menu size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getPageTitle(activeTab)}
            </h1>
            <p className="text-sm text-gray-500">
              Manage your UPSC coaching organization efficiently
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full"></span>
          </button>
          <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-100">
            <Settings size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

// Main Dashboard Component
export default function UPSCAdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <Overview />;
      case "sub-departments":
        return <SubDepartments />;
      case "ongoing-batches":
        return <OngoingBatches />;
      case "organization-members":
        return <OrganizationMembers />;
      case "organization-hierarchy":
        return <OrganizationHierarchy />;
      case "crud-operations":
        return <CRUDOperations />;
      case "dashboard-charts":
        return <DashboardCharts />;
      case "task-management":
        return <TaskManagement />;
      case "email-system":
        return <EmailSystem />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader activeTab={activeTab} setIsSidebarOpen={setIsSidebarOpen} />

        <main className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
