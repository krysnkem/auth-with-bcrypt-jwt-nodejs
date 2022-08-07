/**
 * create routes for the http requests
 */
const router = require("express").Router();
const adminAuthController = require("../controller/adminAuthController");

router.get("/", (req, res) => {
  return res.send("Working");
});

router.post("/auth/login", adminAuthController.loginUser);
router.get("/auth/logout", adminAuthController.logOutUser);

module.exports = router;
