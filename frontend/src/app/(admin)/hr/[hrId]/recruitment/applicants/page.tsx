"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams, useRouter } from "next/navigation";
import axios from "@/lib/axiosInstance";
import { format } from "date-fns";

export type Candidate = {
  _id: string;
  name: string;
  email: string;
  appliedDate: string;
  jobTitle: string;
  status: string;
};

export default function CandidatesPage() {
  const { hrId } = useParams();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchCandidates() {
      try {
        const res = await axios.get(`/recruitment/candidates`);

        setCandidates(res.data);
      } catch (err) {
        console.log(err);
      }
    }
    fetchCandidates();
  }, []);

  return (
    <div className="min-h-screen bg-neutral p-6">
      <div className="text-sm text-accent mb-4">
        <Link
          href={`/hr/${hrId}/recruitment`}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary underline "
        >
          ← Back to Recruitment Dashboard
        </Link>
      </div>

      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-contrast">
            Application Details
          </CardTitle>
          <CardTitle
          onClick={() => router.push(`/hr/${hrId}/recruitment/applicants/add`)}
          className="text-sm text-muted-foreground cursor-pointer">
            Add new 
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed border-collapse">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="px-4 py-2 text-left w-12">S.No.</th>
                  <th className="px-4 py-2 text-left pl-6">Applicant</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Job Title</th>
                  <th className="px-4 py-2 text-left">Job Applied Date</th>
                  <th className="px-4 py-2 text-left">Current Status</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate, index) => (
                  <motion.tr
                    key={index}
                    className="cursor-pointer hover:bg-[#FDD0C4] transition-colors"
                    whileHover={{ y: -2 }}
                    onClick={() =>
                      router.push(
                        `/hr/${hrId}/recruitment/applicants/${candidate._id}`
                      )
                    }
                  >
                    <td className="px-4 py-2 border-b text-contrast font-medium">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 border-b text-contrast">
                      {candidate.name}
                    </td>
                    <td className="px-4 py-2 border-b text-contrast">
                      {candidate.email}
                    </td>
                    <td className="px-4 py-2 border-b text-contrast">
                      {candidate.jobTitle}
                    </td>
                    <td className="px-4 py-2 border-b text-contrast">
                      {candidate.appliedDate
                        ? format(new Date(candidate.appliedDate), "dd MMM yyyy")
                        : "-"}
                    </td>
                    <td className="px-4 py-2 border-b">
                      <Badge variant="secondary">{candidate.status}</Badge>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
