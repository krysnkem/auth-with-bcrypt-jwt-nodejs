/**
 * create routes for the http requests
 */
const router = require("express").Router();
const staffAuthController = require("../controller/staffAuthController");

router.get("/", (req, res) => {
  return res.send("Working");
});

router.post("/auth/signup", staffAuthController.registerNewUser);
router.post("/auth/login", staffAuthController.loginUser);
router.get("/auth/logout", staffAuthController.logOutUser);

module.exports = router;
