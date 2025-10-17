'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import axios from '@/lib/axiosInstance';
import { format } from "date-fns";
import { Candidate } from '../applicants/page';


export default function ShortlistedPage() {
  const [candidates, setCandidates] = useState<Candidate[]>();
  const router = useRouter();
  const { hrId } = useParams();
  useEffect(() => {
    async function fetchShortlisted() {
      try {
       const res = await axios.get('/recruitment/candidates?shortlisted=true');
        setCandidates(res.data);
      } catch(error) {
        console.log("Failed to fetch shortlisted candidates" , error);
      }
    }
    fetchShortlisted();
  }, []);

  

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="text-sm">
        <Link
          href={`/hr/${hrId}/recruitment`}
          className="text-blue-600 underline"
        >
          ← Back to Recruitment Dashboard
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-contrast mb-4">Shortlisted Candidates</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm table-fixed border-collapse">
          <thead>
            <tr className="bg-primary text-white">
              <th className="px-4 py-2 text-left w-12">#</th>
              <th className="px-4 py-2 text-left pl-6">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Job Title</th>
              <th className="px-4 py-2 text-left">Applied Date</th>
            </tr>
          </thead>
          <tbody>
            {candidates?.map((c, index) => (
              <motion.tr
                key={index}
                className="cursor-pointer hover:bg-[#FDD0C4] transition-colors"
                whileHover={{ y: -2 }}
                onClick={() => router.push(`/hr/${hrId}/recruitment/applicants/${c._id}`)}
              >
                 <td className="px-4 py-2 border-b text-contrast font-medium">{index + 1}</td>
                <td className="px-4 py-2 border-b text-contrast">{c.name}</td>
                <td className="px-4 py-2 border-b text-contrast">{c.email}</td>
                <td className="px-4 py-2 border-b text-contrast">{c.jobTitle}</td>
                <td className="px-4 py-2 border-b text-contrast"> {c.appliedDate
                                        ? format(new Date(c.appliedDate), "dd MMM yyyy")
                                        : "-"}</td>
                
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
