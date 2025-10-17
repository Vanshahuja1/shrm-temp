"use client"

import { useEffect, useState } from "react"
import { Send } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import axios from "@/lib/axiosInstance"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

type EmailTemplate = {
    subject: string;
    message: string;
}

const emailTemplates: Record<NonNullable<Email["type"]>, EmailTemplate> = {
    general: {
        subject: "General Notice",
        message: `Dear [Employee Name],

I hope this email finds you well.

[Your message here]

Best regards,
HR Department`
    },
    increment: {
        subject: "Salary Increment Notification",
        message: `Dear [Employee Name],

We are pleased to inform you that your salary has been reviewed and an increment has been approved.

Details:
- Effective Date: [Date]
- Previous Salary: [Previous Amount]
- New Salary: [New Amount]
- Increment Amount: [Amount]
- Increment Percentage: [Percentage]%

This increment reflects our recognition of your valuable contributions and consistent performance.

Please note that all other terms and conditions of your employment remain unchanged.

If you have any questions, please feel free to contact the HR department.

Best regards,
HR Department`
    },
    decrement: {
        subject: "Salary Adjustment Notice",
        message: `Dear [Employee Name],

This letter serves as formal notification regarding an adjustment to your salary structure.

Details:
- Effective Date: [Date]
- Current Salary: [Current Amount]
- Adjusted Salary: [New Amount]
- Adjustment Amount: [Amount]

Reason for Adjustment:
[Specify reason]

If you would like to discuss this matter further, please schedule an appointment with HR.

Best regards,
HR Department`
    },
    penalty: {
        subject: "Notice of Disciplinary Action",
        message: `Dear [Employee Name],

This notice is to formally document a disciplinary action.

Incident Details:
- Date of Incident: [Date]
- Nature of Violation: [Specify violation]
- Policy Reference: [Policy number/name]

Penalty Details:
- Type of Action: [Warning/Monetary Penalty/Suspension]
- Penalty Amount (if applicable): [Amount]
- Duration (if applicable): [Duration]

Please schedule a meeting with HR within the next 48 hours to discuss this matter.

You have the right to appeal this decision within [X] days of receiving this notice.

Regards,
HR Department`
    },
    member_crud: {
        subject: "Staff Update Notification",
        message: `Dear Team,

This is to inform you of the following organizational update:

Employee Details:
- Name: [Employee Name]
- Department: [Department]
- Position: [Position]
- Type of Change: [New Joining/Promotion/Transfer/Exit]
- Effective Date: [Date]

Additional Information:
[Specific details about the change]

Please update your records accordingly.

Best regards,
HR Department`
    }
}

import { Email } from "../types" // Import from types file



export default function ComposeEmailPage() {
    const router = useRouter()
    const [formData, setFormData] = useState<Email>({
        type: "general",
        recipient: "",
        recipients: [],
        cc: [],
        sender: "",
        subject: emailTemplates.general.subject,
        message: emailTemplates.general.message,
        recipientEmail: "",
        recipientEmails: [],
        ccEmails: [],
    })
    const [loading, setLoading] = useState(false)
    const [selectedRecipients, setSelectedRecipients] = useState<{ id: string; email: string; name: string }[]>([])
    const [selectedCC, setSelectedCC] = useState<{ id: string; email: string; name: string }[]>([])
    const [customRecipient, setCustomRecipient] = useState("")
    const [customCC, setCustomCC] = useState("")

    const { hrId } = useParams()

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
    }, [hrId])

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const response = await axios.get(`/IT/org-members/${hrId}`)
                setFormData(prev => ({
                    ...prev,
                    sender: response.data.contactInfo.email || "",
                    senderName: response.data.name || "",
                    senderId: hrId as string,
                }))
            }
            catch (error) {
                console.error("Error fetching employee data:", error)
            }
        }
        fetchEmployee()
    }, [hrId])

    const addRecipient = (memberInfo: { id: string; email: string; name: string } | string) => {
        const email = typeof memberInfo === 'string' ? memberInfo : memberInfo.email;
        
        // Prevent adding sender's own email
        if (email === formData.sender) {
            alert("You cannot send an email to yourself");
            return;
        }
        
        if (typeof memberInfo === 'string') {
            // Handle custom email
            const customMember = { id: '', email: memberInfo, name: memberInfo };
            if (!selectedRecipients.some(r => r.email === memberInfo)) {
                const newRecipients = [...selectedRecipients, customMember];
                setSelectedRecipients(newRecipients);
                setFormData(prev => ({ ...prev, recipients: newRecipients.map(r => r.email) }));
            }
        } else {
            // Handle member from dropdown
            if (!selectedRecipients.some(r => r.email === memberInfo.email)) {
                const newRecipients = [...selectedRecipients, memberInfo];
                setSelectedRecipients(newRecipients);
                setFormData(prev => ({ ...prev, recipients: newRecipients.map(r => r.email) }));
            }
        }
    }

    const removeRecipient = (memberToRemove: { id: string; email: string; name: string }) => {
        const newRecipients = selectedRecipients.filter(r => r.email !== memberToRemove.email);
        setSelectedRecipients(newRecipients);
        setFormData(prev => ({ ...prev, recipients: newRecipients.map(r => r.email) }));
    }

    const addCC = (memberInfo: { id: string; email: string; name: string } | string) => {
        const email = typeof memberInfo === 'string' ? memberInfo : memberInfo.email;
        
        // Prevent adding sender's own email to CC
        if (email === formData.sender) {
            alert("You cannot add yourself to CC");
            return;
        }
        
        if (typeof memberInfo === 'string') {
            // Handle custom email
            const customMember = { id: '', email: memberInfo, name: memberInfo };
            if (!selectedCC.some(c => c.email === memberInfo)) {
                const newCC = [...selectedCC, customMember];
                setSelectedCC(newCC);
                setFormData(prev => ({ ...prev, cc: newCC.map(c => c.email) }));
            }
        } else {
            // Handle member from dropdown
            if (!selectedCC.some(c => c.email === memberInfo.email)) {
                const newCC = [...selectedCC, memberInfo];
                setSelectedCC(newCC);
                setFormData(prev => ({ ...prev, cc: newCC.map(c => c.email) }));
            }
        }
    }

    const removeCC = (memberToRemove: { id: string; email: string; name: string }) => {
        const newCC = selectedCC.filter(c => c.email !== memberToRemove.email);
        setSelectedCC(newCC);
        setFormData(prev => ({ ...prev, cc: newCC.map(c => c.email) }));
    }

    const addCustomRecipient = () => {
        if (customRecipient.trim()) {
            addRecipient(customRecipient.trim());
            setCustomRecipient("");
        }
    }

    const addCustomCC = () => {
        if (customCC.trim()) {
            addCC(customCC.trim());
            setCustomCC("");
        }
    }


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true) // Start loading

        // Validate that at least one recipient is selected
        if (selectedRecipients.length === 0) {
            alert("Please select at least one recipient");
            setLoading(false);
            return;
        }

        // Get recipient IDs for members
        const recipientIds: string[] = [];
        const ccIds: string[] = [];
        
        selectedRecipients.forEach(recipient => {
            if (recipient.id) {
                recipientIds.push(recipient.id);
            }
        });
        
        selectedCC.forEach(ccMember => {
            if (ccMember.id) {
                ccIds.push(ccMember.id);
            }
        });

        axios.post("/mail/send", {
            type: formData.type,
            to: selectedRecipients.map(r => r.email),
            cc: selectedCC.map(c => c.email),
            from: formData.sender,
            senderId: hrId, // HR ID as sender
            recipientId: recipientIds[0] || "", // Primary recipient ID for backward compatibility
            recipientIds: recipientIds,
            ccIds: ccIds,
            subject: formData.subject,
            text: formData.message,
        })
            .then(() => {
                router.push(`/hr/${hrId}/emails`)
            })
            .catch((error) => {
                console.error("Error sending email:", error)
                alert("Failed to send email. Please try again.");
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => {
                                    const newType = e.target.value as NonNullable<Email["type"]>;
                                    if (newType && newType in emailTemplates) {
                                        const template = emailTemplates[newType];
                                        setFormData(prev => ({
                                            ...prev,
                                            type: newType,
                                            subject: template.subject,
                                            message: template.message
                                        }));
                                    }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="general">General</option>
                                <option value="increment">Salary Increment</option>
                                <option value="decrement">Salary Decrement</option>
                                <option value="penalty">Penalty Notice</option>
                                <option value="member_crud">Member Changes</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                            <input
                                type="text"
                                value={formData.senderName && formData.senderId 
                                    ? `${formData.senderName} [${formData.senderId}]` 
                                    : formData.sender || "Loading..."
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                disabled
                            />
                        </div>
                    </div>
                    

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            To (Recipients) <span className="text-red-500">*</span>
                        </label>
                        
                        {/* Selected Recipients Display */}
                        {selectedRecipients.length > 0 && (
                            <div className="mb-2 flex flex-wrap gap-2">
                                {selectedRecipients.map((recipient) => (
                                    <span key={recipient.email} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
                                        {recipient.name || recipient.email}
                                        <button
                                            type="button"
                                            onClick={() => removeRecipient(recipient)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2 mb-2">
                            <Select
                                value=""
                                onValueChange={(value) => {
                                    if (value) {
                                        const selectedMember = members.find(m => m.email === value);
                                        if (selectedMember) {
                                            addRecipient(selectedMember);
                                        }
                                    }
                                }}
                            >
                                <SelectTrigger className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    <SelectValue placeholder="Select recipient from organization" />
                                </SelectTrigger>
                                <SelectContent>
                                    {members
                                        .filter(member => 
                                            !selectedRecipients.some(r => r.email === member.email) &&
                                            member.email !== formData.sender
                                        )
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
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Custom Recipient Input */}
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Enter custom email address"
                                value={customRecipient}
                                onChange={(e) => setCustomRecipient(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addCustomRecipient();
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={addCustomRecipient}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Add
                            </button>
                        </div>
                        
                        {selectedRecipients.length === 0 && (
                            <p className="text-sm text-red-500 mt-1">At least one recipient is required</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CC (Carbon Copy) <span className="text-gray-400 text-xs">(Optional)</span></label>
                        
                        {/* Selected CC Display */}
                        {selectedCC.length > 0 && (
                            <div className="mb-2 flex flex-wrap gap-2">
                                {selectedCC.map((ccMember) => (
                                    <span key={ccMember.email} className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm">
                                        {ccMember.name || ccMember.email}
                                        <button
                                            type="button"
                                            onClick={() => removeCC(ccMember)}
                                            className="text-gray-600 hover:text-gray-800"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2 mb-2">
                            <Select
                                value=""
                                onValueChange={(value) => {
                                    if (value) {
                                        const selectedMember = members.find(m => m.email === value);
                                        if (selectedMember) {
                                            addCC(selectedMember);
                                        }
                                    }
                                }}
                            >
                                <SelectTrigger className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    <SelectValue placeholder="Select CC from organization" />
                                </SelectTrigger>
                                <SelectContent>
                                    {members
                                        .filter(member => 
                                            !selectedCC.some(c => c.email === member.email) && 
                                            !selectedRecipients.some(r => r.email === member.email) &&
                                            member.email !== formData.sender
                                        )
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
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Custom CC Input */}
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Enter custom CC email address"
                                value={customCC}
                                onChange={(e) => setCustomCC(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addCustomCC();
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={addCustomCC}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                                Add CC
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                        <input
                            type="text"
                            value={formData.subject || ''}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                        <textarea
                            value={formData.message || ''}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            rows={10}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
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
                            onClick={() => router.push(`/hr/${hrId}/emails`)}
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
