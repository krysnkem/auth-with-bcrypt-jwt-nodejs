/**
 * create routes for the http requests
 */
const router = require("express").Router();
const staffAuthController = require("../controller/staffAuthController");
const { authorizeUser } = require("../middleware/authorization");

router.get("/", (req, res) => {
  return res.send("Working");
});

router.post("/auth/signup", staffAuthController.registerNewUser);
router.post("/auth/login", staffAuthController.loginUser);
router.post("/auth/logout", authorizeUser, staffAuthController.logOutUser);
router.get("/auth/recovery", staffAuthController.sendOtp);
router.post("/auth/recovery", staffAuthController.verifyOtpandChangePassword);

module.exports = router;
