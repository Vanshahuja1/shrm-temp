'use client'

import { useEffect, useState } from 'react'

interface Employee {
  id: number
  name: string
  email: string
  attendance: number
}

export default function AttendancePage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [mailLog, setMailLog] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch('/api/policymanagement/attendance')
        const data = await res.json()
        setEmployees(data)
      } catch {
        setEmployees([
          { id: 1, name: 'Ayesha Khan', email: 'ayesha@company.com', attendance: 72 },
          { id: 2, name: 'Rohan Mehta', email: 'rohan@company.com', attendance: 85 },
          { id: 3, name: 'Isha Roy', email: 'isha@company.com', attendance: 68 }
        ])
      }
    }

    fetchAttendance()
  }, [])

  const sendMail = async (emp: Employee) => {
    const key = `attendance-${emp.id}`
    if (mailLog[key]) return

    await fetch('/api/policymanagement/send-attendance-warning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: emp.email,
        name: emp.name,
        attendance: emp.attendance
      })
    })

    const now = new Date().toLocaleString()
    setMailLog((prev) => ({ ...prev, [key]: now }))
    alert(`📤 Warning sent to ${emp.name}`)
  }

  const defaulters = employees.filter((e) => e.attendance < 75)

  return (
    <div className="bg-white border rounded-xl p-6 shadow text-gray-800">
      <h2 className="text-xl font-bold mb-4 text-gray-800">📉 Attendance Defaulters</h2>

      {defaulters.length === 0 ? (
        <p className="text-gray-500">✅ No defaulters found</p>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="block sm:hidden space-y-4">
            {defaulters.map((e) => {
              const key = `attendance-${e.id}`
              return (
                <div
                  key={e.id}
                  className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm shadow-sm"
                >
                  <p>
                    <span className="font-semibold">Name:</span> {e.name}
                  </p>
                  <p>
                    <span className="font-semibold">Email:</span> {e.email}
                  </p>
                  <p>
                    <span className="font-semibold">Attendance:</span>{' '}
                    <span className="text-red-600">{e.attendance}%</span>
                  </p>
                  <div className="mt-2">
                    <button
                      onClick={() => sendMail(e)}
                      disabled={!!mailLog[key]}
                      className={`w-full text-xs px-3 py-2 rounded ${
                        mailLog[key]
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      {mailLog[key] ? 'Warning Sent' : 'Send Warning'}
                    </button>
                    {mailLog[key] && (
                      <p className="text-[11px] text-gray-500 mt-1">Sent: {mailLog[key]}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm border rounded min-w-[500px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-2 border-b">Name</th>
                  <th className="text-left px-4 py-2 border-b">Email</th>
                  <th className="text-left px-4 py-2 border-b">Attendance %</th>
                  <th className="text-left px-4 py-2 border-b">Action</th>
                </tr>
              </thead>
              <tbody>
                {defaulters.map((e) => {
                  const key = `attendance-${e.id}`
                  return (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border-b">{e.name}</td>
                      <td className="px-4 py-2 border-b">{e.email}</td>
                      <td className="px-4 py-2 border-b text-red-600">{e.attendance}%</td>
                      <td className="px-4 py-2 border-b">
                        <div className="flex flex-col">
                          <button
                            onClick={() => sendMail(e)}
                            disabled={!!mailLog[key]}
                            className={`px-3 py-1 text-xs rounded ${
                              mailLog[key]
                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                : 'bg-red-500 text-white hover:bg-red-600'
                            }`}
                          >
                            {mailLog[key] ? 'Warning Sent' : 'Send Warning'}
                          </button>
                          {mailLog[key] && (
                            <span className="text-[11px] text-gray-500">Sent: {mailLog[key]}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
