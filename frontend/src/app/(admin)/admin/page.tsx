"use client";
import React, { useState, useEffect } from "react";
import { ArrowRight, Plus } from "lucide-react";
import Loading from "../../components/Loading"; // Adjust path if needed
import axios from "@/lib/axiosInstance";
import OrgCard from "./OrgCard";
import NewOrganizationModal from "./NewOrganizationModal";

export interface Organization {
  _id?: string; // MongoDB document id, optional for frontend use
  name: string;
  description?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  logo?: string;
  isActive: boolean;
  totalEmployees: number;
  totalDepartments: number;
  url?: string;
  createdAt?: string; 
  updatedAt?: string; 
}

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");
  const [isLoading] = useState(false);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrgs = async () => {
    const response = await axios.get("/organizations");
    console.log(response.data.data);
    setOrgs(response.data.data);
  };
  useEffect(() => {
    fetchOrgs();
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hour = currentTime.getHours();
    if (hour < 12) {
      setGreeting("Good Morning");
    } else if (hour < 17) {
      setGreeting("Good Afternoon");
    } else if (hour < 21) {
      setGreeting("Good Evening");
    } else {
      setGreeting("Good Night");
    }
  }, [currentTime]);

  const handleModalSuccess = () => {
    const fetchOrgs = async () => {
      const response = await axios.get("/organizations");
      console.log(response.data.data);
      setOrgs(response.data.data);
    };
    fetchOrgs();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <Loading isLoading={isLoading} />
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Welcome Section */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Hey <span className="text-red-600">Narendra Sir</span>
            </h2>
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
              <p className="text-2xl text-gray-700 font-medium">{greeting}</p>
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-w-md mx-auto">
            <p className="text-sm text-gray-500 mb-1">
              {formatDate(currentTime)}
            </p>
            <p className="text-xs text-red-600">
              Welcome back to your dashboard
            </p>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* UPSC Organization */}
          {orgs.map((org, index) => (
            <OrgCard
              key={org._id}
              org={org}
              fetchOrgs={fetchOrgs}
              index={index} // Add this line
            />
          ))}

          {/* Add New Organization */}
          <div
            onClick={() => setIsModalOpen(true)}
            className="group bg-gradient-to-br from-red-50 to-white rounded-2xl shadow-xl border-2 border-dashed border-red-300 overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:border-red-500"
          >
            <div className="p-8 text-center h-full flex flex-col justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 group-hover:scale-110 transition-all duration-300">
                <Plus className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Add New Organization
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Expand your enterprise portfolio with new organizational
                divisions.
              </p>
              <div className="flex items-center justify-center text-red-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                <span>Create New</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-red-600">
                {orgs.length}
              </div>
              <div className="text-gray-600">Active Organizations</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-red-600">24/7</div>
              <div className="text-gray-600">System Availability</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-red-600">100%</div>
              <div className="text-gray-600">Professional Excellence</div>
            </div>
          </div>
        </div>
      </main>
      <NewOrganizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        fetchOrgs={fetchOrgs}
      />
    </div>
  );
}
