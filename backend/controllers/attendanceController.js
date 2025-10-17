const Attendance = require("../models/attendanceModel");
const User = require("../models/userModel");

// Get attendance records
const getAttendanceRecords = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const query = { employeeId: id };

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const today = new Date().toISOString().split("T")[0];
      const startDateDefault = thirtyDaysAgo.toISOString().split("T")[0];

      query.date = { $gte: startDateDefault, $lte: today };
    }

    // Fetch user name
    const user = await User.findOne({ id }).select("name");
    const employeeName = user ? user.name : "";

    const records = await Attendance.find(query).sort({ date: -1 });

    const attendanceRecords = records.map((record) => ({
      date: record.date,
      punchIn: record.punchIn
        ? record.punchIn.toTimeString().slice(0, 5)
        : null,
      punchOut: record.punchOut
        ? record.punchOut.toTimeString().slice(0, 5)
        : null,
      totalHours: record.totalHours,
      status: record.status,
      employee: id,
      name: employeeName,
    }));

    // Check if currently punched in
    const today = new Date().toISOString().split("T")[0];
    const todayRecord = await Attendance.findOne({
      employeeId: id,
      date: today,
    });

    res.json({
      records: attendanceRecords,
      isPunchedIn: todayRecord?.isActive || false,
      workStartTime: todayRecord?.punchIn
        ? todayRecord.punchIn.toTimeString().slice(0, 5)
        : null,
      totalWorkHours: todayRecord?.totalHours || 0,
      breakTime: todayRecord?.breakTime || 0,
      overtimeHours: todayRecord?.overtimeHours || 0,
    });
  } catch (error) {
    console.error("Get attendance records error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Punch in
const punchIn = async (req, res) => {
  try {
    const { id } = req.params;
    const { timestamp } = req.body;

    const today = new Date().toISOString().split("T")[0];
    const punchInTime = new Date(timestamp);

    // Check if already punched in today
    let attendance = await Attendance.findOne({ employeeId: id, date: today });

    if (attendance && attendance.isActive) {
      return res.status(400).json({ error: "Already punched in today" });
    }

    if (attendance) {
      // Update existing record
      attendance.punchIn = punchInTime;
      attendance.isActive = true;
      attendance.status = "present";
    } else {
      // Create new record
      attendance = new Attendance({
        employeeId: id,
        date: today,
        punchIn: punchInTime,
        isActive: true,
        status: "present",
      });
    }

    await attendance.save();

    res.status(201).json({
      id: attendance._id,
      employeeId: attendance.employeeId,
      punchIn: attendance.punchIn.toISOString(),
      date: attendance.date,
    });
  } catch (error) {
    console.error("Punch in error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Punch out
const punchOut = async (req, res) => {
  try {
    const { id } = req.params;
    const { timestamp } = req.body;

    const today = new Date().toISOString().split("T")[0];
    const punchOutTime = new Date(timestamp);

    const attendance = await Attendance.findOne({
      employeeId: id,
      date: today,
    });

    if (!attendance || !attendance.isActive) {
      return res.status(400).json({ error: "Not punched in today" });
    }

    attendance.punchOut = punchOutTime;
    attendance.isActive = false;
    attendance.calculateHours();

    await attendance.save();

    res.json({
      employeeId: attendance.employeeId,
      punchOut: attendance.punchOut.toISOString(),
      totalHours: attendance.totalHours,
    });
  } catch (error) {
    console.error("Punch out error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Handle breaks
const handleBreak = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, action } = req.body; // action: 'start' or 'end'

    const today = new Date().toISOString().split("T")[0];
    const attendance = await Attendance.findOne({
      employeeId: id,
      date: today,
    });

    if (!attendance || !attendance.isActive) {
      return res.status(400).json({ error: "Not punched in today" });
    }

    const now = new Date();

    if (action === "start") {
      // Start break
      attendance.breaks.push({
        type,
        startTime: now,
      });
    } else if (action === "end") {
      // End break
      const activeBreak = attendance.breaks.find(
        (b) => b.type === type && !b.endTime
      );

      if (activeBreak) {
        activeBreak.endTime = now;
        activeBreak.duration = Math.round(
          (now - activeBreak.startTime) / (1000 * 60)
        ); // minutes

        // Update total break time
        attendance.breakTime = attendance.breaks.reduce(
          (total, b) => total + (b.duration || 0),
          0
        );
      }
    }

    await attendance.save();

    res.json({
      id: Date.now(),
      employeeId: id,
      type,
      action,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Handle break error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get today's breaks
const getTodayBreaks = async (req, res) => {
  try {
    const { id } = req.params;
    const today = new Date().toISOString().split("T")[0];

    const attendance = await Attendance.findOne({
      employeeId: id,
      date: today,
    });

    res.json(attendance?.breaks || []);
  } catch (error) {
    console.error("Get today breaks error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getStats = async (req, res) => {
  try {
    const { id } = req.params;
    const today = new Date().toISOString().split("T")[0];
    const attendance = await Attendance.findOne({
      employeeId: id,
      date: today,
    });

    const isPunchedIn = attendance ? attendance.isActive : false;
    console.log("isPunchedIn:", isPunchedIn);
    res.json({ isPunchedIn, attendanceRecord: attendance });
  } catch (error) {
    console.error("Check if punched in error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getTodaysAttendance = async (req, res) => {
  try {
    const { hrId } = req.params;
    const today = new Date().toISOString().split("T")[0];

    // Find HR's organization
    const hr = await User.findOne({ id: hrId });
    if (!hr) {
      return res.status(404).json({ error: "HR not found" });
    }

    const organization = hr.organizationId;
    console.log("HR's organization:", organization);

    // Find employees in the same organization
    const employees = await User.find({
      organizationId: organization,
      role: { $in: ["employee", "hr", "manager", "intern"] },
    });
    console.log("Employees in organization:", employees);

    console.log("Employees in organization:", employees);

    // Fetch attendance records for today
    const attendanceRecords = await Promise.all(
      employees.map(async (emp) => {
        const attendance = await Attendance.findOne({
          employeeId: emp.id,
          date: today,
        });

        return {
          employeeInfo: emp.employeeInfo, // Using virtual field
          attendance: attendance
            ? {
                date: attendance.date,
                punchIn: attendance.punchIn
                  ? attendance.punchIn.toTimeString().slice(0, 5)
                  : null,
                punchOut: attendance.punchOut
                  ? attendance.punchOut.toTimeString().slice(0, 5)
                  : null,
                totalHours: attendance.totalHours,
                status: attendance.status,
              }
            : null,
        };
      })
    );

    res.json({
      attendanceRecords,
    });
  } catch (error) {
    console.error("Get today's attendance error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAttendanceByEmpId = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch all attendance records for the employee
    const attendanceRecords = await Attendance.find({ employeeId: id }).sort({
      date: -1,
    });

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(404).json({ error: "No attendance records found" });
    }

    // Fetch employee information
    const employee = await User.findOne({ id });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json({
      employeeInfo: employee.employeeInfo, // Using virtual field
      attendanceRecords: attendanceRecords.map((record) => ({
        date: record.date,
        punchIn: record.punchIn
          ? record.punchIn.toTimeString().slice(0, 5)
          : null,
        punchOut: record.punchOut
          ? record.punchOut.toTimeString().slice(0, 5)
          : null,
        totalHours: record.totalHours,
        status: record.status,
        breakTime: record.breakTime,
      })),
    });
  } catch (error) {
    console.error("Get attendance by employee ID error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAttendanceRecords,
  punchIn,
  punchOut,
  handleBreak,
  getTodayBreaks,
  getTodaysAttendance,
  getAttendanceByEmpId,
  getStats,
};
