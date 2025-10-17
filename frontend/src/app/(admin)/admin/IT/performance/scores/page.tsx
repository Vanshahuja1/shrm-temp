"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Plus, Edit, Trash2, Eye, Star } from "lucide-react";
import { useParams } from "next/navigation";
import axios from "@/lib/axiosInstance";

type OrgMemberInfo = {
  id: string;
  name: string;
  role?: string;
  department?: string;
};

type PerformanceScore = {
  _id: string;
  employeeId: OrgMemberInfo;
  evaluationPeriod: {
    year: number;
    quarter: string;
  };
  scores: {
    taskDelivery: number;
    qualityErrorRate: number;
    teamCoordination: number;
    efficiency: number;
    totalScore: number;
  };
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  // Add these for demo rating usage
  managerEvaluation?: { rating: number; comments: string };
  selfAssessment?: { rating: number; comments: string };
};

type PerformanceScoreForm = {
  employeeId: string;
  quarter: string;
  year: number;
  taskDelivery: number;
  qualityErrorRate: number;
  teamCoordination: number;
  efficiency: number;
};

export default function PerformanceScoresPage() {
  const { id: managerId } = useParams();
  const [employees, setEmployees] = useState<OrgMemberInfo[]>([]);
  const [interns, setInterns] = useState<OrgMemberInfo[]>([]);
  const [performanceScores, setPerformanceScores] = useState<PerformanceScore[]>([]);
  const [form, setForm] = useState<PerformanceScoreForm>({
    employeeId: "",
    quarter: "Q1",
    year: new Date().getFullYear(),
    taskDelivery: 0,
    qualityErrorRate: 0,
    teamCoordination: 0,
    efficiency: 0,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedScore, setSelectedScore] = useState<PerformanceScore | null>(null);

  useEffect(() => {
    const fetchManagerTeam = async () => {
      try {
        const res = await axios.get(`/IT/org-members/${managerId}`);
        const data = res.data;
        setEmployees(data.employees || []);
        setInterns(data.interns || []);
      } catch {
        setEmployees([]);
        setInterns([]);
      }
    };
    fetchManagerTeam();
    fetchPerformanceScores();
  }, [managerId]);

  const fetchPerformanceScores = async () => {
    // Replace with your actual API endpoint for fetching scores
    setPerformanceScores([]); // Placeholder, implement as needed
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const totalScore = Math.round(
        (Number(form.taskDelivery) * 0.4) +
        (Number(form.qualityErrorRate) * 0.3) +
        (Number(form.teamCoordination) * 0.2) +
        (Number(form.efficiency) * 0.1)
      );
      const payload = {
        employeeId: form.employeeId,
        evaluationPeriod: {
          quarter: form.quarter,
          year: Number(form.year),
          startDate: new Date(`${form.year}-01-01`),
          endDate: new Date(`${form.year}-12-31`),
        },
        scores: {
          taskDelivery: Number(form.taskDelivery),
          qualityErrorRate: Number(form.qualityErrorRate),
          teamCoordination: Number(form.teamCoordination),
          efficiency: Number(form.efficiency),
          totalScore,
        },
      };
      await axios.post("/performance-scores", payload);
      setMessage("Performance score created successfully.");
      setForm({ ...form, taskDelivery: 0, qualityErrorRate: 0, teamCoordination: 0, efficiency: 0 });
      fetchPerformanceScores();
    } catch {
      setMessage("Error creating performance score.");
    } finally {
      setLoading(false);
    }
  };

  const teamOptions = [...employees, ...interns];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Scores</h1>
          <p className="text-gray-600 mt-1">Manage employee performance evaluations</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Performance Score
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Performance Score</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new performance score for your team member.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employee">Employee/Intern</Label>
                  <Select value={form.employeeId} onValueChange={(value) => setForm({ ...form, employeeId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee/intern" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamOptions.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} ({member.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quarter">Quarter</Label>
                  <Select value={form.quarter} onValueChange={(value) => setForm({ ...form, quarter: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1">Q1</SelectItem>
                      <SelectItem value="Q2">Q2</SelectItem>
                      <SelectItem value="Q3">Q3</SelectItem>
                      <SelectItem value="Q4">Q4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input type="number" name="year" value={form.year} onChange={handleChange} min={2020} max={2030} />
                </div>
                <div>
                  <Label htmlFor="taskDelivery">Task Delivery (40%)</Label>
                  <Input type="number" name="taskDelivery" value={form.taskDelivery} onChange={handleChange} min={0} max={40} />
                </div>
                <div>
                  <Label htmlFor="qualityErrorRate">Quality Error Rate (30%)</Label>
                  <Input type="number" name="qualityErrorRate" value={form.qualityErrorRate} onChange={handleChange} min={0} max={30} />
                </div>
                <div>
                  <Label htmlFor="teamCoordination">Team Coordination (20%)</Label>
                  <Input type="number" name="teamCoordination" value={form.teamCoordination} onChange={handleChange} min={0} max={20} />
                </div>
                <div>
                  <Label htmlFor="efficiency">Efficiency (10%)</Label>
                  <Input type="number" name="efficiency" value={form.efficiency} onChange={handleChange} min={0} max={10} />
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Calculated Total Score</h4>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(
                    (Number(form.taskDelivery) * 0.4) +
                    (Number(form.qualityErrorRate) * 0.3) +
                    (Number(form.teamCoordination) * 0.2) +
                    (Number(form.efficiency) * 0.1)
                  )}%
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </div>
                  ) : (
                    "Create Score"
                  )}
                </Button>
              </DialogFooter>
              {message && <div className="mt-2 text-center text-red-600">{message}</div>}
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {/* Performance Scores Table */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Scores ({performanceScores.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Total Score</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performanceScores.map((score) => (
                <TableRow key={score._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{score.employeeId.name}</div>
                      <div className="text-sm text-gray-600">{score.employeeId.department}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {score.evaluationPeriod.quarter} {score.evaluationPeriod.year}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{score.scores.totalScore}%</span>
                      <Progress value={score.scores.totalScore} className="w-16" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge>{score.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{score.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" title="View Details" onClick={() => { setSelectedScore(score); setIsViewDialogOpen(true); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Edit Score">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Delete Score" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* View Performance Score Dialog (uses Star) */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Performance Score Details</DialogTitle>
            <DialogDescription>
              Detailed breakdown and evaluations for the selected score.
            </DialogDescription>
          </DialogHeader>
          {selectedScore && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Employee Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Name:</span>
                    <div className="font-medium">{selectedScore.employeeId.name}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Department:</span>
                    <div className="font-medium">{selectedScore.employeeId.department}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Role:</span>
                    <div className="font-medium">{selectedScore.employeeId.role}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Period:</span>
                    <div className="font-medium">
                      {selectedScore.evaluationPeriod.quarter} {selectedScore.evaluationPeriod.year}
                    </div>
                  </div>
                </div>
              </div>
              {/* Example usage of Star for manager evaluation */}
              {selectedScore.managerEvaluation && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Manager Evaluation</h4>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < selectedScore.managerEvaluation!.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <div>{selectedScore.managerEvaluation.comments}</div>
                </div>
              )}
              {/* Example usage of Star for self assessment */}
              {selectedScore.selfAssessment && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Self Assessment</h4>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < selectedScore.selfAssessment!.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <div>{selectedScore.selfAssessment.comments}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}