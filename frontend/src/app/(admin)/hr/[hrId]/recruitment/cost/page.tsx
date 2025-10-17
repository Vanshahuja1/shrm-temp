'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,  Legend, CartesianGrid
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

const colors = ['#FF8F00', '#42A5F5', '#66BB6A', '#EF5350'];

const fallbackData = {
  totalCost: 1275,
  avgCostPerHire: 106.25,
  departments: ['Engineering', 'HR', 'Finance', 'Marketing'],
  hires: [
    { name: 'Ava Smith', department: 'Engineering', role: 'UI Designer', cost: 120, type: 'Ads' },
    { name: 'Liam Ray', department: 'Engineering', role: 'DevOps Engineer', cost: 150, type: 'Sourcing' },
    { name: 'Noah Carter', department: 'HR', role: 'HR Analyst', cost: 80, type: 'HR Time' },
    { name: 'Zoe Lane', department: 'Finance', role: 'Finance Associate', cost: 90, type: 'Sourcing' },
    { name: 'Ian Moss', department: 'Marketing', role: 'SEO Specialist', cost: 110, type: 'Ads' },
    { name: 'Mia Chen', department: 'Engineering', role: 'Backend Developer', cost: 140, type: 'HR Time' },
    { name: 'Ella James', department: 'HR', role: 'Recruitment Specialist', cost: 95, type: 'Sourcing' },
    { name: 'Ethan Cole', department: 'Engineering', role: 'Fullstack Developer', cost: 155, type: 'Ads' },
    { name: 'Grace Lee', department: 'Marketing', role: 'Content Strategist', cost: 105, type: 'HR Time' },
    { name: 'Ryan King', department: 'Finance', role: 'Accounts Manager', cost: 130, type: 'Ads' },
    { name: 'Sophie Khan', department: 'Engineering', role: 'QA Engineer', cost: 115, type: 'HR Time' },
    { name: 'Leo Park', department: 'HR', role: 'HR Business Partner', cost: 100, type: 'Sourcing' }
  ],
  costByDepartment: [
    { name: 'Engineering', cost: 580 },
    { name: 'HR', cost: 275 },
    { name: 'Finance', cost: 220 },
    { name: 'Marketing', cost: 200 },
  ],
  costByType: [
    { name: 'Ads', value: 475 },
    { name: 'Sourcing', value: 315 },
    { name: 'HR Time', value: 485 },
  ],
  monthlyTrend: [
    { month: 'Jan', cost: 250 },
    { month: 'Feb', cost: 320 },
    { month: 'Mar', cost: 400 },
    { month: 'Apr', cost: 305 },
  ]
};

export default function CostDashboard() {
  const [data, setData] = useState(fallbackData);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string>('All');

  const hiresFiltered = data.hires.filter(h =>
    (!selectedType || h.type === selectedType) &&
    (selectedDept === 'All' || h.department === selectedDept)
  );

  const roleGroupedData = Object.values(
    data.hires.reduce((acc, hire) => {
      const key = `${hire.department}-${hire.role}`;
      acc[key] = acc[key] || { department: hire.department, role: hire.role, cost: 0 };
      acc[key].cost += hire.cost;
      return acc;
    }, {} as Record<string, { department: string; role: string; cost: number }>)
  );

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/cost');
        const result = await res.json();
        setData(result);
      } catch {
        setData(fallbackData);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="text-sm">
        <Link href="/hr/recruitment" className="text-blue-600 underline">
          ← Back to Recruitment Dashboard
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-contrast">💰 Cost to Hire Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-gray-600 text-sm">Total Cost</p><p className="text-xl font-bold">${data.totalCost}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-gray-600 text-sm">Avg. Cost per Hire</p><p className="text-xl font-bold">${data.avgCostPerHire}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-gray-600 text-sm">Departments</p><p className="text-xl font-bold">{data.departments.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-gray-600 text-sm">Total Hires</p><p className="text-xl font-bold">{data.hires.length}</p></CardContent></Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart by department */}
        <Card>
          <CardHeader><CardTitle>Cost by Department</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.costByDepartment}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cost" fill="#FF8F00" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart + Label Legend */}
        <Card>
          <CardHeader><CardTitle>Cost Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer height={200}>
              <PieChart>
                <Pie
                  data={data.costByType}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  onClick={(_, i) =>
                    setSelectedType(data.costByType[i].name === selectedType ? null : data.costByType[i].name)
                  }
                >
                  {data.costByType.map((entry, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              {data.costByType.map((entry, i) => (
                <div key={i} className="flex items-center gap-2 cursor-pointer"
                  onClick={() =>
                    setSelectedType(entry.name === selectedType ? null : entry.name)
                  }>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                  <span className={`${selectedType === entry.name ? 'font-bold text-primary' : 'text-gray-600'}`}>
                    {entry.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grouped Bar: Cost per Role */}
      <Card>
        <CardHeader><CardTitle>Cost per Role (Grouped by Department)</CardTitle></CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer>
            <BarChart data={roleGroupedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="role" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cost" fill="#42A5F5" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Table with Department Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Hires & Costs</CardTitle>
          <div className="mt-2">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="All">All Departments</option>
              {data.departments.map((dept, i) => (
                <option key={i} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Department</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Cost</th>
                <th className="px-4 py-2 text-left">Type</th>
              </tr>
            </thead>
            <tbody>
              {hiresFiltered.map((h, i) => (
                <tr key={i} className="border-b hover:bg-soft">
                  <td className="px-4 py-2 text-contrast">{h.name}</td>
                  <td className="px-4 py-2 text-contrast">{h.department}</td>
                  <td className="px-4 py-2 text-contrast">{h.role}</td>
                  <td className="px-4 py-2 text-contrast">${h.cost}</td>
                  <td className="px-4 py-2 text-contrast">{h.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
