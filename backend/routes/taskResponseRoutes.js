const express = require("express");
const { getAllTaskResponses, getMyTaskResponses } = require("../controllers/taskResponseController");

const router = express.Router();

// Add forward slashes to make the routes work correctly
router.get("/manager/:id", getAllTaskResponses);
router.get("/employee/:id", getMyTaskResponses);

module.exports = router;   