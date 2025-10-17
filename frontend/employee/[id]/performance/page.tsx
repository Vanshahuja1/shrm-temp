"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Star } from "lucide-react"
// import axios from "@/lib/axiosInstance" // Uncomment when using real API

type PerformanceScore = {
  employeeId: {
    id: string
    name: string
    role?: string
    department?: string
  }
  evaluationPeriod: {
    year: number
    quarter: string
  }
  scores: {
    taskDelivery: number
    qualityErrorRate: number
    teamCoordination: number
    efficiency: number
    totalScore: number
  }
  category: string
  status: string
  managerEvaluation?: { rating: number; comments: string }
  selfAssessment?: { rating: number; comments: string }
}

export default function PerformancePage() {
  const { id } = useParams<{ id: string }>()
  const [score, setScore] = useState<PerformanceScore | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Replace this dummy data with a real API call to fetch employee performance score
    setTimeout(() => {
      setScore({
        employeeId: {
          id: id ?? "",
          name: "John Doe",
          role: "Software Engineer",
          department: "IT"
        },
        evaluationPeriod: {
          year: 2025,
          quarter: "Q2"
        },
        scores: {
          taskDelivery: 32,
          qualityErrorRate: 25,
          teamCoordination: 18,
          efficiency: 8,
          totalScore: 83
        },
        category: "EE",
        status: "approved",
        managerEvaluation: {
          rating: 4,
          comments: "Consistently delivers high-quality work and collaborates well with the team."
        },
        selfAssessment: {
          rating: 4,
          comments: "I am satisfied with my performance and teamwork this quarter."
        }
      })
      setLoading(false)
    }, 800)
  }, [id])

  if (loading || !score) {
    return <div className="animate-pulse">Loading performance metrics...</div>
  }

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Performance Details for {score.employeeId.name}</CardTitle>
        <div className="text-sm text-gray-500">
          {score.employeeId.role} &middot; {score.employeeId.department}
        </div>
        <div className="mt-1 text-gray-600">
          Period: {score.evaluationPeriod.quarter} {score.evaluationPeriod.year}
        </div>
        <Badge className="mt-2">{score.category}</Badge>
        <Badge variant="outline" className="ml-2">{score.status}</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Score Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Task Delivery (40%)</span>
                <div className="flex items-center space-x-2">
                  <Progress value={score.scores.taskDelivery} className="w-32" />
                  <span className="font-medium w-12">{score.scores.taskDelivery}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Quality Error Rate (30%)</span>
                <div className="flex items-center space-x-2">
                  <Progress value={score.scores.qualityErrorRate} className="w-32" />
                  <span className="font-medium w-12">{score.scores.qualityErrorRate}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Team Coordination (20%)</span>
                <div className="flex items-center space-x-2">
                  <Progress value={score.scores.teamCoordination} className="w-32" />
                  <span className="font-medium w-12">{score.scores.teamCoordination}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Efficiency (10%)</span>
                <div className="flex items-center space-x-2">
                  <Progress value={score.scores.efficiency} className="w-32" />
                  <span className="font-medium w-12">{score.scores.efficiency}</span>
                </div>
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-medium">Total Score</span>
                <span className="text-xl font-bold text-blue-600">{score.scores.totalScore}%</span>
              </div>
            </div>
          </div>
          {score.managerEvaluation && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Manager Evaluation</h4>
              <div className="flex items-center space-x-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < score.managerEvaluation!.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <div>{score.managerEvaluation.comments}</div>
            </div>
          )}
          {score.selfAssessment && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Self Assessment</h4>
              <div className="flex items-center space-x-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < score.selfAssessment!.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <div>{score.selfAssessment.comments}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}