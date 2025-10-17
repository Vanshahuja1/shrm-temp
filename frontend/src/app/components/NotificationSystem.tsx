import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Bell, Mail, Star, Check, Clock } from "lucide-react";
import axios from "@/lib/axiosInstance";

interface Notification {
  _id: string;
  type: "general" | "increment" | "penalty" | "salary" | "member-crud" | "decrement";
  sender: string;
  recipient: string;
  subject: string;
  message: string;
  status: "sent" | "pending" | "failed";
  isRead: boolean;
  createdAt: string;
}

interface NotificationSystemProps {
  filterType?: Notification["type"];
  showHeader?: boolean;
  showStats?: boolean;
}

const getTypeColor = (type: Notification["type"]) => {
  switch (type) {
    case "general":
      return "bg-blue-100 text-blue-800";
    case "increment":
      return "bg-green-100 text-green-800";
    case "decrement":
      return "bg-orange-100 text-orange-800";
    case "penalty":
      return "bg-red-100 text-red-800";
    case "salary":
      return "bg-purple-100 text-purple-800";
    case "member-crud":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusColor = (status: Notification["status"]) => {
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

export default function NotificationSystem({ 
  filterType,
  showHeader = true,
  showStats = true 
}: NotificationSystemProps = {}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await axios.get("/notifications");
      let filteredNotifications = response.data.notifications;
      if (filterType) {
        filteredNotifications = filteredNotifications.filter((n: Notification) => n.type === filterType);
      }
      setNotifications(filteredNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await axios.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(notif => 
        notif._id === id ? { ...notif, isRead: true } : notif
      ));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Notifications
          </h1>
          <div className="flex gap-2">
            <span className="text-sm text-gray-600">
              {notifications.filter(n => !n.isRead).length} unread
            </span>
          </div>
        </div>
      )}

      {/* Stats */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
              </div>
              <Mail className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.filter(n => !n.isRead).length}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today&apos;s</p>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.filter(n => 
                    new Date(n.createdAt).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.map((notification) => (
          <motion.div
            key={notification._id}
            whileHover={{ y: -1, scale: 1.01 }}
            className={`border rounded-lg p-4 transition-all ${
              notification.isRead ? "bg-white" : "bg-blue-50 border-blue-200"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(notification.type)}`}>
                    {notification.type.charAt(0).toUpperCase() + notification.type.slice(1).replace("-", " ")}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(notification.status)}`}>
                    {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                  </span>
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="p-1 hover:bg-gray-100 rounded-full"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4 text-blue-600" />
                    </button>
                  )}
                </div>
                <h4 className="font-bold text-lg text-gray-900">{notification.subject}</h4>
                <p className="text-gray-600 text-sm">{notification.message}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                From: <span className="font-semibold">{notification.sender}</span>
              </span>
              <span>
                {new Date(notification.createdAt).toLocaleDateString()} at{" "}
                {new Date(notification.createdAt).toLocaleTimeString()}
              </span>
            </div>
          </motion.div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No notifications found
          </div>
        )}
      </div>
    </div>
  );
}
