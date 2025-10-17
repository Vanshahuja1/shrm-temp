const express = require('express');
const router = express.Router();

const {getTodaysAttendance , getAttendanceByEmpId, getStats} = require('../controllers/attendanceController');

// Route to get today's attendance for HR
router.get('/employee/stats/:id', getStats);
router.get('/hr/:hrId', getTodaysAttendance);
router.get('/hr/employee/:id', getAttendanceByEmpId);
module.exports = router;