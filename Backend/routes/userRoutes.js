const express = require("express");
const passport = require("passport");

const router = express.Router();

// Protected Route (Only accessible with valid JWT)
router.get(
  "/dashboard",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({ msg: `Welcome ${req.user.name}, this is your dashboard!` });
  }
);

module.exports = router;
