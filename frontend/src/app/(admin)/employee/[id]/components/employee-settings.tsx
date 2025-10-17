"use client"

import { useState } from "react"
import { Settings, Bell, Palette, Clock, Save } from "lucide-react"
import type { EmployeeSettings as EmployeeSettingsType, NotificationSettings } from "../../types/employees";

interface EmployeeSettingsProps {
  settings: EmployeeSettingsType
  onSettingsUpdate: (settings: EmployeeSettingsType) => void
}

export function EmployeeSettings({ settings, onSettingsUpdate }: EmployeeSettingsProps) {
  const [localSettings, setLocalSettings] = useState<EmployeeSettingsType>(settings)
  const [hasChanges, setHasChanges] = useState(false)

  const handleSettingChange = (key: keyof EmployeeSettingsType, value: string | boolean | number) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
    setHasChanges(true)
  }

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    setLocalSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }))
    setHasChanges(true)
  }

  const handleSaveSettings = () => {
    onSettingsUpdate(localSettings)
    setHasChanges(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Employee Settings</h2>
        {hasChanges && (
          <button
            onClick={handleSaveSettings}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Save Changes</span>
          </button>
        )}
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="w-6 h-6 text-blue-500 mr-2" />
          General Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <select
              value={localSettings.theme}
              onChange={(e) => handleSettingChange("theme", e.target.value as "light" | "dark")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="light">Light Theme</option>
              <option value="dark">Dark Theme</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={localSettings.language}
              onChange={(e) => handleSettingChange("language", e.target.value as "en" | "es" | "fr")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              value={localSettings.timezone}
              onChange={(e) => handleSettingChange("timezone", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="UTC-8">Pacific Time (UTC-8)</option>
              <option value="UTC-5">Eastern Time (UTC-5)</option>
              <option value="UTC+0">GMT (UTC+0)</option>
              <option value="UTC+5:30">India Standard Time (UTC+5:30)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Bell className="w-6 h-6 text-blue-500 mr-2" />
          Notification Settings
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-600">Receive email notifications for important updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.notifications.emailNotifications}
                onChange={(e) => handleNotificationChange("emailNotifications", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Task Reminders</h4>
              <p className="text-sm text-gray-600">Get reminders for upcoming task deadlines</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.notifications.taskReminders}
                onChange={(e) => handleNotificationChange("taskReminders", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Overtime Alerts</h4>
              <p className="text-sm text-gray-600">Receive alerts when approaching overtime hours</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.notifications.overtimeAlerts}
                onChange={(e) => handleNotificationChange("overtimeAlerts", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Performance Updates</h4>
              <p className="text-sm text-gray-600">Get notified about performance reviews and updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.notifications.performanceUpdates}
                onChange={(e) => handleNotificationChange("performanceUpdates", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Display Preferences */}
      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Palette className="w-6 h-6 text-blue-500 mr-2" />
          Display Preferences
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Dashboard Layout</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="radio" name="layout" value="compact" className="mr-2" />
                <span className="text-sm text-gray-700">Compact View</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="layout" value="detailed" className="mr-2" defaultChecked />
                <span className="text-sm text-gray-700">Detailed View</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="layout" value="minimal" className="mr-2" />
                <span className="text-sm text-gray-700">Minimal View</span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Color Scheme</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="w-full h-12 bg-blue-500 rounded-lg cursor-pointer border-2 border-blue-600"></div>
              <div className="w-full h-12 bg-green-500 rounded-lg cursor-pointer border-2 border-transparent hover:border-green-600"></div>
              <div className="w-full h-12 bg-purple-500 rounded-lg cursor-pointer border-2 border-transparent hover:border-purple-600"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-6 h-6 text-blue-500 mr-2" />
          Privacy & Security
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Activity Tracking</h4>
              <p className="text-sm text-gray-600">Allow system to track work activity for analytics</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Data Sharing</h4>
              <p className="text-sm text-gray-600">Share performance data with team leads</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Save Changes Button */}
      {hasChanges && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">Unsaved Changes</h4>
              <p className="text-sm text-blue-700">You have unsaved changes to your settings</p>
            </div>
            <button
              onClick={handleSaveSettings}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Now</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
