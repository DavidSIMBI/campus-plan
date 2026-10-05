const express = require("express");
const { register, login, me, updateMe } = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, me);
router.put("/me", requireAuth, updateMe);

module.exports = router;
