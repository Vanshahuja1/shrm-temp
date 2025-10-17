const express = require("express")
const {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationSummary,
} = require("../controllers/organizationController")

const router = express.Router()

router.route("/").get(getAllOrganizations).post(createOrganization)
router.route("/:id").get(getOrganizationById).put(updateOrganization).delete(deleteOrganization)
router.route("/:id/summary").get(getOrganizationSummary)

module.exports = router
