"use client"

import { useState, useEffect } from "react"
import { Loader2, ChevronDown, ChevronRight } from "lucide-react"
import { fetchAllUsers, type User } from "../api"
import type { JSX } from "react/jsx-runtime"

interface HierarchicalUser extends User {
  level: number
  children: HierarchicalUser[]
  isExpanded?: boolean
}

export default function TableSection() {
  const [hierarchicalData, setHierarchicalData] = useState<HierarchicalUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadHierarchicalData = async () => {
      try {
        setLoading(true)
        const users = await fetchAllUsers()

        if (users.length === 0) {
          setError("No users found")
          return
        }

        const hierarchicalUsers = buildHierarchy(users)
        setHierarchicalData(hierarchicalUsers)

        // Expand all nodes by default
        const allIds = new Set<string>()
        const collectIds = (nodes: HierarchicalUser[]) => {
          nodes.forEach((node) => {
            allIds.add(node.id)
            collectIds(node.children)
          })
        }
        collectIds(hierarchicalUsers)
        setExpandedNodes(allIds)
      } catch (err) {
        setError("Failed to load organizational data")
        console.error("Error loading hierarchy:", err)
      } finally {
        setLoading(false)
      }
    }

    loadHierarchicalData()
  }, [])

  const buildHierarchy = (users: User[]): HierarchicalUser[] => {
    // Define role hierarchy levels
    const roleHierarchy: { [key: string]: number } = {
      admin: 0,
      head: 1,
      manager: 2,
      employee: 3,
      intern: 4,
      hr: 2, // Same level as manager
    }

    // Convert users to hierarchical format
    const hierarchicalUsers: HierarchicalUser[] = users.map((user) => ({
      ...user,
      level: roleHierarchy[user.role.toLowerCase()] || 5,
      children: [],
      isExpanded: true,
    }))

    // Sort by level first, then by name
    hierarchicalUsers.sort((a, b) => {
      if (a.level !== b.level) {
        return a.level - b.level
      }
      return a.name.localeCompare(b.name)
    })

    // Build parent-child relationships
    const userMap = new Map<string, HierarchicalUser>()
    hierarchicalUsers.forEach((user) => {
      userMap.set(user.id, user)
      userMap.set(user.name, user) // Also map by name for upperManager lookup
    })

    const rootNodes: HierarchicalUser[] = []

    hierarchicalUsers.forEach((user) => {
      if (user.upperManager && userMap.has(user.upperManager)) {
        const parent = userMap.get(user.upperManager)!
        parent.children.push(user)
      } else {
        rootNodes.push(user)
      }
    })

    // Sort children within each parent
    const sortChildren = (nodes: HierarchicalUser[]) => {
      nodes.forEach((node) => {
        node.children.sort((a, b) => {
          if (a.level !== b.level) {
            return a.level - b.level
          }
          return a.name.localeCompare(b.name)
        })
        sortChildren(node.children)
      })
    }

    sortChildren(rootNodes)
    return rootNodes
  }

  const toggleExpanded = (userId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId)
    } else {
      newExpanded.add(userId)
    }
    setExpandedNodes(newExpanded)
  }

  const renderHierarchicalRows = (users: HierarchicalUser[], depth = 0): JSX.Element[] => {
    const rows: JSX.Element[] = []

    users.forEach((user) => {
      const hasChildren = user.children.length > 0
      const isExpanded = expandedNodes.has(user.id)

      rows.push(
        <tr key={user.id} className="hover:bg-gray-50 border-l-4 border-l-transparent hover:border-l-blue-500">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center" style={{ paddingLeft: `${depth * 24}px` }}>
              {hasChildren && (
                <button onClick={() => toggleExpanded(user.id)} className="mr-2 p-1 hover:bg-gray-200 rounded">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              )}
              {!hasChildren && <div className="w-6 mr-2" />}

              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 ${getRoleColor(user.role)}`}
                >
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.id}</div>
                </div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getRoleBadgeColor(user.role)}`}
            >
              {user.role}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email || "N/A"}</td>
          <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.upperManager || "—"}</td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2 max-w-[100px]">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${user.performance || 0}%` }}></div>
              </div>
              <span className="text-sm text-gray-600 min-w-[40px]">{user.performance || 0}%</span>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {user.isActive ? "Active" : "Inactive"}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-gray-600">
            {hasChildren ? `${user.children.length} direct report${user.children.length !== 1 ? "s" : ""}` : "—"}
          </td>
        </tr>,
      )

      // Add children if expanded
      if (hasChildren && isExpanded) {
        rows.push(...renderHierarchicalRows(user.children, depth + 1))
      }
    })

    return rows
  }

  const getRoleColor = (role: string): string => {
    const colors: { [key: string]: string } = {
      admin: "bg-purple-600",
      head: "bg-blue-600",
      manager: "bg-red-500",
      employee: "bg-green-500",
      intern: "bg-orange-500",
      hr: "bg-indigo-500",
    }
    return colors[role.toLowerCase()] || "bg-gray-500"
  }

  const getRoleBadgeColor = (role: string): string => {
    const colors: { [key: string]: string } = {
      admin: "bg-purple-100 text-purple-800",
      head: "bg-blue-100 text-blue-800",
      manager: "bg-red-100 text-red-800",
      employee: "bg-green-100 text-green-800",
      intern: "bg-orange-100 text-orange-800",
      hr: "bg-indigo-100 text-indigo-800",
    }
    return colors[role.toLowerCase()] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Organizational Hierarchy</h3>
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading organizational hierarchy...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Organizational Hierarchy</h3>
        <div className="text-center text-red-600 py-8">
          <p className="font-semibold">Error Loading Data</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    )
  }

  if (hierarchicalData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Organizational Hierarchy</h3>
        <div className="text-center text-gray-500 py-8">No organizational data found</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">Organizational Hierarchy</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setExpandedNodes(new Set(hierarchicalData.flatMap(getAllIds)))}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Expand All
          </button>
          <button
            onClick={() => setExpandedNodes(new Set())}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Collapse All
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Name & ID</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Reports To</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Performance</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Direct Reports</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">{renderHierarchicalRows(hierarchicalData)}</tbody>
        </table>
      </div>
    </div>
  )
}

// Helper function to get all IDs for expand/collapse functionality
function getAllIds(user: HierarchicalUser): string[] {
  const ids = [user.id]
  user.children.forEach((child) => {
    ids.push(...getAllIds(child))
  })
  return ids
}
