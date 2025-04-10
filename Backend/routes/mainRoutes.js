const express = require("express");
const router = express.Router();
const passport = require("passport");
const { ShortUrl } = require("../models/shortUrl");

router.get(
  "/sendShortUrls",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const shortUrls = await ShortUrl.find({ user: req.user._id });
      console.log("Sending Short URLs:", shortUrls); // Debugging
      res.json(shortUrls);
    } catch (error) {
      console.error("Error fetching URLs:", error);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

module.exports = router;
