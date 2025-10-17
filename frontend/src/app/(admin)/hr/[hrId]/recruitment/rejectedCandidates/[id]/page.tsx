'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const fallback = {
  id: 'rob-harris',
  name: 'Rob Harris',
  email: 'rob@fail.com',
  jobTitle: 'Content Writer',
  appliedDate: '2024-05-10',
  rejectionDate: '2024-06-01',
  rejectionReason: 'Lack of required writing samples.',
  stageRejected: 'Initial Screening',
  reviewedBy: 'Anna HR',
  notes: 'Did not follow instructions for writing task.',
};

export default function RejectedDetailPage() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(fallback);

  useEffect(() => {
    async function fetchCandidate() {
      try {
        const res = await fetch(`/api/rejected/${id}`);
        const data = await res.json();
        setCandidate(data);
      } catch {
        setCandidate(fallback);
      }
    }
    fetchCandidate();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="text-sm">
        <Link
          href="/hr/recruitment/rejectedCandidates"
          className="text-blue-600 underline"
        >
          ← Back to Rejected List
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-contrast">Rejected Candidate: {candidate.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-contrast">
        <p><strong>Email:</strong> {candidate.email}</p>
        <p><strong>Job Title:</strong> {candidate.jobTitle}</p>
        <p><strong>Applied Date:</strong> {candidate.appliedDate}</p>
        <p><strong>Rejection Date:</strong> {candidate.rejectionDate}</p>
        <p><strong>Stage Rejected:</strong> {candidate.stageRejected}</p>
        <p><strong>Reviewed By:</strong> {candidate.reviewedBy}</p>
        <p><strong>Rejection Reason:</strong> {candidate.rejectionReason}</p>
        <p><strong>Notes:</strong> {candidate.notes}</p>
      </div>
    </div>
  );
}
