const express = require("express");
const { register, login, refresh, logout } = require("../controllers/authController");
const { registerValidator, loginValidator } = require("../validators/authValidators");
const { validateRequest } = require("../middlewares/validateRequest");

const router = express.Router();

router.post("/register", registerValidator, validateRequest, register);
router.post("/login", loginValidator, validateRequest, login);
router.post("/refresh", refresh);
router.post("/logout", logout);

module.exports = router;
