/**
 * create routes for the http requests
 */
const router = require("express").Router();
const managerAuthController = require("../controller/managerAuthController");

router.get("/", (req, res) => {
  return res.send("Working");
});

router.post("/auth/signup", managerAuthController.registerNewUser);
router.post("/auth/login", managerAuthController.loginUser);
router.get("/auth/logout", managerAuthController.logOutUser);

module.exports = router;
