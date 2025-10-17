'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { CircularProgress } from '@mui/material'
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts'
import { motion } from 'framer-motion'

type DashboardData = {
  totalEmployees: number
  employeesPresent: number
  employeesOnLeave: number
  employeesLate: number
  attendanceBar: { month: string; value: number }[]
  presentList: { name: string; checkin: string; status: string }[]
  leaveList: { name: string; days: string }[]
  attendanceToday: { name: string; id: number; checkin: string; checkout: string }[]
  birthdays: { name: string; date: string }[]
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('/api/hr-dashboard')
        if (!res.ok) throw new Error('API error')
        const apiData = await res.json()
        setData(apiData)
      } catch (error) {
        setData({
          totalEmployees: 53,
          employeesPresent: 44,
          employeesOnLeave: 9,
          employeesLate: 0,
          attendanceBar: [
            { month: 'Jan', value: 30 },
            { month: 'Feb', value: 40 },
            { month: 'Mar', value: 45 },
            { month: 'Apr', value: 50 },
            { month: 'May', value: 53 }
          ],
          presentList: [
            { name: 'Kitty', checkin: '09.02', status: 'present' },
            { name: 'Olivia', checkin: '09.04', status: 'present' },
            { name: 'Peter', checkin: '09.05', status: 'present' }
          ],
          leaveList: [
            { name: 'Kitty', days: '2/3' },
            { name: 'Olivia', days: '4/5' }
          ],
          attendanceToday: [
            { name: 'Adhvik', id: 14, checkin: '09:00 AM', checkout: '-' }
          ],
          birthdays: [
            { name: 'Kitty', date: '21 Jan 2025' }
          ]
        })
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <CircularProgress color="error" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="max-w-7xl mx-auto px-6 py-10"
    >
      <h1 className="text-2xl font-bold mb-2">Hello, Olivia Green!</h1>
      <p className="mb-6 text-gray-600">Hope you&apos;re having a productive day :)</p>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>Total Employees</CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-indigo-700">{data.totalEmployees}</span>
              <div className="w-24 h-16">
                <ResponsiveContainer width="100%" height={60}>
                  <BarChart data={data.attendanceBar}>
                    <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    <XAxis dataKey="month" fontSize={10} stroke="#6b7280" />
                    <Tooltip />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>Employee&apos;s Present Today</CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-green-700">{data.employeesPresent}</span>
              <CircularProgress variant="determinate" value={70} color="success" size={60} thickness={5} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>Employee&apos;s on Leave</CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-red-700">{data.employeesOnLeave}</span>
              <CircularProgress variant="determinate" value={15} color="error" size={60} thickness={5} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>Employee&apos;s Late Today</CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-yellow-700">{data.employeesLate}</span>
              <CircularProgress variant="determinate" value={0} color="warning" size={60} thickness={5} />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>Employees Present</CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">{data.employeesPresent}/{data.totalEmployees}</span>
            </div>
            <ul className="divide-y">
              {data.presentList.map((emp, idx) => (
                <li key={idx} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-gray-200 w-7 h-7 flex items-center justify-center font-bold text-gray-700">
                      {emp.name[0]}
                    </span>
                    <span>{emp.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{emp.checkin}</span>
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>Employees on Leave</CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">{data.leaveList.length}/{data.totalEmployees}</span>
            </div>
            <ul className="divide-y">
              {data.leaveList.map((emp, idx) => (
                <li key={idx} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-red-100 w-7 h-7 flex items-center justify-center font-bold text-red-700">
                      {emp.name[0]}
                    </span>
                    <span>{emp.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{emp.days} days</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>Birthdays</CardHeader>
          <CardContent>
            <ul className="divide-y">
              {data.birthdays.map((b, idx) => (
                <li key={idx} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-purple-100 w-7 h-7 flex items-center justify-center font-bold text-purple-700">
                      {b.name[0]}
                    </span>
                    <span>{b.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{b.date}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today&apos;s Attendance</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-left">
              <th className="py-2">Emp Name</th>
              <th className="py-2">Emp Id</th>
              <th className="py-2">Check-in</th>
              <th className="py-2">Check-out</th>
            </tr>
          </thead>
          <tbody>
            {data.attendanceToday.map((row, idx) => (
              <tr key={idx} className="border-t">
                <td className="py-2 flex items-center gap-2">
                  <span className="rounded-full bg-green-100 w-7 h-7 flex items-center justify-center font-bold text-green-700">
                    {row.name[0]}
                  </span>
                  {row.name}
                </td>
                <td className="py-2">{row.id}</td>
                <td className="py-2">{row.checkin}</td>
                <td className="py-2">{row.checkout}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

export default Dashboard

