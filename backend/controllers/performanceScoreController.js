const PerformanceScore = require("../models/performanceScoreModel");
const User = require("../models/userModel");
const KRA = require("../models/kraModel");
const KPI = require("../models/kpiModel");

// Get all performance scores
const getAllPerformanceScores = async (req, res) => {
  try {
    const { year, quarter, status, category } = req.query;
    const filter = {};

    if (year) filter["evaluationPeriod.year"] = parseInt(year);
    if (quarter) filter["evaluationPeriod.quarter"] = quarter;
    if (status) filter.status = status;
    if (category) filter.category = category;

    const performanceScores = await PerformanceScore.find(filter)
      .populate({
        path: "employeeId",
        select: "name email department role",
        model: "User",
        localField: "employeeId",
        foreignField: "id",
        justOne: true
      })
      .populate("managerEvaluation.managerId", "name email")
      .sort({ "evaluationPeriod.year": -1, "evaluationPeriod.quarter": -1 });

    res.json({
      success: true,
      count: performanceScores.length,
      data: performanceScores,
    });
  } catch (error) {
    console.error("Get all performance scores error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch performance scores",
      details: error.message,
    });
  }
};

const getPerformanceScoreByManager = async (req, res) => {
  try {
    const { managerId } = req.params;
    const { year, quarter } = req.query;

    const filter = { "managerEvaluation.managerId": managerId };
    if (year) filter["evaluationPeriod.year"] = parseInt(year);
    if (quarter) filter["evaluationPeriod.quarter"] = quarter;

    const performanceScores = await PerformanceScore.find(filter)
      .populate({
        path: "employeeId",
        select: "name email department role",
        model: "User",
        localField: "employeeId",
        foreignField: "id",
        justOne: true,
      })
      .populate({
        path: "managerEvaluation.managerId",
        select: "name email",
        model: "User",
        localField: "managerEvaluation.managerId",
        foreignField: "id",
        justOne: true,
      })
      .sort({ "evaluationPeriod.year": -1, "evaluationPeriod.quarter": -1 });

    if (!performanceScores || performanceScores.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No performance scores found for this manager",
      });
    }

    res.json({
      success: true,
      count: performanceScores.length,
      data: performanceScores,
    });
  } catch (error) {
    console.error("Get performance score by manager error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch performance scores",
      details: error.message,
    });
  }
};

// Get performance score by employee ID
const getPerformanceScoreByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { year, quarter } = req.query;

    const filter = { employeeId };
    if (year) filter["evaluationPeriod.year"] = parseInt(year);
    if (quarter) filter["evaluationPeriod.quarter"] = quarter;

    const performanceScores = await PerformanceScore.find(filter)
      .populate({
        path: "employeeId",
        select: "name email department role",
        model: "User",
        localField: "employeeId",
        foreignField: "id",
        justOne: true
      })
      .populate("managerEvaluation.managerId", "name email")
      .sort({ "evaluationPeriod.year": -1, "evaluationPeriod.quarter": -1 });

    if (!performanceScores || performanceScores.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No performance scores found for this employee",
      });
    }

    res.json({
      success: true,
      count: performanceScores.length,
      data: performanceScores,
    });
  } catch (error) {
    console.error("Get performance score by employee error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch performance score",
      details: error.message,
    });
  }
};

// Get performance score by ID
const getPerformanceScoreById = async (req, res) => {
  try {
    const { id } = req.params;

    const performanceScore = await PerformanceScore.findById(id)
      .populate({
        path: "employeeId",
        select: "name email department role",
        model: "User",
        localField: "employeeId",
        foreignField: "id",
        justOne: true
      })
      .populate("managerEvaluation.managerId", "name email");

    if (!performanceScore) {
      return res.status(404).json({
        success: false,
        error: "Performance score not found",
      });
    }

    res.json({
      success: true,
      data: performanceScore,
    });
  } catch (error) {
    console.error("Get performance score by ID error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch performance score",
      details: error.message,
    });
  }
};

// Create performance score
const createPerformanceScore = async (req, res) => {
  try {
    const performanceScoreData = req.body;

    // Validate employee exists
    const employee = await User.findOne({
      id: performanceScoreData.employeeId,
    });
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    const performanceScore = new PerformanceScore(performanceScoreData);
    await performanceScore.save();

    await performanceScore.populate({
      path: "employeeId",
      select: "name email department role",
      model: "User",
      match: {}, // optional
      // If employeeId is a string referencing User.id, use:
      localField: "employeeId",
      foreignField: "id",
      justOne: true,
    });

    res.status(201).json({
      success: true,
      message: "Performance score created successfully",
      data: performanceScore,
    });
  } catch (error) {
    console.error("Create performance score error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error:
          "Performance score already exists for this employee in this period",
      });
    }

    res.status(400).json({
      success: false,
      error: "Failed to create performance score",
      details: error.message,
    });
  }
};

// Update performance score
const updatePerformanceScore = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const performanceScore = await PerformanceScore.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("employeeId", "name email department role")
      .populate("managerEvaluation.managerId", "name email");

    if (!performanceScore) {
      return res.status(404).json({
        success: false,
        error: "Performance score not found",
      });
    }

    res.json({
      success: true,
      message: "Performance score updated successfully",
      data: performanceScore,
    });
  } catch (error) {
    console.error("Update performance score error:", error);
    res.status(400).json({
      success: false,
      error: "Failed to update performance score",
      details: error.message,
    });
  }
};

// Add manager evaluation
const addManagerEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const { managerId, comments, rating } = req.body;

    const performanceScore = await PerformanceScore.findById(id);
    if (!performanceScore) {
      return res.status(404).json({
        success: false,
        error: "Performance score not found",
      });
    }

    performanceScore.managerEvaluation = {
      managerId,
      comments,
      rating,
      evaluatedAt: new Date(),
    };

    await performanceScore.save();
    await performanceScore.populate(
      "managerEvaluation.managerId",
      "name email"
    );

    res.json({
      success: true,
      message: "Manager evaluation added successfully",
      data: performanceScore,
    });
  } catch (error) {
    console.error("Add manager evaluation error:", error);
    res.status(400).json({
      success: false,
      error: "Failed to add manager evaluation",
      details: error.message,
    });
  }
};

// Add self assessment
const addSelfAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments, rating } = req.body;

    const performanceScore = await PerformanceScore.findById(id);
    if (!performanceScore) {
      return res.status(404).json({
        success: false,
        error: "Performance score not found",
      });
    }

    performanceScore.selfAssessment = {
      comments,
      rating,
      submittedAt: new Date(),
    };

    await performanceScore.save();

    res.json({
      success: true,
      message: "Self assessment added successfully",
      data: performanceScore,
    });
  } catch (error) {
    console.error("Add self assessment error:", error);
    res.status(400).json({
      success: false,
      error: "Failed to add self assessment",
      details: error.message,
    });
  }
};

// Calculate increment eligibility
const calculateIncrementEligibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyGrowth } = req.body;

    const performanceScore = await PerformanceScore.findById(id);
    if (!performanceScore) {
      return res.status(404).json({
        success: false,
        error: "Performance score not found",
      });
    }

    const incrementEligibility =
      performanceScore.calculateIncrementEligibility(companyGrowth);
    const incentiveEligibility = performanceScore.isEligibleForIncentive();

    res.json({
      success: true,
      data: {
        employeeId: performanceScore.employeeId,
        performanceScore: performanceScore.scores.totalScore,
        category: performanceScore.category,
        incrementEligibility,
        incentiveEligibility,
        companyGrowth,
      },
    });
  } catch (error) {
    console.error("Calculate increment eligibility error:", error);
    res.status(400).json({
      success: false,
      error: "Failed to calculate increment eligibility",
      details: error.message,
    });
  }
};

// Get performance analytics
const getPerformanceAnalytics = async (req, res) => {
  try {
    const { year, quarter } = req.query;
    const filter = {};

    if (year) filter["evaluationPeriod.year"] = parseInt(year);
    if (quarter) filter["evaluationPeriod.quarter"] = quarter;

    const performanceScores = await PerformanceScore.find(filter);

    // Calculate analytics
    const totalEmployees = performanceScores.length;
    const categoryDistribution = performanceScores.reduce((acc, score) => {
      acc[score.category] = (acc[score.category] || 0) + 1;
      return acc;
    }, {});

    const averageScore =
      totalEmployees > 0
        ? Math.round(
            performanceScores.reduce(
              (sum, score) => sum + score.scores.totalScore,
              0
            ) / totalEmployees
          )
        : 0;

    const topPerformers = performanceScores
      .filter((score) => score.category === "FEE" || score.category === "EE")
      .sort((a, b) => b.scores.totalScore - a.scores.totalScore)
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        totalEmployees,
        averageScore,
        categoryDistribution,
        topPerformers: topPerformers.map((p) => ({
          employeeId: p.employeeId,
          score: p.scores.totalScore,
          category: p.category,
        })),
      },
    });
  } catch (error) {
    console.error("Get performance analytics error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch performance analytics",
      details: error.message,
    });
  }
};

// Delete performance score
const deletePerformanceScore = async (req, res) => {
  try {
    const { id } = req.params;

    const performanceScore = await PerformanceScore.findByIdAndDelete(id);
    if (!performanceScore) {
      return res.status(404).json({
        success: false,
        error: "Performance score not found",
      });
    }

    res.json({
      success: true,
      message: "Performance score deleted successfully",
    });
  } catch (error) {
    console.error("Delete performance score error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete performance score",
      details: error.message,
    });
  }
};

module.exports = {
  getAllPerformanceScores,
  getPerformanceScoreByEmployee,
  getPerformanceScoreById,
  createPerformanceScore,
  updatePerformanceScore,
  addManagerEvaluation,
  addSelfAssessment,
  calculateIncrementEligibility,
  getPerformanceAnalytics,
  deletePerformanceScore,
  getPerformanceScoreByManager,
};
