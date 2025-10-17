"use client"

import { useEffect, useState } from "react"
import { Send } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import axios from "@/lib/axiosInstance"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

type Email = {
  _id?: number;
  type?: "member_crud" | "increment" | "decrement" | "penalty" | "general";
  recipient?: string;
  sender?: string;
  subject?: string;
  message?: string;
  sentAt?: string;
  status?: "sent" | "pending" | "failed" | "draft";
  isRead?: boolean;
  isStarred?: boolean;
  attachments?: string[];
  recipientEmail?: string; // Optional for "other" recipient
};



export default function ComposeEmailPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<Email>({
    type: "general",
    recipient: "",
    sender: "",
    subject: "",
    message: "",
    recipientEmail: "",
  })

  const [errors, setErrors] = useState({
    sender: "",
    recipient: "",
    subject: "",
    message: "",
    recipientEmail: "",
  })

  const { id } = useParams()
  const [loading, setLoading] = useState(false)

  const [members, setMembers] = useState<{ id: string; email: string, name: string }[]>([])

  const fetchMembers = async () => {
    try {
      const response = await axios.get("/IT/org-members/empInfo")
      setMembers(response.data)
    } catch (error) {
      console.error("Error fetching members:", error)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axios.get(`/IT/org-members/${id}`)
        setFormData(prev => ({
          ...prev,
          sender: response.data.contactInfo.email || "",
        }))
      }
      catch (error) {
        console.error("Error fetching employee data:", error)
      }
    }
    fetchEmployee()
  }, [id])


  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      sender: "",
      recipient: "",
      subject: "",
      message: "",
      recipientEmail: "",
    };

    // Validate sender
    if (!formData?.sender?.trim()) {
      newErrors.sender = "Sender email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.sender)) {
      newErrors.sender = "Please enter a valid email address";
      isValid = false;
    }

    // Validate recipient
    if (!formData.recipient) {
      newErrors.recipient = "Please select a recipient";
      isValid = false;
    } else {
      // Check if user is trying to send email to themselves
      const recipientEmail = formData.recipient === "other" ? formData.recipientEmail : formData.recipient;
      if (recipientEmail === formData.sender) {
        newErrors.recipient = "You cannot send an email to yourself";
        isValid = false;
      }
    }

    // Validate recipient email if "other" is selected
    if (formData.recipient === "other" && !formData.recipientEmail?.trim()) {
      newErrors.recipientEmail = "Recipient email is required";
      isValid = false;
    } else if (formData.recipient === "other" && !/\S+@\S+\.\S+/.test(formData.recipientEmail || "")) {
      newErrors.recipientEmail = "Please enter a valid email address";
      isValid = false;
    } else if (formData.recipient === "other" && formData.recipientEmail === formData.sender) {
      newErrors.recipientEmail = "You cannot send an email to yourself";
      isValid = false;
    }

    // Validate subject
    if (!formData?.subject?.trim()) {
      newErrors.subject = "Subject is required";
      isValid = false;
    }

    // Validate message
    if (!formData?.message?.trim()) {
      newErrors.message = "Message is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const recipient =
      formData.recipient === "other"
        ? formData.recipientEmail
        : formData.recipient;

    // Find the selected member to get their ID
    let recipientId = "";
    if (formData.recipient !== "other") {
      const selectedMember = members.find(member => member.email === formData.recipient);
      recipientId = selectedMember?.id || "";
    }


    axios.post("/mail/send", {
      type: formData.type,
      to: recipient,
      from: formData.sender,
      senderId: id, // Assuming admin is sending the email
      recipientId: recipientId,
      subject: formData.subject,
      text: formData.message,
    })
      .then(() => {
        router.push(`/employee/${id}/emails`)
      })
      .catch((error) => {
        console.error("Error sending email:", error)
      })
      .finally(() => {
        setLoading(false) // Stop loading
      })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Inbox
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Compose Email</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
              <input
                type="email"
                value={formData.sender || ''}
                onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.sender ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.sender && (
                <p className="mt-1 text-sm text-red-500">{errors.sender}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Select
                  value={formData.recipient}
                  onValueChange={(value) => setFormData({ ...formData, recipient: value })}
                >
                  <SelectTrigger className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.recipient ? 'border-red-500' : 'border-gray-300'
                  }`}>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {members
                      .filter(member => member.email !== formData.sender)
                      .map((member) => (
                      <SelectItem key={member.id} value={member.email || member.id}>
                        {member.name ? (
                          <>
                            {member.name} ({member.email}){" "}
                            <span className="text-gray-500">[{member.id}]</span>
                          </>
                        ) : (
                          <>
                            {member.email || member.id} <span className="text-gray-500">[{member.id}]</span>
                          </>
                        )}
                      </SelectItem>
                    ))}
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {formData.recipient === "other" && (
                  <input
                    type="email"
                    placeholder="Enter recipient email"
                    value={formData.recipientEmail || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, recipientEmail: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.recipientEmail ? 'border-red-500' : 'border-gray-300'
                    }`}
                    autoComplete="off"
                  />
                )}
              </div>
              {errors.recipient && (
                <p className="text-sm text-red-500">{errors.recipient}</p>
              )}
              {errors.recipientEmail && formData.recipient === "other" && (
                <p className="text-sm text-red-500">{errors.recipientEmail}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              value={formData.subject || ''}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.subject ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.subject && (
              <p className="mt-1 text-sm text-red-500">{errors.subject}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              value={formData.message || ''}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={10}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.message ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-500">{errors.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              disabled={loading} // Disable while loading
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send Email
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/IT/emails")}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
              disabled={loading} // Optionally disable cancel while loading
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
