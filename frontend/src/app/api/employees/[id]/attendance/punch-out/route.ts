import { type NextRequest, NextResponse } from "next/server"

// POST /api/employees/[id]/attendance/punch-out - Punch out
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const punchOut = await recordPunchOut(id, body.timestamp)
    return NextResponse.json(punchOut)
  } catch {
    return NextResponse.json({ error: "Failed to punch out" }, { status: 500 })
  }
}

async function recordPunchOut(employeeId: string, timestamp: string) {
  // Your database update here
  return {
    employeeId,
    punchOut: timestamp,
    totalHours: 8.5,
  }
}
