/**
 * create routes for the http requests
 */
const router = require("express").Router();
const managerAuthController = require("../controller/managerAuthController");
const { authorizeUser } = require("../middleware/authorization");

router.get("/", (req, res) => {
  return res.send("Working");
});

router.post("/auth/signup", managerAuthController.registerNewUser);
router.post("/auth/login", managerAuthController.loginUser);
router.post("/auth/logout", authorizeUser, managerAuthController.logOutUser);
router.get("/auth/recovery", managerAuthController.sendOtp);
router.post("/auth/recovery", managerAuthController.verifyOtpandChangePassword);

module.exports = router;
