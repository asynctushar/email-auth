const express = require('express');
const { createUser, verifyEmail, loginUser, getUserDetails, logoutUser } = require('../controllers/userController');
const { isAuthenticatedUser } = require('../middlewares/auth');

const router = express.Router();

router.route("/user/new").post(createUser);
router.route("/user/verify/:token").put(verifyEmail);
router.route("/user/login").post(loginUser);
router.route("/user/me").get(isAuthenticatedUser, getUserDetails);
router.route("/user/logout").get(isAuthenticatedUser, logoutUser)


module.exports = router;