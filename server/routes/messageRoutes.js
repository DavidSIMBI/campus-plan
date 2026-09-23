const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const { searchStudents, listConversations, getConversation, sendMessage, markConversationRead } = require("../controllers/messageController");

const router = express.Router();

router.use(requireAuth);
router.get("/students", searchStudents);
router.get("/conversations", listConversations);
router.put("/:userId/read", markConversationRead);
router.get("/:userId", getConversation);
router.post("/:userId", sendMessage);

module.exports = router;