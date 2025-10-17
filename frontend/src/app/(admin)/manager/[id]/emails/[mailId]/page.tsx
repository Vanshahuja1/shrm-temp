"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Clock,
  User,
  Users,
  Mail,
} from "lucide-react";
import axios from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Email } from "../types";

// Cache name lookups
const nameCache = new Map<string, string>();

const fetchEmployeeName = async (empId: string): Promise<string> => {
  try {
    const response = await axios.get(`/user/name/${empId}`);
    return response.data.name || empId;
  } catch (error) {
    console.error(`Error fetching name for ID ${empId}:`, error);
    return empId;
  }
};

const getEmployeeName = async (empId: string): Promise<string> => {
  if (nameCache.has(empId)) return nameCache.get(empId)!;
  const name = await fetchEmployeeName(empId);
  nameCache.set(empId, name);
  return name;
};

const EmployeeDisplay = ({
  email,
  empId,
  showAvatar = false,
}: {
  email: string;
  empId?: string;
  showAvatar?: boolean;
}) => {
  const [employeeName, setEmployeeName] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (empId) {
      setLoading(true);
      getEmployeeName(empId)
        .then(setEmployeeName)
        .catch(() => setEmployeeName(empId))
        .finally(() => setLoading(false));
    }
  }, [empId]);

  const displayName = employeeName && employeeName !== empId ? employeeName : email.split("@")[0];
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3">
      {showAvatar && (
        <Avatar className="h-9 w-9">
          <AvatarImage src={`/placeholder.svg?height=36&width=36&text=${initials}`} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      )}
      <div className="leading-tight">
        <span className="font-medium text-gray-900 text-sm">{loading ? "Loading..." : displayName}</span>
        <p className="text-xs text-gray-500">{email}</p>
      </div>
    </div>
  );
};

const EmailHeader = ({ email }: { email: Email }) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-700 border-green-200";
      case "failed":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  return (
    <CardHeader className="pb-3 border-b">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">{email.subject}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="outline" className={getStatusColor(email.status)}>
              {email.status?.toUpperCase() || "UNKNOWN"}
            </Badge>
            {email.type && (
              <Badge variant="secondary">
                {email.type.replace(/_/g, " ").toUpperCase()}
              </Badge>
            )}
            <div className="flex items-center gap-1 text-gray-500">
              <Clock className="h-4 w-4" />
              {email.sentAt ? new Date(email.sentAt).toLocaleString() : "No date"}
            </div>
          </div>
        </div>
      </div>
    </CardHeader>
  );
};

const EmailMetadata = ({ email }: { email: Email }) => {
  const totalRecipients = (email.recipients?.length || 0) + (email.cc?.length || 0);

  return (
    <div className="grid gap-5 text-sm text-gray-800">
      {/* Sender */}
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2 font-medium text-gray-600 w-20">
          <User className="h-4 w-4" />
          From:
        </div>
        <EmployeeDisplay email={email.sender || ""} empId={email.senderId} showAvatar />
      </div>

      {/* Recipients */}
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2 font-medium text-gray-600 w-20">
          <Mail className="h-4 w-4" />
          To:
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {(email.recipients ?? []).length > 1
            ? (email.recipients ?? []).map((recipient, index) => (
                <EmployeeDisplay
                  key={recipient}
                  email={recipient}
                  empId={email.recipientIds?.[index]}
                />
              ))
            : (
                <EmployeeDisplay
                  email={email.recipient || (email.recipients ?? [])[0] || ""}
                  empId={email.recipientId || email.recipientIds?.[0]}
                  showAvatar
                />
              )}
        </div>
      </div>

      {/* CC */}
      {email.cc && email.cc.length > 0 && (
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 font-medium text-gray-600 w-20">
            <Users className="h-4 w-4" />
            CC:
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {email.cc.map((ccEmail, index) => (
              <EmployeeDisplay
                key={ccEmail}
                email={ccEmail}
                empId={email.ccIds?.[index]}
              />
            ))}
          </div>
        </div>
      )}

      {/* Indicator */}
      {totalRecipients > 1 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-2">
          <div className="flex items-center gap-2 text-red-800 font-medium">
            <Users className="h-4 w-4" />
            Multi-recipient email
          </div>
          <p className="text-sm text-red-700 mt-1">
            Sent to {email.recipients?.length || 0} recipients
            {email.cc?.length ? ` with ${email.cc.length} CC` : ""}
          </p>
        </div>
      )}
    </div>
  );
};

const EmailDetailSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-32" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-16" />
      </div>
    </div>
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-3/4" />
        <div className="flex gap-2 mt-3">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
    </Card>
  </div>
);

export default function EmailDetailPage() {
  const { mailId, id } = useParams();
  const router = useRouter();
  const [email, setEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mailId) {
      const fetchEmail = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`/mail/${mailId}`);
          setEmail(response.data.email);
          setError(null);
        } catch (error) {
          console.error("Error fetching email:", error);
          setError("Failed to load email. Please try again.");
        } finally {
          setLoading(false);
        }
      };
      fetchEmail();
    }
  }, [mailId]);

  const handleBackToInbox = () => {
    router.push(`/manager/${id}/emails`);
  };

  if (loading) return <EmailDetailSkeleton />;

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={handleBackToInbox} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Inbox
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={handleBackToInbox} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Inbox
        </Button>
        <div className="text-center py-12">
          <p className="text-gray-500">Email not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBackToInbox} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Inbox
        </Button>
      </div>

      <Card className="shadow-sm">
        <EmailHeader email={email} />
        <CardContent className="space-y-6">
          <EmailMetadata email={email} />
          <Separator />
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-base rounded-md bg-gray-50 p-4 border">
            {email.message}
          </div>
        </CardContent>
      </Card>
    </div>
  );

}
