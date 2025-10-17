"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

export interface NotificationProps {
  type: "success" | "error";
  message: string;
  duration?: number;
  onClose: () => void;
}

export function Notification({ type, message, duration = 5000, onClose }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div
        className={`flex items-center p-4 rounded-lg shadow-lg border ${
          type === "success"
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800"
        }`}
      >
        {type === "success" ? (
          <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
        ) : (
          <XCircle className="w-5 h-5 mr-3 flex-shrink-0" />
        )}
        <span className="text-sm font-medium mr-4">{message}</span>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded-full hover:bg-black/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function useNotification() {
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  const NotificationComponent = notification ? (
    <Notification
      type={notification.type}
      message={notification.message}
      onClose={hideNotification}
    />
  ) : null;

  return {
    showNotification,
    hideNotification,
    NotificationComponent,
  };
}
