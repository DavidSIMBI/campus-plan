const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const {
  listAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} = require("../controllers/assignmentController");

const router = express.Router();

router.use(requireAuth);
router.get("/", listAssignments);
router.post("/", createAssignment);
router.get("/:id", getAssignment);
router.put("/:id", updateAssignment);
router.delete("/:id", deleteAssignment);

module.exports = router;