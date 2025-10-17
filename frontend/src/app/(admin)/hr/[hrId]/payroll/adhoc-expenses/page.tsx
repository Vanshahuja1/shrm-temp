'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Chip,
} from '@mui/material'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
// import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

interface AdhocPayment {
  id: number
  name: string
  department: string
  reason: string
  amount: number
  type: 'Reimbursement' | 'Adhoc Payment' | 'Deduction'
  status: 'Pending' | 'Approved' | 'Rejected'
}

const STATUS_COLORS = {
  Approved: '#4caf50',
  Pending: '#ff9800',
  Rejected: '#f44336',
}

const TYPE_COLORS = {
  Reimbursement: '#2196f3',
  'Adhoc Payment': '#9c27b0',
  Deduction: '#f44336',
}

export default function AdhocExpensesPage() {
  const [data, setData] = useState<AdhocPayment[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/payroll/adhoc-expenses')
        const json = await res.json()
        setData(json)
      } catch {
        setData([
          { id: 1, name: 'Rohan Mehta', department: 'Sales', reason: 'Travel Reimbursement', amount: 2400, type: 'Reimbursement', status: 'Pending' },
          { id: 2, name: 'Ayesha Khan', department: 'HR', reason: 'Phone Bill', amount: 800, type: 'Adhoc Payment', status: 'Approved' },
          { id: 3, name: 'Neha Reddy', department: 'IT', reason: 'Policy Violation', amount: 1000, type: 'Deduction', status: 'Rejected' }
        ])
      }
    }
    fetchData()
  }, [])

  const statusSummary = data.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const typeSummary = data.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + curr.amount
    return acc
  }, {} as Record<string, number>)

  const statusChartData = Object.entries(statusSummary).map(([status, count]) => ({ name: status, value: count }))
  const typeChartData = Object.entries(typeSummary).map(([type, value]) => ({ name: type, value }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto p-6 space-y-6"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/hr/payroll")}
          className="flex items-center gap-1 text-sm text-red-600 hover:underline"
        >
          <ArrowLeft size={16} /> Back to Payroll
        </button>
        <Typography variant="h5" className="text-red-600 font-bold">
          💼 Reimbursements & Adhoc Expenses
        </Typography>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader title="Status Breakdown" />
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader title="Amount by Type" />
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={typeChartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {typeChartData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={TYPE_COLORS[entry.name as keyof typeof TYPE_COLORS]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Card>
            <CardHeader title="Expense Details" />
            <CardContent>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Amount (₹)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.department}</TableCell>
                        <TableCell>{item.reason}</TableCell>
                        <TableCell>
                          <Chip label={item.type} style={{ backgroundColor: TYPE_COLORS[item.type], color: '#fff' }} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip label={item.status} style={{ backgroundColor: STATUS_COLORS[item.status], color: '#fff' }} size="small" />
                        </TableCell>
                        <TableCell align="right">₹{item.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </div>
    </motion.div>
  )
}