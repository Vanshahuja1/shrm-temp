'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BarChart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ResponsiveContainer, BarChart as MuiBarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'

type EmployeeSalary = {
  id: number
  name: string
  department: string
  prevMonthSalary: number
  currentMonthSalary: number
}

export default function ReviewAllEmployeesPage() {
  const [data, setData] = useState<EmployeeSalary[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/payroll/salary-review')
        const json = await res.json()
        setData(json)
      } catch {
        setData([
          { id: 1, name: 'Ayesha Khan', department: 'Engineering', prevMonthSalary: 64000, currentMonthSalary: 66000 },
          { id: 2, name: 'Rohan Mehta', department: 'HR', prevMonthSalary: 58000, currentMonthSalary: 58000 },
          { id: 3, name: 'Neha Reddy', department: 'Sales', prevMonthSalary: 60000, currentMonthSalary: 59000 }
        ])
      }
    }

    fetchData()
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.push('/hr/payroll')} className="text-red-500">
          <ArrowLeft size={16} className="mr-1" /> Back
        </Button>
        <h1 className="text-xl font-bold text-red-600">📊 Salary Review & Comparison</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart size={18} /> Monthly Salary Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <MuiBarChart data={data} margin={{ top: 16, right: 16, bottom: 0, left: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => `₹${value.toLocaleString()}`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
              <Legend />
              <Bar dataKey="prevMonthSalary" name="Previous" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="currentMonthSalary" name="Current" fill="#f87171" radius={[4, 4, 0, 0]} />
            </MuiBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Detailed Salary Table</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Previous Month</TableHead>
                <TableHead>Current Month</TableHead>
                <TableHead>Difference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((emp) => {
                const diff = emp.currentMonthSalary - emp.prevMonthSalary
                const color = diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-500'
                return (
                  <TableRow key={emp.id}>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.department}</TableCell>
                    <TableCell>₹{emp.prevMonthSalary.toLocaleString()}</TableCell>
                    <TableCell>₹{emp.currentMonthSalary.toLocaleString()}</TableCell>
                    <TableCell className={`font-medium ${color}`}>
                      {diff === 0 ? 'No Change' : `${diff > 0 ? '+' : ''}₹${diff.toLocaleString()}`}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
