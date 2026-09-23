const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const { listTests, getTest, createTest, updateTest, deleteTest } = require("../controllers/testController");

const router = express.Router();

router.use(requireAuth);
router.get("/", listTests);
router.post("/", createTest);
router.get("/:id", getTest);
router.put("/:id", updateTest);
router.delete("/:id", deleteTest);

module.exports = router;