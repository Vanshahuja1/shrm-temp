const express = require("express");
const {
  getMembers,
    getMemberById,
    createMember,
    deleteMember,
    updateMember,
    getEmpInfo
} = require("../controllers/orgMemberController");

const router = express.Router({ mergeParams: true });

router.get("/", getMembers);
router.get("/empInfo", getEmpInfo);
router.get("/:id", getMemberById);
router.post("/", createMember);
router.put("/:id", updateMember);
router.delete("/:id", deleteMember);

module.exports = router;