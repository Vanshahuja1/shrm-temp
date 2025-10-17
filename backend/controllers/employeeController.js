const User = require("../models/userModel");
const Task = require("../models/taskModel");
const TaskResponse = require("../models/taskResponseModel");
const Attendance = require("../models/attendanceModel");
const Overtime = require("../models/overtimeModel");
const Performance = require("../models/performanceModel");
const EmployeeSettings = require("../models/employeeSettingsModel");

// Get employee basic info
const getEmployeeInfo = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await User.findOne({ id, isActive: true }).select(
      "-password"
    );
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    console.log(employee.documents)

    // Transform data to match frontend interface
    const employeeInfo = {
      id: employee.id,
      employeeId: employee.id,
      name: employee.name,
      email: employee.email || "",
      phone: employee.phone || "",
      role: employee.role,
      designation: employee.role,
      department: employee.departmentName,
      manager: employee.upperManager,
      joinDate: employee.joiningDate
        ? employee.joiningDate.toISOString().split("T")[0]
        : "",
      personalInfo: {
        dateOfBirth: employee.dateOfBirth
          ? employee.dateOfBirth.toISOString().split("T")[0]
          : "",
        identityDocuments: Object.entries(employee.documents || {}).map(
          ([key, url], index) => ({
            id: index + 1,
            type: key,  // e.g., 'aadharFront', 'panCard'
            number:
              key.toLowerCase().includes("aadhar")
                ? employee.adharCard || ""
                : key.toLowerCase().includes("pan")
                ? employee.panCard || ""
                : "",
            uploadDate: employee.joiningDate
              ? employee.joiningDate.toISOString().split("T")[0]
              : "", // or use another date if available
            status: url ? "verified" : "pending",
            fileUrl: url,  // optional: add url to access file
          })
        ),
      },
      bankDetails: {
        accountNumber: employee.bankDetails?.accountNumber || "",
        bankName: employee.bankDetails?.bankName || "Bank Name",
        ifsc: employee.bankDetails?.ifsc || "",
        branch: employee.bankDetails?.branch || "",
      },
      salary: {
        basic: employee.salary * 0.7, // Assuming 70% is basic
        allowances: employee.salary * 0.3, // 30% allowances
        total: employee.salary,
        lastAppraisal: employee.lastAppraisal
          ? employee.lastAppraisal.toISOString().split("T")[0]
          : "2024-01-15", // fallback
      },
    };
    

    res.json(employeeInfo);
  } catch (error) {
    console.error("Get employee info error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get employee tasks
const getEmployeeTasks = async (req, res) => {
  try {
    const { id } = req.params;

    const tasks = await Task.find({ "assignedTo.id": id }).sort({
      createdAt: -1,
    });

    const tasksWithResponses = await Promise.all(
      tasks.map(async (task) => {
        const response = await TaskResponse.findOne({
          taskId: task._id,
          employeeId: id,
        });

        return {
          id: task._id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate,
          dueTime: task.dueTime || "17:00",
          assignedBy: task.assignedBy?.name || "Manager",
          assignedTo: task.assignedTo || { id, name: "Unknown" },
          createdAt: task.createdAt.toISOString(),
          weightage: task.weightage || 5,
          responses: response
            ? [
                {
                  id: response._id,
                  response: response.response,
                  format: response.format,
                  documents:
                    response.documents?.map((doc) => doc.originalName) || [],
                  timestamp: response.submittedAt.toISOString(),
                  status: response.status,
                  employee: task.assignedTo?.name || "Unknown",
                  rating: response.rating,
                },
              ]
            : [],
        };
      })
    );

    res.json(tasksWithResponses);
  } catch (error) {
    console.error("Get employee tasks error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// Submit task response
const submitTaskResponse = async (req, res) => {
  try {
    const { id, taskId } = req.params;
    const { response, format, documents } = req.body;

    // Create a new response
    const taskResponse = new TaskResponse({
      taskId,
      employeeId: id,
      response,
      format,
      documents: documents || [],
      status: "submitted",
      submittedAt: new Date(),
    });

    await taskResponse.save();

    // Update task status
    await Task.findByIdAndUpdate(taskId, {
      status: "in-progress",
    });

    res.status(201).json({
      id: taskResponse._id,
      taskId: taskResponse.taskId,
      employeeId: taskResponse.employeeId,
      response: taskResponse.response,
      format: taskResponse.format,
      documents: taskResponse.documents,
      submittedAt: taskResponse.submittedAt.toISOString(),
      status: taskResponse.status,
    });
  } catch (error) {
    console.error("Submit task response error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getEmployeeInfo,
  getEmployeeTasks,
  submitTaskResponse,
};