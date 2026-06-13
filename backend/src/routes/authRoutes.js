const express = require("express");
const authenticateToken = require("../middleware/authenticateToken");

const {
	register,
	login,
	deleteAccount,
	requestRegistrationOtp,
	verifyRegistrationOtp,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/register/request-otp", requestRegistrationOtp);
router.post("/register/verify-otp", verifyRegistrationOtp);
router.post("/login", login);
router.delete("/account", authenticateToken, deleteAccount);

module.exports = router;
