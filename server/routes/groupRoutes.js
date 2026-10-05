const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const {
  searchStudents,
  listGroups,
  discoverGroups,
  joinGroup,
  getGroup,
  createGroup,
  updateGroup,
  addMember,
  removeMember,
  leaveGroup,
  listMessages,
  sendMessage,
  markMessagesRead,
} = require("../controllers/groupController");

const router = express.Router();

router.use(requireAuth);
router.get("/students/search", searchStudents);
router.get("/discover", discoverGroups);
router.get("/", listGroups);
router.post("/", createGroup);
router.post("/:id/join", joinGroup);
router.get("/:id", getGroup);
router.put("/:id", updateGroup);
router.post("/:id/members", addMember);
router.delete("/:id/members/:userId", removeMember);
router.post("/:id/leave", leaveGroup);
router.get("/:id/messages", listMessages);
router.post("/:id/messages", sendMessage);
router.put("/:id/messages/read", markMessagesRead);

module.exports = router;
