// app/admin/IT/emails/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Send, Star, FilterX, Inbox, Users } from "lucide-react";
import axios from "@/lib/axiosInstance";
import { Email } from "./types"; 

// Utility function to fetch employee name by ID
const fetchEmployeeName = async (empId: string): Promise<string> => {
  try {
    const response = await axios.get(`/user/name/${empId}`);
    return response.data.name || empId;
  } catch (error) {
    console.error(`Error fetching name for ID ${empId}:`, error);
    return empId; // Return ID as fallback
  }
};

// Cache for employee names to avoid repeated API calls
const nameCache = new Map<string, string>();

const getEmployeeName = async (empId: string): Promise<string> => {
  if (nameCache.has(empId)) {
    return nameCache.get(empId)!;
  }
  
  const name = await fetchEmployeeName(empId);
  nameCache.set(empId, name);
  return name;
};

// Component to display employee email with name
const EmployeeEmailDisplay = ({ 
  email, 
  empId, 
  showId = true 
}: { 
  email: string; 
  empId?: string; 
  showId?: boolean; 
}) => {
  const [employeeName, setEmployeeName] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (empId) {
      setLoading(true);
      getEmployeeName(empId)
        .then(name => {
          setEmployeeName(name);
        })
        .catch(error => {
          console.error("Error fetching employee name:", error);
          setEmployeeName(empId);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [empId]);

  if (loading) {
    return (
      <span>
        {email}
        {empId && showId && <span className="text-gray-500 ml-1">[{empId}]</span>}
        <span className="text-gray-400 ml-1">(Loading...)</span>
      </span>
    );
  }

  return (
    <span>
      {/* {email} */}
      {/* {empId && showId && <span className="text-gray-500 ml-1">[{empId}]</span>} */}
      {employeeName && employeeName !== empId && (
        <span className="text-gray-700 ml-1">{employeeName}</span>
      )}
    </span>
  );
}; 



export default function EmailsPage() {
  const router = useRouter();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    category: 'all'  // 'all', 'sent', 'received', 'failed'
  });

  const filteredEmails = emails
    .filter(email => {
      // Category filter (sent, received, failed, cc)
      if (filters.category !== 'all') {
        if (filters.category === 'sent' && email.senderId !== 'IT') return false;
        
        if (filters.category === 'received') {
          // For received filter, ensure the user is a direct recipient (not CC) and not the sender
          if (email.senderId === 'IT') return false;
          if (email.cc?.includes('IT') || email.ccIds?.includes('IT')) return false;
          if (!email.recipientIds?.includes('IT')) return false;
        }

        if (filters.category === 'cc') {
          // Check both cc and ccIds arrays for CC filter
          const isInCC = email.cc?.includes('IT') || email.ccIds?.includes('IT');
          if (!isInCC) return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.sentAt || 0).getTime();
      const dateB = new Date(b.sentAt || 0).getTime();
      return dateB - dateA; // Sort in descending order (most recent first)
    });

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/mail");
        setEmails(response.data.emails || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching emails:", err);
        setError("Failed to load emails. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Inbox</h1>
        <button
          onClick={() => router.push("/admin/IT/emails/compose")}
          className="flex items-center gap-2 bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Compose
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading emails...</span>
        </div>
      ) : (
        <>
          

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <FilterX size={20} className="text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              </div>
              {filters.category !== 'all' && (
                <button
                  onClick={() => setFilters(prev => ({ ...prev, category: 'all' }))}
                  className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                >
                  Clear Filter
                </button>
              )}
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div 
                  onClick={() => setFilters(prev => ({ ...prev, category: 'all' }))}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    filters.category === 'all' 
                      ? 'bg-blue-50 border-blue-200 border-2' 
                      : 'border border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${filters.category === 'all' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <Mail size={20} className={filters.category === 'all' ? 'text-blue-600' : 'text-gray-500'} />
                  </div>
                  <div>
                    <p className={`font-medium ${filters.category === 'all' ? 'text-blue-600' : 'text-gray-700'}`}>All</p>
                    <p className="text-sm text-gray-500">{emails.length} emails</p>
                  </div>
                </div>

                <div 
                  onClick={() => setFilters(prev => ({ ...prev, category: 'sent' }))}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    filters.category === 'sent' 
                      ? 'bg-green-50 border-green-200 border-2' 
                      : 'border border-gray-200 hover:border-green-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${filters.category === 'sent' ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Send size={20} className={filters.category === 'sent' ? 'text-green-600' : 'text-gray-500'} />
                  </div>
                  <div>
                    <p className={`font-medium ${filters.category === 'sent' ? 'text-green-600' : 'text-gray-700'}`}>Sent</p>
                    <p className="text-sm text-gray-500">
                      {emails.filter(e => e.senderId === 'IT').length} emails
                    </p>
                  </div>
                </div>

                <div 
                  onClick={() => setFilters(prev => ({ ...prev, category: 'received' }))}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    filters.category === 'received' 
                      ? 'bg-blue-50 border-blue-200 border-2' 
                      : 'border border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${filters.category === 'received' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <Inbox size={20} className={filters.category === 'received' ? 'text-blue-600' : 'text-gray-500'} />
                  </div>
                  <div>
                    <p className={`font-medium ${filters.category === 'received' ? 'text-blue-600' : 'text-gray-700'}`}>Received</p>
                    <p className="text-sm text-gray-500">
                      {emails.filter(e => 
                        e.senderId !== 'IT' && 
                        !e.cc?.includes('IT') && 
                        !e.ccIds?.includes('IT') && 
                        e.recipientIds?.includes('IT')
                      ).length} emails
                    </p>
                  </div>
                </div>

                <div 
                  onClick={() => setFilters(prev => ({ ...prev, category: 'cc' }))}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    filters.category === 'cc' 
                      ? 'bg-yellow-50 border-yellow-200 border-2' 
                      : 'border border-gray-200 hover:border-yellow-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${filters.category === 'cc' ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                    <Users size={20} className={filters.category === 'cc' ? 'text-yellow-600' : 'text-gray-500'} />
                  </div>
                  <div>
                    <p className={`font-medium ${filters.category === 'cc' ? 'text-yellow-600' : 'text-gray-700'}`}>CC&apos;d</p>
                    <p className="text-sm text-gray-500">
                      {emails.filter(e => e.cc?.includes('IT') || e.ccIds?.includes('IT')).length} emails
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Email List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Emails</h2>
            {filteredEmails.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Mail size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No emails found</p>
              </div>
            ) : (
              filteredEmails.map((email) => (
                <div
                  key={email._id}
                  onClick={() => router.push(`/admin/IT/emails/${email._id}`)}
                  className={`p-4 rounded-lg border transition hover:shadow-sm cursor-pointer ${
                    email.isRead ? "bg-gray-50 border-gray-200" : "bg-white border-red-200"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 flex-1">
                      <p className="font-semibold text-gray-900">{email.subject}</p>
                      
                      {/* Show sender information */}
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">From: </span>
                        <EmployeeEmailDisplay 
                          email={email.sender || ""} 
                          empId={email.senderId} 
                        />
                      </div>
                      
                      {/* Show multiple recipients if available */}
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">To: </span>
                        {email.recipients && email.recipients.length > 1 ? (
                          <span>
                            {email.recipients.slice(0, 2).map((recipient, index) => {
                              const recipientIndex = email.recipients?.indexOf(recipient) ?? -1;
                              const recipientId = recipientIndex >= 0 ? email.recipientIds?.[recipientIndex] : undefined;
                              return (
                                <span key={recipient}>
                                  {index > 0 && ", "}
                                  <EmployeeEmailDisplay 
                                    email={recipient} 
                                    empId={recipientId} 
                                  />
                                </span>
                              );
                            })}
                            {email.recipients.length > 2 && (
                              <span className="text-red-600 font-medium">
                                {" "}+{email.recipients.length - 2} more
                              </span>
                            )}
                          </span>
                        ) : (
                          <EmployeeEmailDisplay 
                            email={email.recipient || email.recipients?.[0] || ""} 
                            empId={email.recipientId || email.recipientIds?.[0]} 
                          />
                        )}
                      </div>

                      {/* Show CC if available */}
                      {email.cc && email.cc.length > 0 && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">CC: </span>
                          {email.cc.length > 2 ? (
                            <span>
                              {email.cc.slice(0, 2).map((ccRecipient, index) => {
                                const ccIndex = email.cc?.indexOf(ccRecipient) ?? -1;
                                const ccId = ccIndex >= 0 ? email.ccIds?.[ccIndex] : undefined;
                                return (
                                  <span key={ccRecipient}>
                                    {index > 0 && ", "}
                                    <EmployeeEmailDisplay 
                                      email={ccRecipient} 
                                      empId={ccId} 
                                    />
                                  </span>
                                );
                              })}
                              <span className="text-red-600 font-medium">
                                {" "}+{email.cc.length - 2} more
                              </span>
                            </span>
                          ) : (
                            <span>
                              {email.cc.map((ccRecipient, index) => {
                                const ccIndex = email.cc?.indexOf(ccRecipient) ?? -1;
                                const ccId = ccIndex >= 0 ? email.ccIds?.[ccIndex] : undefined;
                                return (
                                  <span key={ccRecipient}>
                                    {index > 0 && ", "}
                                    <EmployeeEmailDisplay 
                                      email={ccRecipient} 
                                      empId={ccId} 
                                    />
                                  </span>
                                );
                              })}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{new Date(email.sentAt || "").toLocaleString()}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          email.status === "sent" 
                            ? "bg-green-100 text-green-700" 
                            : email.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {email.status?.toUpperCase()}
                        </span>
                        {email.type && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {email.type.replace(/_/g, " ").toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {email.isStarred && <Star className="text-yellow-500 fill-current" size={18} />}
                      {(email.recipients && email.recipients.length > 1) || (email.cc && email.cc.length > 0) ? (
                        <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                          <Mail size={12} />
                          <span>Multi</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
