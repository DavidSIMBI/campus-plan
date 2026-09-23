const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const {
  listTimetable,
  getTimetableEntry,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
} = require("../controllers/timetableController");

const router = express.Router();

router.use(requireAuth);
router.get("/", listTimetable);
router.post("/", createTimetableEntry);
router.get("/:id", getTimetableEntry);
router.put("/:id", updateTimetableEntry);
router.delete("/:id", deleteTimetableEntry);

module.exports = router;