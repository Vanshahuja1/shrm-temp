const Task = require("../models/taskModel")

const getAllTasks = async (req, res) => {
  const tasks = await Task.find()
  res.json(tasks)
}

const getTaskById = async (req, res) => {
  const task = await Task.findById(req.params.id)
  if (!task) return res.status(404).json({ error: "Task not found" })
  res.json(task)
}

const createTask = async (req, res) => {
  const newTask = new Task(req.body)
  await newTask.save()
  res.status(201).json(newTask)
}

const updateTask = async (req, res) => {
  const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!updatedTask) return res.status(404).json({ error: "Task not found" })
  res.json(updatedTask)
}

const deleteTask = async (req, res) => {
  const deleted = await Task.findByIdAndDelete(req.params.id)
  if (!deleted) return res.status(404).json({ error: "Task not found" })
  res.json({ message: "Task deleted" })
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
}
