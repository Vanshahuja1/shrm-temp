const express = require("express");
const {
 createCandidate , 
    getAllCandidates,
    getCandidateById,
    updateCandidate,
    deleteCandidate,
    scheduleInterview
} = require("../controllers/recruitmentController");

const router = express.Router();

router.route("/candidate").post(createCandidate);
router.route("/candidates").get(getAllCandidates);
router.route("/candidate/:id")
  .get(getCandidateById)
  .put(updateCandidate)
  .delete(deleteCandidate);

router.route("/candidate/scheduleInterview/:id").post(scheduleInterview);

module.exports = router;
