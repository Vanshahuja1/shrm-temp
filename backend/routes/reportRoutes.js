const express = require('express');
const router = express.Router();
const Report = require('../models/reportModel');
const User = require('../models/userModel');

// Get all employee reports
router.get('/employees', async (req, res) => {
    try {
        
       // 1. Find all user documents
        const users = await User.find({});
        // 2. Access the virtual property on each document by mapping over the results
        const employeeReports = users.map(user => user.reportRecords);
        res.status(200).json({
            success: true,
            data : employeeReports
        });
    } catch (error) {
        res.status(500).json({
            success: false,
        });
    }
});

// Get detailed report for a specific employee
router.get('/employee/:id', async (req, res) => {
    try {
        const report = await Report.getDetailedReport(req.params.id);
        if (!report) {
            return res.status(404).json({
                success: false,
                error: 'Report not found'
            });
        }

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create or update employee report
router.post('/employee/:id', async (req, res) => {
    try {
        const employee = await User.findOne({ id: req.params.id });
        if (!employee) {
            return res.status(404).json({
                success: false,
                error: 'Employee not found'
            });
        }

        const reportData = {
            id: employee.id,
            name: employee.name,
            designation: employee.designation,
            department: employee.departmentName,
            email: employee.email,
            ...req.body
        };

        const report = await Report.createOrUpdateReport(employee.id, reportData);
        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get reports by department
router.get('/department/:departmentName', async (req, res) => {
    try {
        const reports = await Report.getReportsByDepartment(req.params.departmentName);
        res.status(200).json({
            success: true,
            data: reports
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update performance metrics
router.patch('/employee/:id/performance', async (req, res) => {
    try {
        const { id } = req.params;
        
        const report = await Report.findOneAndUpdate(
            { id },
            { 
                $set: { 
                    'performance': req.body.performance 
                }
            },
            { new: true, runValidators: true }
        );

        if (!report) {
            return res.status(404).json({
                success: false,
                error: 'Report not found'
            });
        }

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Add recent activity
router.post('/employee/:id/activity', async (req, res) => {
    try {
        const { id } = req.params;
        const { type, description } = req.body;

        const report = await Report.findOneAndUpdate(
            { id },
            { 
                $push: { 
                    recentActivities: {
                        type,
                        description,
                        date: new Date()
                    }
                }
            },
            { new: true, runValidators: true }
        );

        if (!report) {
            return res.status(404).json({
                success: false,
                error: 'Report not found'
            });
        }

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Export report in different formats
router.get('/employee/:id/export', async (req, res) => {
    try {
        const { id } = req.params;
        const { format = 'json' } = req.query;

        const report = await Report.getDetailedReport(id);
        if (!report) {
            return res.status(404).json({
                success: false,
                error: 'Report not found'
            });
        }

        switch (format.toLowerCase()) {
            case 'json':
                res.json({
                    success: true,
                    data: report
                });
                break;
            
            // Additional export formats can be added here
            default:
                res.status(400).json({
                    success: false,
                    error: 'Unsupported format'
                });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
