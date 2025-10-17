const User = require("../models/userModel");

// Get all members with Info format
exports.getMembers = async (req, res) => {
  try {
    // Get orgName from params (with mergeParams) or from custom middleware
    const orgName = req.params.orgName || req.orgName;
    console.log("Searching for members with organizationName:", orgName);

    // Try multiple search strategies:
    // 1. First try by organizationName field (legacy)
    // 2. Then try by finding organization by name and using its ID
    let members = await User.find({
      organizationName: new RegExp(`^${orgName}$`, "i"),
    });

    // If no members found, try to find by organization ID
    if (members.length === 0) {
      const Organization = require("../models/organizationModel");
      const org = await Organization.findOne({
        name: new RegExp(`^${orgName}$`, "i"),
      });

      if (org) {
        console.log("Found organization by name:", org.name, "ID:", org._id);
        members = await User.find({ organizationId: org._id });
      }
    }

    // If still no members, try broader search (for debugging)
    if (members.length === 0) {
      console.log(
        "No members found with specific criteria, showing all members for debugging:"
      );
      const allMembers = await User.find({});
      console.log(
        "All users in database:",
        allMembers.map((m) => ({
          name: m.name,
          organizationName: m.organizationName,
          organizationId: m.organizationId,
        }))
      );
    }

    console.log("Found members count:", members.length);

    // Use employeeInfo virtual instead of non-existing Info
    const formattedMembers = members
      .filter((member) => member && member.employeeInfo) // Filter out any null members
      .map((member) => member.employeeInfo);

    res.status(200).json(formattedMembers);
  } catch (error) {
    console.error("Error in getMembers:", error);
    res.status(500).json({ message: "Error fetching members" });
  }
};

// Get all members in raw format (if needed)
exports.getMembersRaw = async (req, res) => {
  try {
    const orgName = req.params.orgName || req.orgName;
    const members = await User.find({
      organizationName: new RegExp(`^${orgName}$`, "i"),
    });
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ message: "Error fetching members" });
  }
};

exports.getEmpInfo = async (req, res) => {
  try {
    const orgName = req.params.orgName || req.orgName;
    const { role } = req.query;
    console.log("getEmpInfo - Received orgName:", orgName, "Role:", role);

   

    // Try multiple search strategies like in getMembers
    let members = await User.find({
      organizationName: new RegExp(`^${orgName}$`, "i"),
      ...(role ? { role: new RegExp(`^${role}$`, "i") } : {}),
    });

    // If no members found, try to find by organization ID
    if (members.length === 0) {
      const Organization = require("../models/organizationModel");
      const org = await Organization.findOne({
        name: new RegExp(`^${orgName}$`, "i"),
      });

      if (org) {
        console.log(
          "getEmpInfo - Found organization by name:",
          org.name,
          "ID:",
          org._id
        );
        members = await User.find({
          organizationId: org._id,
          ...(role ? { role: new RegExp(`^${role}$`, "i") } : {}),
        });
      }
    }

    console.log("getEmpInfo - Found members count:", members.length);
    const empInfo = members.map((member) => member.employeeInfo);

    res.status(200).json(empInfo);
  } catch (error) {
    console.error("Error in getEmpInfo:", error);
    res.status(500).json({ message: "Error fetching employee information" });
  }
};

exports.createMember = async (req, res) => {
  try {
    if (!req.body.role) {
      return res
        .status(400)
        .json({ message: "Role is required to generate ID" });
    }

    const memberData = {
      name: req.body.name,
      role: req.body.role,
      departmentName: req.body.department,
      organizationName: req.orgName || req.params.orgName,
      salary: req.body.salary || 0,
      projects: Array.isArray(req.body.projects) ? req.body.projects : [],
      upperManager: req.body.upperManager || "",
      upperManagerName: req.body.upperManagerName || "",
      experience: req.body.experience || "0",
      email: req.body.contactInfo?.email,
      phone: req.body.contactInfo?.phone,
      address: req.body.contactInfo?.address,
      panCard: req.body.documents?.pan,
      adharCard: req.body.documents?.aadhar,
      joiningDate: req.body.joiningDate,
      taskCountPerDay: req.body.performanceMetrics?.tasksPerDay || 0,
      attendanceCount30Days: req.body.performanceMetrics?.attendanceScore || 0,
      performance: req.body.performanceMetrics?.combinedPercentage || 0,
      isActive: req.body.attendance?.todayPresent ?? true,
      id: await User.getNextId(req.body.role),
    };

    const newMember = new User(memberData);
    await newMember.save();

    // Manager logic
    if (req.body.role.toLowerCase() === "manager") {
      const employees = Array.isArray(req.body.employees)
        ? req.body.employees
        : [];
      const interns = Array.isArray(req.body.interns) ? req.body.interns : [];
      const extractId = (item) =>
        typeof item === "object" && item !== null ? item.id : item;
      const allMemberIds = [...employees, ...interns]
        .map(extractId)
        .filter(Boolean);

      if (allMemberIds.length > 0) {
        await User.updateMany(
          { id: { $in: allMemberIds } },
          { $set: { upperManager: newMember.id } }
        );
      }
    }

    res.status(201).json(newMember.Info);
  } catch (error) {
    console.error("Error creating member:", error);
    res
      .status(500)
      .json({ message: "Error creating member", error: error.message });
  }
};
exports.getMemberById = async (req, res) => {
  try {
    const member = await User.findOne({ id: req.params.id });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const result = member.OrgMemberInfo;

    // Attach employees/interns if role is manager
    if (member.role.toLowerCase() === "manager") {
      const subordinates = await User.find(
        { upperManager: member.id },
        { id: 1, name: 1, role: 1 }
      );

      result.employees = subordinates
        .filter((m) => m.role.toLowerCase() === "employee")
        .map((m) => ({
          id: m.id,
          name: m.name,
        }));

      result.interns = subordinates
        .filter((m) => m.role.toLowerCase() === "intern")
        .map((m) => ({
          id: m.id,
          name: m.name,
        }));
    }

    // Attach upperManager name if exists
    if (member.upperManager) {
      const upperManager = await User.findOne(
        { id: member.upperManager },
        { name: 1 }
      );
      if (upperManager) {
        result.upperManagerName = upperManager.name;
      }
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in getMemberById:", error);
    return res
      .status(500)
      .json({ message: "Error fetching member", error: error.message });
  }
};

// Get member by ID in raw format (if needed for editing)
exports.getMemberByIdRaw = async (req, res) => {
  try {
    const member = await User.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    res.status(200).json(member);
  } catch (error) {
    res.status(500).json({ message: "Error fetching member" });
  }
};

exports.createMember = async (req, res) => {
  try {
    // Transform the input data to match the User model schema
    const memberData = {
      name: req.body.name,
      role: req.body.role,
      departmentName: req.body.department,
      organizationName: req.orgName || req.params.orgName,
      salary: req.body.salary,
      projects: req.body.projects,
      upperManager: req.body.upperManager,
      experience: req.body.experience,
      email: req.body.contactInfo?.email,
      phone: req.body.contactInfo?.phone,
      address: req.body.contactInfo?.address,
      panCard: req.body.documents?.pan,
      adharCard: req.body.documents?.aadhar,
      joiningDate: req.body.joiningDate,
      taskCountPerDay: req.body.performanceMetrics?.tasksPerDay,
      attendanceCount30Days: req.body.performanceMetrics?.attendanceScore,
      performance: req.body.performanceMetrics?.combinedPercentage,
      isActive: req.body.attendance?.todayPresent,
      // Auto-generate ID based on role
      id: await User.getNextId(req.body.role),
    };

    if (req.body.role && req.body.role.toLowerCase() === "manager") {
      memberData.employees = Array.isArray(req.body.employees)
        ? req.body.employees.map((e) => ({
            id: String(e.id),
            upperManager: memberData.name,
          }))
        : [];

      memberData.interns = Array.isArray(req.body.interns)
        ? req.body.interns.map((i) => ({
            id: String(i.id),
            upperManager: memberData.name,
          }))
        : [];
    }
    const newMember = new User(memberData);
    await newMember.save();

    // If the new member is a manager, update upperManager for selected employees/interns
    if (req.body.role && req.body.role.toLowerCase() === "manager") {
      const employees = Array.isArray(req.body.employees)
        ? req.body.employees
        : [];
      const interns = Array.isArray(req.body.interns) ? req.body.interns : [];
      // Accept both array of objects or array of IDs
      const extractId = (item) =>
        typeof item === "object" && item !== null ? item.id : item;
      const allMemberIds = [...employees, ...interns]
        .map(extractId)
        .filter(Boolean);
      if (allMemberIds.length > 0) {
        await User.updateMany(
          { id: { $in: allMemberIds } },
          { $set: { upperManager: newMember.id } }
        );
      }
    }
    res.status(201).json(newMember.Info);
  } catch (error) {
    console.error("Error creating member:", error);
    res
      .status(500)
      .json({ message: "Error creating member", error: error.message });
  }
};

exports.updateMember = async (req, res) => {
  try {
    const memberId = req.params.id;
    console.log("Updating member with ID:", memberId);
    console.log("Request Body:", JSON.stringify(req.body, null, 2));

    const updateData = {};

    // Basic info
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.role) updateData.role = req.body.role;
    if (req.body.department) updateData.departmentName = req.body.department;
    if (req.body.salary !== undefined) updateData.salary = Number(req.body.salary);
    if (req.body.projects) updateData.projects = req.body.projects;
    if (req.body.experience !== undefined) updateData.experience = Number(req.body.experience);
    if (req.body.joiningDate) updateData.joiningDate = new Date(req.body.joiningDate);

    console.log("Basic update data:", updateData);

    // Contact info
    if (req.body.contactInfo?.email)
      updateData.email = req.body.contactInfo.email;
    if (req.body.contactInfo?.phone)
      updateData.phone = req.body.contactInfo.phone;
    if (req.body.contactInfo?.address)
      updateData.currentAddress = req.body.contactInfo.address; // Map to currentAddress field

    // Documents
    if (req.body.documents?.pan) updateData.panCard = req.body.documents.pan;
    if (req.body.documents?.aadhar)
      updateData.adharCard = req.body.documents.aadhar;

    // Performance metrics
    if (req.body.performanceMetrics?.tasksPerDay !== undefined)
      updateData.taskCountPerDay = Number(req.body.performanceMetrics.tasksPerDay);
    if (req.body.performanceMetrics?.attendanceScore !== undefined)
      updateData.attendanceCount30Days = Number(req.body.performanceMetrics.attendanceScore);
    if (req.body.performanceMetrics?.combinedPercentage !== undefined)
      updateData.performance = Number(req.body.performanceMetrics.combinedPercentage);

    console.log("Performance metrics update data:", {
      taskCountPerDay: updateData.taskCountPerDay,
      attendanceCount30Days: updateData.attendanceCount30Days,
      performance: updateData.performance
    });

    // Attendance toggle
    if (typeof req.body.attendance?.todayPresent !== "undefined")
      updateData.isActive = req.body.attendance.todayPresent;

    // Direct upperManager override (optional)
    if (req.body.upperManager) updateData.upperManager = req.body.upperManager;
    if (req.body.upperManagerName)
      updateData.upperManagerName = req.body.upperManagerName;

    console.log("Final updateData being applied:", JSON.stringify(updateData, null, 2));

    // 🔄 Update the member itself
    const updatedMember = await User.findOneAndUpdate(
      { id: memberId },
      updateData,
      { new: true }
    );

    if (!updatedMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    console.log("Member updated successfully:", {
      id: updatedMember.id,
      name: updatedMember.name,
      salary: updatedMember.salary,
      experience: updatedMember.experience,
      email: updatedMember.email,
      phone: updatedMember.phone,
      currentAddress: updatedMember.currentAddress
    });

    // 🧠 If the member is (or becomes) a manager, update their subordinates
    const isManager =
      (updateData.role && updateData.role.toLowerCase() === "manager") ||
      (updatedMember.role && updatedMember.role.toLowerCase() === "manager");

    if (isManager) {
      const employees = Array.isArray(req.body.employees)
        ? req.body.employees
        : [];
      const interns = Array.isArray(req.body.interns) ? req.body.interns : [];

      const extractId = (x) => (typeof x === "object" && x !== null ? x.id : x);
      const allMemberIds = [...employees, ...interns]
        .map(extractId)
        .filter(Boolean);

      console.log("New subordinates to assign:", allMemberIds);

      // Set upperManager = updatedManager.id for selected members
      if (allMemberIds.length > 0) {
        const result = await User.updateMany(
          { id: { $in: allMemberIds } },
          { $set: { upperManager: updatedMember.id } }
        );
        console.log("Subordinates updated:", result.modifiedCount);
      }

      // 🧼 Remove previous members not in the new list
      const prevMembers = await User.find(
        {
          upperManager: updatedMember.id,
          role: { $in: ["employee", "intern"] },
        },
        { id: 1 }
      );
      const prevIds = prevMembers.map((m) => m.id);
      const removedIds = prevIds.filter((id) => !allMemberIds.includes(id));

      if (removedIds.length > 0) {
        const removedResult = await User.updateMany(
          { id: { $in: removedIds } },
          { $set: { upperManager: "" } }
        );
        console.log("Subordinates removed:", removedResult.modifiedCount);
      }
    }

    res.status(200).json(updatedMember.OrgMemberInfo);
  } catch (error) {
    console.error("Error updating member:", error);
    res.status(500).json({
      message: "Error updating member",
      error: error.message,
    });
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const deletedMember = await User.findOneAndDelete({ id: req.params.id });
    if (!deletedMember) {
      return res.status(404).json({ message: "Member not found" });
    }
    res.status(200).json({ message: "Member deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting member" });
  }
};

// Get members by department with Info format
exports.getMembersByDepartment = async (req, res) => {
  try {
    const orgName = req.params.orgName || req.orgName;
    const members = await User.find({
      organizationName: new RegExp(`^${orgName}$`, "i"),
      departmentName: new RegExp(`^${req.params.department}$`, "i"),
    });

    const formattedMembers = members.map((member) => member.Info);
    res.status(200).json(formattedMembers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching department members" });
  }
};

// Get members by role with Info format
exports.getMembersByRole = async (req, res) => {
  try {
    const orgName = req.params.orgName || req.orgName;

    const members = await User.find({
      organizationName: new RegExp(`^${orgName}$`, "i"),
      role: new RegExp(`^${req.params.role}$`, "i"),
    });

    const formattedMembers = members.map((member) => member.Info);
    res.status(200).json(formattedMembers);
  } catch (error) {
    console.error("Error in getMembersByRole:", error);
    res.status(500).json({ message: "Error fetching role members" });
  }
};
