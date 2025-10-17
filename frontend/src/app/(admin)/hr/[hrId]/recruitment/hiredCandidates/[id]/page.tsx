'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';

const fallback = {
  id: 'cameron-riley',
  name: 'Cameron Riley',
  email: 'cameron@acr.com',
  jobTitle: 'Process Associate',
  appliedDate: '2024-06-10',
  doj: '2024-07-01',
  department: 'Operations',
  currentStatus: 'Onboarded',
  recruiter: 'Jessica Smith',
  offerLetterSent: true,
  welcomeKit: true,
  trainingSchedule: '2024-07-05',
  letterOfIntentSent: true,
    onboardingDocs: {
      pan: true,
      aadhar: false,
      bankDetails: true,
},
};

export default function HiredDetailPage() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(fallback);
  const completedItems = [
    candidate.letterOfIntentSent,
    candidate.onboardingDocs.pan,
    candidate.onboardingDocs.aadhar,
    candidate.onboardingDocs.bankDetails,
  ].filter(Boolean).length;
  useEffect(() => {
    async function fetchCandidate() {
      try {
        const res = await fetch(`/api/hired/${id}`);
        const data = await res.json();
        setCandidate(data);
      } catch {
        setCandidate(fallback);
      }
    }
    fetchCandidate();
  }, [id]);
  const totalItems = 4;
  const progressValue = Math.round((completedItems / totalItems) * 100);
  const onboardingComplete = progressValue === 100;
  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="text-sm">
        <Link
          href="/hr/recruitment/hiredCandidates"
          className="text-blue-600 underline"
        >
          ← Back to Hired List
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-contrast">Hired Candidate: {candidate.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-contrast">
        <p><strong>Email:</strong> {candidate.email}</p>
        <p><strong>Job Title:</strong> {candidate.jobTitle}</p>
        <p><strong>Applied Date:</strong> {candidate.appliedDate}</p>
        <p><strong>Date of Joining:</strong> {candidate.doj}</p>
        <p><strong>Department:</strong> {candidate.department}</p>
        <p><strong>Recruiter:</strong> {candidate.recruiter}</p>
        <p><strong>Status:</strong> {candidate.currentStatus}</p>
        <p><strong>Training Scheduled:</strong> {candidate.trainingSchedule}</p>
        <p>
          <strong>Offer Letter Sent:</strong>{' '}
          {candidate.offerLetterSent ? '✅ Yes' : '❌ No'}
        </p>
        <p>
          <strong>Welcome Kit:</strong>{' '}
          {candidate.welcomeKit ? '✅ Yes' : '❌ No'}
        </p>
      </div>
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Onboarding Progress</h2>
        <Progress value={progressValue} className="h-4 rounded-full" />
        <p className="mt-2 text-sm text-gray-700">Completed {completedItems} of {totalItems} items</p>
         {onboardingComplete && (
          <div className="mt-2 inline-block bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
            ✅ Ready for Onboarding
          </div>
        )}
        <ul className="mt-4 space-y-1 pl-4 list-disc text-sm text-contrast">
          <li className={candidate.letterOfIntentSent ? 'text-green-700' : 'text-red-600'}>
            Letter of Intent: {candidate.letterOfIntentSent ? '✅ Sent' : '❌ Not Sent'}
          </li>
          <li className={candidate.onboardingDocs.pan ? 'text-green-700' : 'text-red-600'}>
            PAN: {candidate.onboardingDocs.pan ? '✅ Received' : '❌ Missing'}
          </li>
          <li className={candidate.onboardingDocs.aadhar ? 'text-green-700' : 'text-red-600'}>
            Aadhar: {candidate.onboardingDocs.aadhar ? '✅ Received' : '❌ Missing'}
          </li>
          <li className={candidate.onboardingDocs.bankDetails ? 'text-green-700' : 'text-red-600'}>
            Bank Details: {candidate.onboardingDocs.bankDetails ? '✅ Received' : '❌ Missing'}
          </li>
        </ul>
      </div>
    </div>
  );
}
