import type { Employee } from "../types"

export const calculatePerformanceMetrics = (employee: Employee) => {
  const tasksScore = (employee.tasksPerDay / 5) * 100
  const attendanceScore = employee.attendance
  const managerReviewScore = (employee.managerRating / 5) * 100
  const combinedPercentage = (tasksScore + attendanceScore + managerReviewScore) / 3

  return {
    tasksScore,
    attendanceScore,
    managerReviewScore,
    combinedPercentage: Math.round(combinedPercentage),
  }
}
