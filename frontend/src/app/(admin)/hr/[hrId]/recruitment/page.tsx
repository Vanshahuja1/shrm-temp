"use client";

import React, { useState, useEffect } from "react";
import axios from "@/lib/axiosInstance";
import {
  // PieChart,
  // Pie,
  // Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  UserCheck,
  UserPlus,
  UserX,
  IndianRupee,
  LucideIcon,
  // Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useParams, useRouter } from "next/navigation";

// Type definitions
interface InterviewScheduled {
  interviewer?: {
    id: string;
    name: string;
  };
  isScheduled: boolean;
  scheduledDate?: string;
}

interface RecruiterAssigned {
  isAssigned: boolean;
}

interface Department {
  _id: string;
  name: string;
}

interface Candidate {
  interviewScheduled: InterviewScheduled;
  recruiterAssigned: RecruiterAssigned;
  _id: string;
  name: string;
  email: string;
  department: string | Department; // Can be ObjectId string or populated object
  appliedDate: string;
  screeningScore: number;
  source: string;
  portfolio: string;
  location: string;
  currentCompany: string;
  jobTitle: string;
  shortlisted: boolean;
  status: string;
  notes: string;
  resume: string;
  expectedSalary: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ChartData {
  name: string;
  value: number;
}

interface DepartmentBarData {
  department: string;
  applications: number;
}

interface RecruitmentStageData {
  Application: number;
  Interview: number;
  Hired: number;
}

interface Stats {
  totalApplicants: number;
  shortlistedCandidates: number;
  hiredCandidates: number;
  rejectedCandidates: number;
  avgTimeToHire: number;
  avgCostToHire: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  onClick?: () => void;
  className?: string;
}

// const pieColors: string[] = [
//   "#4FC3F7",
//   "#81C784",
//   "#FFB74D",
//   "#F06292",
//   "#9575CD",
//   "#4DB6AC",
// ];

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  onClick,
  className = "",
}) => (
  <Card
    className={`bg-white shadow-lg cursor-pointer ${className}`}
    onClick={onClick ?? (() => {})}
  >
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold" style={{ color }}>
            {value}
          </p>
        </div>
        <div
          className="p-2 rounded-full"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </CardContent>
  </Card>
);


export default function HRDashboard(): React.JSX.Element | null {
  const { hrId } = useParams<{ hrId: string }>();
  const router = useRouter();
  
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState<boolean>(false);
  // const [isAddPositionModalOpen, setIsAddPositionModalOpen] = useState<boolean>(false);

  // Fetch candidates data
  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await axios.get<Candidate[]>("/recruitment/candidates");
      setCandidates(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching candidates:", err);
      setError("Failed to fetch candidates data");
    } finally {
      setLoading(false);
    }
  };

  // const handlePositionAdded = (): void => {
  //   // Refresh candidates data after adding a position
  //   fetchCandidates();
  // };

  useEffect(() => setIsClient(true), []);

  // Calculate dynamic statistics
  const calculateStats = (): Stats => {
    const totalApplicants = candidates.length;
    const shortlistedCandidates = candidates.filter(c => c.shortlisted).length;
    const hiredCandidates = candidates.filter(c => c.status === "Hired" || c.status === "hired").length;
    const rejectedCandidates = candidates.filter(c => c.status === "Rejected" || c.status === "rejected").length;
    
    // Calculate average time to hire (mock calculation based on applied date)
    const hiredCandidatesWithDates = candidates.filter(c => c.status === "Hired" && c.appliedDate);
    const avgTimeToHire = hiredCandidatesWithDates.length > 0 
      ? Math.round(hiredCandidatesWithDates.reduce((acc, candidate) => {
          const appliedDate = new Date(candidate.appliedDate);
          const currentDate = new Date();
          const daysDiff = Math.floor((currentDate.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24));
          return acc + daysDiff;
        }, 0) / hiredCandidatesWithDates.length)
      : 15;

    // Cost to hire: sum of all expected salaries
    const totalCostToHire = candidates.reduce((acc, candidate) => {
      const expectedSalary = parseInt(candidate.expectedSalary) || 0;
      return acc + expectedSalary;
    }, 0);

    return {
      totalApplicants,
      shortlistedCandidates,
      hiredCandidates,
      rejectedCandidates,
      avgTimeToHire,
      avgCostToHire: totalCostToHire
    };
  };

  // Generate department data from actual department field
  const getDepartmentData = (): ChartData[] => {
    const departmentMap: Record<string, number> = {};
    
    candidates.forEach(candidate => {
      let departmentName = "Unknown";
      
      // Handle both string and object department formats
      if (typeof candidate.department === 'string') {
        // If department is just an ObjectId string, create a readable name
        departmentName = "Department " + candidate.department.slice(-4);
      } else if (candidate.department && typeof candidate.department === 'object' && candidate.department.name) {
        // If department is populated with name
        departmentName = candidate.department.name;
      }
      
      departmentMap[departmentName] = (departmentMap[departmentName] || 0) + 1;
    });

    return Object.entries(departmentMap).map(([name, value]) => ({ name, value }));
  };

  // Generate source data
  const getSourceData = (): ChartData[] => {
    const sourceMap: Record<string, number> = {};
    
    candidates.forEach(candidate => {
      const source = candidate.source || "Direct Apply";
      let mappedSource = source;
      
      // Map sources to standard categories
      if (source.toLowerCase().includes("linkedin") || source.toLowerCase().includes("facebook") || 
          source.toLowerCase().includes("twitter") || source.toLowerCase().includes("social")) {
        mappedSource = "Social Media";
      } else if (source.toLowerCase().includes("job") || source.toLowerCase().includes("board")) {
        mappedSource = "Job Boards";
      } else if (source.toLowerCase().includes("referral") || source.toLowerCase().includes("refer")) {
        mappedSource = "Referrals";
      } else {
        mappedSource = "Direct Apply";
      }
      
      sourceMap[mappedSource] = (sourceMap[mappedSource] || 0) + 1;
    });

    return Object.entries(sourceMap).map(([name, value]) => ({ name, value }));
  };

  // Generate department application data for bar chart
  const getDepartmentBarData = (): DepartmentBarData[] => {
    const departmentData = getDepartmentData();
    return departmentData.map(dept => ({
      department: dept.name,
      applications: dept.value
    }));
  };

  // Generate recruitment stages data
  const getRecruitmentStagesData = (): RecruitmentStageData[] => {
    const applicationCount = candidates.filter(c => 
      c.status === "Application" || c.status === "Application Received"
    ).length;
    
    const interviewCount = candidates.filter(c => 
      c.interviewScheduled?.isScheduled || c.status === "Interview"
    ).length;
    
    const hiredCount = candidates.filter(c => c.status === "Hired").length;

    return [{
      Application: applicationCount,
      Interview: interviewCount,
      Hired: hiredCount,
    }];
  };

  if (!isClient) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = calculateStats();
  // const departmentData = getDepartmentData();
  const sourceData = getSourceData();
  const departmentBarData = getDepartmentBarData();
  const recruitmentStagesData = getRecruitmentStagesData();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="text-sm text-green-600 font-medium">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard
          title="Total Applicants"
          value={stats.totalApplicants}
          icon={Users}
          color="#212121"
          onClick={() => router.push(`/hr/${hrId}/recruitment/applicants`)}
          className="transition-shadow duration-200 hover:shadow-[0_0_12px_rgba(0,0,0,0.4)]"
        />
        <StatCard
          title="Shortlisted Candidates"
          value={stats.shortlistedCandidates}
          icon={UserCheck}
          color="#1976D2"
          onClick={() => router.push(`/hr/${hrId}/recruitment/shortlistedCandidates`)}
          className="transition-shadow duration-200 hover:shadow-[0_0_12px_rgba(25,118,210,0.5)]"
        />
        <StatCard
          title="Hired Candidates"
          value={stats.hiredCandidates}
          icon={UserPlus}
          color="#388E3C"
          onClick={() => router.push(`/hr/${hrId}/recruitment/hiredCandidates`)}
          className="transition-shadow duration-200 hover:shadow-[0_0_12px_rgba(25,118,210,0.5)]"
        />
        <StatCard
          title="Rejected Candidates"
          value={stats.rejectedCandidates}
          icon={UserX}
          color="#D32F2F"
          onClick={() => router.push(`/hr/${hrId}/recruitment/rejectedCandidates`)}
          className="transition-shadow duration-200 hover:shadow-[0_0_12px_rgba(0,0,0,0.4)]"
        />
        
        <StatCard
          title="Cost to hire"
          value={`LKR ${stats.avgCostToHire}`}
          icon={IndianRupee}
          color="#FF8F00"
          // onClick={() => router.push(`/hr/${hrId}/recruitment/cost`)}
          className="transition-shadow duration-200 hover:shadow-[0_0_12px_rgba(0,0,0,0.4)]"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* <Card className="bg-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Open position by department
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setIsAddPositionModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus size={16} className="mr-1" />
              Add Position
            </Button>
          </CardHeader>
          <CardContent>
            {departmentData.length > 0 ? (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={departmentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {departmentData.map((_, i) => (
                          <Cell key={i} fill={pieColors[i % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {departmentData.map((item, i) => (
                    <div key={i} className="flex items-center space-x-2 text-sm">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: pieColors[i % pieColors.length] }}
                      ></div>
                      <span>
                        {item.name} {item.value} posts
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No department data available
              </div>
            )}
          </CardContent>
        </Card> */}

        {/* Bar Chart */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Application Received By Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sourceData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={sourceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#42A5F5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No source data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recruitment Funnel */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Recruitment Stages Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={recruitmentStagesData}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey={() => "Stages"} hide />
                  <Tooltip />
                  <Bar dataKey="Application" stackId="a" fill="#81C784" />
                  <Bar dataKey="Interview" stackId="a" fill="#4FC3F7" />
                  <Bar dataKey="Hired" stackId="a" fill="#F06292" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Color Legend */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#81C784]"></div>
                <span>Application</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#4FC3F7]"></div>
                <span>Interview</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#F06292]"></div>
                <span>Hired</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Bar Chart */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Application Received by Department
          </CardTitle>
        </CardHeader>
        <CardContent>
          {departmentBarData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={departmentBarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="applications" fill="#42A5F5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No department application data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Position Modal */}
      {/* <AddPositionModal
        isOpen={isAddPositionModalOpen}
        onClose={() => setIsAddPositionModalOpen(false)}
        onSuccess={handlePositionAdded}
      /> */}
    </div>
  );
}