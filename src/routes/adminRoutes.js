/**
 * create routes for the http requests
 */
const router = require("express").Router();
const adminAuthController = require("../controller/adminAuthController");
const { authorizeUser } = require("../middleware/authorization");

router.get("/", (req, res) => {
  return res.send("Working");
});

router.post("/auth/login", adminAuthController.loginUser);
router.post("/auth/logout", authorizeUser, adminAuthController.logOutUser);

module.exports = router;
