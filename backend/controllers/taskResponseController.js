const Task = require("../models/taskModel");
const TaskResponse = require("../models/taskResponseModel");

const getAllTaskResponses = async (req, res) => {
  try {
    const managerId = req.params.id;
    if (!managerId) {
      return res.status(400).json({ error: "Manager ID is required" });
    }

    // Find all tasks assigned by this manager
    const tasks = await Task.find({
      "assignedBy.id": managerId,
    }).sort({ createdAt: -1 }); // Sort by newest first

    const tasksWithResponses = await Promise.all(
      tasks.map(async (task) => {
        // Get all responses for this task
        const responses = await TaskResponse.find({
          taskId: task._id,
        }).sort({ submittedAt: -1 }); // Sort by newest first

        return {
          _id: task._id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate,
          dueTime: task.dueTime || "17:00",
          assignedBy: task.assignedBy,
          assignedTo: task.assignedTo,
          createdAt: task.createdAt.toISOString(),
          weightage: task.weightage || 5,
          responses: responses.map((response) => ({
            _id: response._id,
            employeeId: response.employeeId,
            response: response.response,
            format: response.format,
            documents: response.documents || [],
            submittedAt: response.submittedAt.toISOString(),
            status: response.status,
            rating: response.rating,
            reviewedBy: response.reviewedBy,
            reviewedAt: response.reviewedAt?.toISOString(),
            reviewComments: response.reviewComments,
          })),
        };
      })
    );

    res.json(tasksWithResponses);
  } catch (error) {
    console.error("Get all task responses error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMyTaskResponses = async (req, res) => {
  try {
    const employeeId = req.params.id;
    if (!employeeId) {
      return res.status(400).json({ error: "Employee ID is required" });
    }

    // Find all tasks assigned to this employee
    const tasks = await Task.find({
      "assignedTo.id": employeeId,
    }).sort({ createdAt: -1 }); // Sort by newest first

    const tasksWithResponses = await Promise.all(
      tasks.map(async (task) => {
        // Get all responses for this task
        const responses = await TaskResponse.find({
          taskId: task._id,
          employeeId: employeeId,
        }).sort({ submittedAt: -1 }); // Sort by newest first
        return {
          _id: task._id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate,
          dueTime: task.dueTime || "17:00",
          assignedTo: task.assignedTo,
          responses: responses.map((response) => ({
            employeeId: response.employeeId,
            response: response.response,
            format: response.format,
            documents: response.documents || [],
            submittedAt: response.submittedAt.toISOString(),
            status: response.status,
            rating: response.rating,
            reviewedBy: response.reviewedBy,

            reviewedAt: response.reviewedAt?.toISOString(),

            reviewComments: response.reviewComments,
          })),
        };
      })
    );

    res.json(tasksWithResponses);
  } catch (error) {
    console.error("Get my task responses error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllTaskResponses,
  getMyTaskResponses
};