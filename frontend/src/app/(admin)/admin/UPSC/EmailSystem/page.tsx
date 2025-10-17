"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Clock, AlertCircle, Send, Mail, MessageSquare } from "lucide-react";

// Email System Component
const EmailSystem = () => {
  const [notifications] = useState([
    {
      id: 1,
      type: "member-crud",
      recipient: "hr@oneaimupsc.com",
      subject: "New Employee Added - Action Required",
      message:
        "A new employee has been added to the system. Please review and complete onboarding process.",
      timestamp: "2024-03-15 10:30 AM",
      status: "sent",
    },
    {
      id: 2,
      type: "increment",
      recipient: "hr@oneaimupsc.com",
      subject: "Salary Increment Approved - Process Payment",
      message:
        "Salary increment for Dr. Anil Kumar has been approved. Please process the updated salary.",
      timestamp: "2024-03-14 02:15 PM",
      status: "sent",
    },
    {
      id: 3,
      type: "penalty",
      recipient: "hr@oneaimupsc.com",
      subject: "Disciplinary Action Required",
      message:
        "A penalty action has been initiated for an employee. Please review and take appropriate action.",
      timestamp: "2024-03-13 11:45 AM",
      status: "pending",
    },
  ]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "member-crud":
        return "bg-blue-100 text-blue-800";
      case "increment":
        return "bg-green-100 text-green-800";
      case "decrement":
        return "bg-orange-100 text-orange-800";
      case "penalty":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Email System</h1>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
          <Send size={20} />
          Send New Notification
        </button>
      </div>

      {/* Email Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="text-blue-600" size={24} />
            <span className="font-semibold text-gray-700">Total Sent</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {notifications.filter((n) => n.status === "sent").length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-yellow-600" size={24} />
            <span className="font-semibold text-gray-700">Pending</span>
          </div>
          <p className="text-3xl font-bold text-yellow-600">
            {notifications.filter((n) => n.status === "pending").length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="text-red-600" size={24} />
            <span className="font-semibold text-gray-700">Failed</span>
          </div>
          <p className="text-3xl font-bold text-red-600">
            {notifications.filter((n) => n.status === "failed").length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="text-green-600" size={24} />
            <span className="font-semibold text-gray-700">Total</span>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {notifications.length}
          </p>
        </div>
      </div>

      {/* HR Notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
          <div className="p-2 bg-red-100 rounded-lg">
            <Mail className="text-red-600" size={20} />
          </div>
          HR Notifications
        </h3>
        <p className="text-gray-600 mb-6">
          Automated email notifications sent to HR for various organizational
          actions:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Member CRUD</h4>
            <p className="text-sm text-blue-600">
              Add, update, or remove organization members
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">Increments</h4>
            <p className="text-sm text-green-600">
              Salary increment approvals and processing
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h4 className="font-semibold text-orange-800 mb-2">Decrements</h4>
            <p className="text-sm text-orange-600">
              Salary reduction notifications
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-800 mb-2">Penalty Actions</h4>
            <p className="text-sm text-red-600">
              Disciplinary actions and penalties
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              whileHover={{ y: -1, scale: 1.01 }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(notification.type)}`}
                    >
                      {notification.type.charAt(0).toUpperCase() +
                        notification.type.slice(1).replace("-", " ")}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(notification.status)}`}
                    >
                      {notification.status.charAt(0).toUpperCase() +
                        notification.status.slice(1)}
                    </span>
                  </div>
                  <h4 className="font-bold text-lg text-gray-900">
                    {notification.subject}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {notification.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  To:{" "}
                  <span className="font-semibold">
                    {notification.recipient}
                  </span>
                </span>
                <span>{notification.timestamp}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmailSystem;