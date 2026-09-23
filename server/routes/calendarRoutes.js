const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const { listEvents, getEvent, createEvent, updateEvent, deleteEvent } = require("../controllers/calendarController");

const router = express.Router();

router.use(requireAuth);
router.get("/", listEvents);
router.post("/", createEvent);
router.get("/:id", getEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

module.exports = router;