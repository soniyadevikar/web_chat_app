const express = require('express')
const { registerUser, authUser, allUsers } = require("../controllers/userControllers");
const { protect } = require('../middleware/authMiddleware');
const { googleLogin } = require("../controllers/userControllers");

const router = express.Router();

router.route("/").get(protect, allUsers);
router.route("/").post(registerUser);
router.post("/login", authUser);
router.post("/google-login", googleLogin);

module.exports = router;