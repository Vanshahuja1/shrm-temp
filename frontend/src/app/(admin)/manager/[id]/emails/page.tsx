// app/admin/IT/emails/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Mail, Send, Star, FilterX, Inbox, Users } from "lucide-react";
import axios from "@/lib/axiosInstance";
import { Email } from "./types"; 

export default function EmailsPage() {  
  const router = useRouter();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();

  const [filters, setFilters] = useState({
    category: 'all'  // 'all', 'sent', 'received', 'failed'
  });

  const filteredEmails = emails.filter(email => {
    if (filters.category !== 'all') {
      if (filters.category === 'sent' && email.senderId !== id) return false;
      
      if (filters.category === 'received') {
        // For received filter, ensure the user is a direct recipient (not CC) and not the sender
        if (email.senderId === id) return false;
        if (email.cc?.includes(String(id)) || email.ccIds?.includes(String(id))) return false;
        if (!email.recipientIds?.includes(String(id))) return false;
      }

      if (filters.category === 'cc') {
        // Check both cc and ccIds arrays
        const isInCC = email.cc?.includes(String(id)) || email.ccIds?.includes(String(id));
        if (!isInCC) return false;
      }
    }
    return true;
  }).sort((a, b) => {
    const dateA = new Date(a.sentAt || 0).getTime();
    const dateB = new Date(b.sentAt || 0).getTime();
    return dateB - dateA; // Sort in descending order (most recent first)
  });

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch emails with query parameters for both sent and received
        const [receivedResponse, sentResponse] = await Promise.all([
          axios.get<{ emails: Email[] }>('/mail', {
            params: {
              recipientId: id
            }
          }),
          axios.get<{ emails: Email[] }>('/mail', {
            params: {
              senderId: id
            }
          })
        ]);
        
        const receivedEmails: Email[] = receivedResponse.data?.emails || [];
        const sentEmails: Email[] = sentResponse.data?.emails || [];
        
        // Remove duplicates using email _id
        const emailMap = new Map<string, Email>();
        ;[...receivedEmails, ...sentEmails].forEach((email: Email) => {
          if (email._id) {
            emailMap.set(String(email._id), email);
          }
        });
        
        // Collect unique user IDs (senders and recipients)

        const allEmails = Array.from(emailMap.values());
        
        // Collect unique user IDs (senders and recipients)
        const userIds = Array.from(
          new Set(
            allEmails
              .map((e: Email) => [e.senderId, e.recipientId])
              .flat()
              .filter(Boolean)
          )
        );

        // Fetch user names in parallel
        const usersRes = await Promise.all(
          userIds.map(uid => axios.get<{ name: string }>(`/user/name/${uid}`))
        );
        
        const userIdToName: Record<string, string> = {};
        usersRes.forEach((res, idx) => {
          if (userIds[idx]) {
            userIdToName[userIds[idx]] = res.data?.name || "";
          }
        });

        // Add senderName and receiverName to each email
        const emailsWithNames = allEmails.map((email: Email) => ({
          ...email,
          senderName: email.senderId ? userIdToName[email.senderId] || "" : "",
          recipientName: email.recipientId ? userIdToName[email.recipientId] || "" : ""
        }));

        setEmails(emailsWithNames);
      } catch (err) {
        console.error("Error fetching emails:", err);
        setError("Failed to load emails. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchEmails();
    }
  }, [id]);

  const formatDate = (dateString: string | Date) => {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return date.toLocaleString();
    } catch  {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Email History</h1>
        <button
          onClick={() => router.push(`/manager/${id}/emails/compose`)}
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
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
                  className="text-sm text-gray-500 hover:text-red-600 transition-colors"
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
                      ? 'bg-red-50 border-red-200 border-2' 
                      : 'border border-gray-200 hover:border-red-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${filters.category === 'all' ? 'bg-red-100' : 'bg-gray-100'}`}>
                    <Mail size={20} className={filters.category === 'all' ? 'text-red-600' : 'text-gray-500'} />
                  </div>
                  <div>
                    <p className={`font-medium ${filters.category === 'all' ? 'text-red-600' : 'text-gray-700'}`}>All</p>
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
                      {emails.filter(e => e.senderId === id).length} emails
                    </p>
                  </div>
                </div>

                <div 
                  onClick={() => setFilters(prev => ({ ...prev, category: 'received' }))}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    filters.category === 'received' 
                      ? 'bg-red-50 border-red-200 border-2' 
                      : 'border border-gray-200 hover:border-red-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${filters.category === 'received' ? 'bg-red-100' : 'bg-gray-100'}`}>
                    <Inbox size={20} className={filters.category === 'received' ? 'text-red-600' : 'text-gray-500'} />
                  </div>
                  <div>
                    <p className={`font-medium ${filters.category === 'received' ? 'text-red-600' : 'text-gray-700'}`}>Received</p>
                    <p className="text-sm text-gray-500">
                      {emails.filter(e => 
                        e.senderId !== id && 
                        !e.cc?.includes(String(id)) && 
                        !e.ccIds?.includes(String(id)) && 
                        e.recipientIds?.includes(String(id))
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
                      {emails.filter(e => e.cc?.includes(String(id)) || e.ccIds?.includes(String(id))).length} emails
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
              filteredEmails.map((email: Email) => (
                <div
                  key={email._id}
                  onClick={() => router.push(`/manager/${id}/emails/${email._id}`)}
                  className={`p-4 rounded-lg border transition hover:shadow-sm cursor-pointer ${
                    email.isRead ? "bg-gray-50" : "bg-white"
                  } ${
                    email.senderId === id ? "border-green-500" : "border-red-500"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-900">{email.subject}</p>
                      <p className="text-sm text-gray-600">
                        {email.senderId === id 
                          ? `To: ${email.recipientName || email.recipient}` 
                          : `From: ${email.senderName || email.sender}`}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{email?.sentAt && formatDate(email.sentAt)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          email.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : email.senderId === id
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                        }`}>
                          {email.status === "failed" 
                            ? "FAILED"
                            : email.senderId === id ? "SENT" : "RECEIVED"}
                        </span>
                        {email.type && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            {email.type.replace(/_/g, " ").toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    {email.isStarred && <Star className="text-yellow-500 fill-current" size={18} />}
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