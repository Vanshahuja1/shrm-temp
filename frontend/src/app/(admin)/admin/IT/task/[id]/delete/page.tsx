"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { sampleTasks } from "@/lib/sampleData"
import type { Task } from "../../../../types"

export default function DeleteTaskPage() {
  const { id } = useParams()
  const router = useRouter()
  const [task, setTask] = useState<Task | null>(null)

  useEffect(() => {
    const found = sampleTasks.find((t) => t._id === Number(id))
    if (!found) {
      router.push("/admin/IT/task")
    } else {
      setTask(found)
    }
  }, [id, router])

  const handleDelete = () => {
    console.log("Deleted Task ID:", task?._id)
    router.push("/admin/IT/task")
  }

  const handleCancel = () => {
    router.push(`/admin/IT/task/${task?._id}`)
  }

  if (!task) return null

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white border rounded-xl shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Delete Task</h1>
      <p className="text-gray-700 mb-6">
        Are you sure you want to delete the task <strong>{task.title}</strong> assigned to{" "}
        <strong>{task.assignedTo.name}</strong>?
      </p>

      <div className="flex justify-end gap-4">
        <button
          onClick={handleCancel}
          className="bg-gray-600 text-white px-5 py-2 rounded-lg hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
