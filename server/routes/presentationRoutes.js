const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const {
  listPresentations,
  getPresentation,
  createPresentation,
  updatePresentation,
  deletePresentation,
} = require("../controllers/presentationController");

const router = express.Router();

router.use(requireAuth);
router.get("/", listPresentations);
router.post("/", createPresentation);
router.get("/:id", getPresentation);
router.put("/:id", updatePresentation);
router.delete("/:id", deletePresentation);

module.exports = router;