const User = require("../models/userModel");
const Report = require("../models/reportModel");

// Utility Functions
const parseAndValidateDate = (dateString) => {
  if (!dateString) return null;

  // Try parsing standard date formats
  const date = new Date(dateString);
  if (date instanceof Date && !isNaN(date)) {
    return date;
  }

  // Try parsing DD-MM-YYYY format
  const [day, month, year] = dateString.split(/[-/]/);
  if (day && month && year) {
    const parsedDate = new Date(year, month - 1, day);
    if (parsedDate instanceof Date && !isNaN(parsedDate)) {
      return parsedDate;
    }
  }

  return null;
};

const validateDateField = (dateValue, fieldName) => {
  if (dateValue && !parseAndValidateDate(dateValue)) {
    return `Invalid ${fieldName} format. Please use YYYY-MM-DD format`;
  }
  return null;
};

const createErrorResponse = (res, statusCode, message, errors = null) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

const createSuccessResponse = (
  res,
  statusCode,
  data = null,
  message = null
) => {
  const response = { success: true };
  if (data) response.data = data;
  if (message) response.message = message;
  return res.status(statusCode).json(response);
};

// Data Mapping Functions
const mapPersonalInfo = (personalInfo, existingUser = null) => {
  if (!personalInfo) return {};

  const mapped = {};
  if (personalInfo.name) mapped.name = personalInfo.name;
  if (personalInfo.email) mapped.email = personalInfo.email;
  if (personalInfo.phone) mapped.phone = personalInfo.phone;
  if (personalInfo.gender) mapped.gender = personalInfo.gender;
  if (personalInfo.address) mapped.address = personalInfo.address;
  if (personalInfo.aadhar) mapped.adharCard = personalInfo.aadhar;
  if (personalInfo.pan) mapped.panCard = personalInfo.pan;
  if (personalInfo.emergencyContact)
    mapped.emergencyContact = personalInfo.emergencyContact;

  if (personalInfo.dob) {
    const dateOfBirth = parseAndValidateDate(personalInfo.dob);
    if (dateOfBirth) mapped.dateOfBirth = dateOfBirth;
  } else if (existingUser) {
    mapped.dateOfBirth = existingUser.dateOfBirth;
  }

  return mapped;
};

const mapDepartmentInfo = (departmentInfo, joiningDetails = null) => {
  if (!departmentInfo && !joiningDetails) return {};

  const mapped = {};

  if (departmentInfo) {
    if (departmentInfo.role) mapped.role = departmentInfo.role.toLowerCase();
    if (departmentInfo.departmentName) {
      mapped.organizationName = departmentInfo.departmentName;
      mapped.departmentName = departmentInfo.departmentName;
    }
    if (departmentInfo.managerName)
      mapped.upperManager = departmentInfo.managerName;
    if (departmentInfo.designation)
      mapped.designation = departmentInfo.designation;
  }

  if (joiningDetails?.joiningDate) {
    const joiningDate = parseAndValidateDate(joiningDetails.joiningDate);
    if (joiningDate) mapped.joiningDate = joiningDate;
  }

  return mapped;
};

const mapFinancialInfo = (financialInfo, existingBankDetails = null) => {
  if (!financialInfo) return {};

  const mapped = {};

  if (financialInfo.salary) {
    mapped.salary = Number(financialInfo.salary) || 0;
  }

  if (financialInfo.bankInfo) {
    const bankInfo = financialInfo.bankInfo;
    mapped.bankDetails = {
      accountHolder:
        bankInfo.accountHolderName || existingBankDetails?.accountHolder || "",
      accountNumber:
        bankInfo.accountNumber || existingBankDetails?.accountNumber || "",
      ifsc: bankInfo.ifscCode || existingBankDetails?.ifsc || "",
      branch: bankInfo.branch || existingBankDetails?.branch || "",
      accountType:
        bankInfo.accountType || existingBankDetails?.accountType || "SAVING",
    };
  }

  return mapped;
};

const mapPayrollInfo = (payrollInfo) => {
  if (!payrollInfo) return {};

  const mapped = {};
  if (payrollInfo.taxCode) mapped.taxCode = payrollInfo.taxCode;
  if (payrollInfo.benefits) mapped.benefits = payrollInfo.benefits;

  return mapped;
};

const mapDocuments = (documents) => {
  if (!documents) return [];

  const documentArray = [];
  const documentMappings = [
    { key: "aadharFront", title: "Aadhar Card (Front)", type: "other" },
    { key: "aadharBack", title: "Aadhar Card (Back)", type: "other" },
    { key: "panCard", title: "PAN Card", type: "other" },
    { key: "resume", title: "Resume", type: "experience" },
  ];

  documentMappings.forEach(({ key, title, type }) => {
    if (documents[key]) {
      documentArray.push({ title, url: documents[key], type });
    }
  });

  return documentArray;
};

const mapTaskInfo = (taskInfo) => {
  if (!taskInfo) return [];

  return [
    {
      name: taskInfo.taskName,
      assignedOn: parseAndValidateDate(taskInfo.assignedOn),
      assignedBy: taskInfo.assignedBy,
    },
  ];
};

// Validation Functions
const validateEmployeeData = (body) => {
  const errors = [];

  // Validate required fields
  if (!body.personalInfo?.name) {
    errors.push("Name is required");
  }

  if (!body.personalInfo?.email) {
    errors.push("Email is required");
  }

  if (!body.departmentInfo?.role) {
    errors.push("Role is required");
  }

  // Validate date formats
  const dobError = validateDateField(body.personalInfo?.dob, "date of birth");
  if (dobError) errors.push(dobError);

  const joiningDateError = validateDateField(
    body.joiningDetails?.joiningDate,
    "joining date"
  );
  if (joiningDateError) errors.push(joiningDateError);

  const taskDateError = validateDateField(
    body.taskInfo?.assignedOn,
    "task assigned date"
  );
  if (taskDateError) errors.push(taskDateError);

  return errors;
};

// Profile Management
const getProfile = async (req, res) => {
  try {
    if (!req.user?._id) {
      return createErrorResponse(res, 401, "Authentication required");
    }

    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return createErrorResponse(res, 404, "User not found");
    }

    return createSuccessResponse(res, 200, user);
  } catch (error) {
    console.error("Get profile error:", error);
    return createErrorResponse(res, 500, "Internal server error");
  }
};

const updateProfile = async (req, res) => {
  try {
    if (!req.user?._id) {
      return createErrorResponse(res, 401, "Authentication required");
    }

    const allowedUpdates = [
      "name",
      "dateOfBirth",
      "address",
      "joiningDate",
      "photo",
      "upperManager",
      "salary",
      "adharCard",
      "panCard",
      "experience",
      "organizationName",
      "departmentName",
      "bankDetails",
      "documents",
    ];

    const updates = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        // Handle date fields specially
        if ((key === "dateOfBirth" || key === "joiningDate") && req.body[key]) {
          const parsedDate = parseAndValidateDate(req.body[key]);
          if (parsedDate) {
            updates[key] = parsedDate;
          }
        } else {
          updates[key] = req.body[key];
        }
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return createErrorResponse(res, 404, "User not found");
    }

    return createSuccessResponse(
      res,
      200,
      user,
      "Profile updated successfully"
    );
  } catch (error) {
    console.error("Update profile error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return createErrorResponse(res, 400, "Validation error", messages);
    }

    return createErrorResponse(res, 500, "Internal server error");
  }
};

// Employee Management
const addEmp = async (req, res) => {
  try {
    // Validate input data
    const validationErrors = validateEmployeeData(req.body);
    if (validationErrors.length > 0) {
      return createErrorResponse(
        res,
        400,
        "Validation error",
        validationErrors
      );
    }

    // Get the next unique ID for the role
    const nextId = await User.getNextId(req.body.departmentInfo.role);

    // Map all the data
    const personalInfo = mapPersonalInfo(req.body.personalInfo);
    const departmentInfo = mapDepartmentInfo(
      req.body.departmentInfo,
      req.body.joiningDetails
    );
    const financialInfo = mapFinancialInfo(req.body.financialInfo);
    const payrollInfo = mapPayrollInfo(req.body.payrollInfo);
    const documents = mapDocuments(req.body.documents);
    const tasks = mapTaskInfo(req.body.taskInfo);

    // Create the user object
    const userData = {
      // Basic Info
      id: req.body.joiningDetails?.employeeId || nextId,
      password: nextId, // Setting initial password same as ID

      // Personal Info
      ...personalInfo,

      // Department Info
      ...departmentInfo,

      // Financial Info
      ...financialInfo,

      // Payroll Info
      ...payrollInfo,

      // Work Info
      experience: "0", // Default value
      projects: [], // Default empty array
      isActive: true,

      // Documents and Tasks
      documents,
      tasks,
    };

    const user = new User(userData);
    await user.save();

    // Return success response with essential data
    const responseData = {
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
      organizationName: user.organizationName,
      departmentName: user.departmentName,
      dateOfBirth: user.dateOfBirth,
      joiningDate: user.joiningDate,
    };

    return createSuccessResponse(res, 201, responseData);
  } catch (err) {
    console.error("Add employee error:", err);

    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((error) => error.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    }

    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

const getById = async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id }).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // If manager, populate employees and interns arrays
    let userObj = user.toObject();
    if (userObj.role && userObj.role.toLowerCase() === "manager") {
      // Find employees and interns whose upperManager matches this manager's id or name
      const employees = await User.find({
        role: "employee",
        $or: [{ upperManager: userObj.id }, { upperManager: userObj.name }],
      }).select("id name");
      const interns = await User.find({
        role: "intern",
        $or: [{ upperManager: userObj.id }, { upperManager: userObj.name }],
      }).select("id name");
      userObj.employees = employees.map((e) => ({
        id: String(e.id),
        name: e.name,
      }));
      userObj.interns = interns.map((i) => ({
        id: String(i.id),
        name: i.name,
      }));
    }

    res.json({ success: true, data: userObj });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { organizationId, departmentId, role } = req.query;

    // Build filter object
    const filter = {};
    if (organizationId) filter.organizationId = organizationId;
    if (departmentId) filter.departmentId = departmentId;
    if (role) filter.role = role.toLowerCase();

    const users = await User.find(filter).select("-password");
    if (!users || users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No users found" });
    }
    res.json({ success: true, data: users });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateEmp = async (req, res) => {
  try {
    console.log("Update request for ID:", req.params.id);
    console.log("Update payload:", req.body);
    
    const user = await User.findOne({ id: req.params.id });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    console.log("User found:", user.name);
    console.log("Documents before update:", user.documents);
    console.log("BankDetails before update:", user.bankDetails);

    const allowedFields = [
      "name",
      "role",
      "departmentName",
      "salary",
      "projects",
      "experience",
      "joiningDate",
      "taskCountPerDay",
      "attendanceCount30Days",
      "performance",
      "currentAddress", // Changed from "address" to match the model
      "adharCard",
      "panCard",
      "phone",
      "email",
      "upperManager",
      "dateOfBirth", // Added this field
      "emergencyContact", // Added this field
      "designation", // Added for job title
      "isActive", // Added for employment status
      "photo", // Added for profile picture
      "documents", // Added for document management
      "bankDetails" // Added for banking information
    ];

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        // Handle address field mapping
        if (key === "currentAddress" && req.body["address"] !== undefined) {
          user[key] = req.body["address"];
        } 
        // Handle nested objects like bankDetails and documents
        else if (key === "bankDetails" || key === "documents") {
          if (typeof req.body[key] === 'object' && req.body[key] !== null) {
            // Merge with existing data to avoid overwriting entire object
            user[key] = { ...user[key], ...req.body[key] };
          }
        } 
        else {
          user[key] = req.body[key];
        }
      }
    }

    // Also handle "address" field mapping to "currentAddress"
    if (req.body["address"] !== undefined) {
      user["currentAddress"] = req.body["address"];
    }

    if (Array.isArray(req.body.employees)) {
      user.employees = req.body.employees.map((emp) => ({
        id: String(emp.id),
        upperManager: emp.upperManager || user.name || "",
      }));
    }

    if (Array.isArray(req.body.interns)) {
      user.interns = req.body.interns.map((int) => ({
        id: String(int.id),
        upperManager: int.upperManager || user.name || "",
      }));
    }

    await user.save();

    console.log("Documents after update:", user.documents);
    console.log("BankDetails after update:", user.bankDetails);

    return res
      .status(200)
      .json({ success: true, message: "Member updated successfully" });
  } catch (error) {
    console.error("Error updating member:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating member",
      error: error.message,
    });
  }
};

const deleteEmp = async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    await User.findOneAndDelete({ id: req.params.id });
    return res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete employee error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const registerEmployee = async (req, res) => {
  try {
    const {
      name,
      role,
      dateOfBirth,
      address,
      joiningDate,
      photo,
      salary,
      adharCard,
      panCard,
      experience,
      organizationName,
      departmentName,
      bankDetails,
      documents, // This will now contain the structured document URLs
    } = req.body;

    // Validate required fields
    if (!name || !role || !organizationName || !departmentName) {
      return createErrorResponse(
        res,
        400,
        "Name, role, organization name, and department name are required"
      );
    }

    // Generate unique employee ID
    const employeeId = await User.getNextId(role);

    // Create new user with all provided fields
    const userData = {
      id: employeeId,
      name,
      password: employeeId, // Initial password same as ID
      role: role.toLowerCase(),
      organizationName,
      departmentName,
      isActive: true,
    };

    // Add optional fields if provided with date validation
    if (dateOfBirth) {
      const parsedDOB = parseAndValidateDate(dateOfBirth);
      if (!parsedDOB) {
        return createErrorResponse(res, 400, "Invalid date of birth format");
      }
      userData.dateOfBirth = parsedDOB;
    }

    if (joiningDate) {
      const parsedJoiningDate = parseAndValidateDate(joiningDate);
      if (!parsedJoiningDate) {
        return createErrorResponse(res, 400, "Invalid joining date format");
      }
      userData.joiningDate = parsedJoiningDate;
    }

    // Add other optional fields
    if (address) userData.address = address;
    if (photo) userData.photo = photo;
    if (upperManager) userData.upperManager = upperManager;
    if (salary) userData.salary = Number(salary);
    if (adharCard) userData.adharCard = adharCard;
    if (panCard) userData.panCard = panCard;
    if (experience) userData.experience = String(experience);
    // Add optional fields if provided
    if (dateOfBirth) userData.dateOfBirth = new Date(dateOfBirth);
    if (address) userData.address = address;
    if (joiningDate) userData.joiningDate = new Date(joiningDate);
    if (photo) userData.photo = photo;
    if (upperManager) userData.upperManager = upperManager;
    if (salary) userData.salary = Number(salary);
    if (adharCard) userData.adharCard = adharCard;
    if (panCard) userData.panCard = panCard;
    if (experience) userData.experience = Number(experience);

    // Handle bank details
    if (bankDetails) {
      userData.bankDetails = {
        accountHolder: bankDetails.accountHolder || "",
        accountNumber: bankDetails.accountNumber || "",
        ifsc: bankDetails.ifsc || "",
        branch: bankDetails.branch || "",
        accountType: bankDetails.accountType || "SAVING",
      };
    }

    // Handle documents
    if (documents) {
      const documentArray = [];
      if (req.body.documents.aadharFront) {
        documentArray.push({
          title: "Aadhar Card (Front)",
          url: documents.aadharFront,
          type: "other",
        });
      }

      if (documents.aadharBack) {
        documentArray.push({
          title: "Aadhar Card (Back)",
          url: documents.aadharBack,
          type: "other",
        });
      }

      if (documents.panCard) {
        documentArray.push({
          title: "PAN Card",
          url: documents.panCard,
          type: "other",
        });
      }

      if (documents.resume) {
        documentArray.push({
          title: "Resume",
          url: documents.resume,
          type: "experience",
        });
      }

      userData.documents = documentArray;
    }

    const user = await User.create(userData);

    res.status(201).json({
      success: true,
      message: "Employee registered successfully",
      data: {
        id: user.id,
        name: user.name,
        role: user.role,
        organizationName: user.organizationName,
        departmentName: user.departmentName,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res
        .status(400)
        .json({ success: false, message: messages.join(", ") });
    }
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Employee ID already exists" });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getNameById = async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.empId }).select("name");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, name: user.name });
  } catch (error) {
    console.error("Get name by ID error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  registerEmployee,
  getAllUsers,
  getById,
  addEmp,
  deleteEmp,
  updateEmp,
  getNameById,
};
