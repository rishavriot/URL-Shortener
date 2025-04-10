const express = require("express");
const router = express.Router();
const passport = require("passport");
const { ShortUrl, generateShortUrl } = require("../models/shortUrl");

router.post(
  "/shortUrls",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let shortUrl;
      let isUnique = false;

      while (!isUnique) {
        shortUrl = generateShortUrl();
        const existing = await ShortUrl.findOne({ short: shortUrl });
        if (!existing) isUnique = true;
      }

      const newShortUrl = await ShortUrl.create({
        full: req.body.fullUrl,
        short: shortUrl,
        user: req.user._id,
      });

      res.status(201).json(newShortUrl);
    } catch (error) {
      console.error("Error creating short URL:", error);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

router.get("/:shortUrl", async (req, res) => {
  try {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });

    if (!shortUrl) {
      return res.status(404).send("Short URL not found");
    }

    const userAgent = req.headers["user-agent"];
    let deviceType = "Unknown";

    if (/android/i.test(userAgent)) {
      deviceType = "Android";
    } else if (/iphone|ipad|ipod/i.test(userAgent)) {
      deviceType = "iOS";
    } else if (/macintosh|mac os x/i.test(userAgent)) {
      deviceType = "Mac";
    } else if (/windows nt/i.test(userAgent)) {
      deviceType = "Windows";
    }

    // Increase click count
    shortUrl.count = (shortUrl.count || 0) + 1;
    await shortUrl.save();

    try {
      // Get user IP
      let userIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
      userIp = userIp ? userIp.split(",")[0].trim() : "Unknown";

      // If running locally, fetch public IP
      if (userIp === "127.0.0.1" || userIp === "::1") {
        const externalIpResponse = await fetch(
          "https://api64.ipify.org?format=json"
        );
        const externalIpData = await externalIpResponse.json();
        userIp = externalIpData.ip;
      }

      console.log("User IP:", userIp); // Debugging log

      let location = "Unknown";
      if (userIp && userIp !== "Unknown") {
        const response = await fetch(`http://ip-api.com/json/${userIp}`);
        const data = await response.json();

        console.log("Geo API Response:", data); // Debugging log

        if (data.status === "success") {
          location = `${data.city}, ${data.country}`;
        }
      }

      shortUrl.clicks.push({ location, deviceInfo: deviceType });
    } catch (error) {
      console.error("Error fetching location:", error);
      shortUrl.clicks.push({ location: "Unknown", deviceInfo: deviceType });
    }
    await shortUrl.save();

    // Redirect to the full URL
    res.redirect(shortUrl.full);
  } catch (error) {
    console.error("Error handling short URL redirect:", error);
    res.status(500).send("Server Error");
  }
});

//Get analytics data
router.get("/analytics/:id", async (req, res) => {
  try {
    const shortUrl = await ShortUrl.findById(req.params.id);
    if (!shortUrl) return res.status(404).json({ error: "URL not found" });

    res.json({
      full: shortUrl.full, // Full URL
      clicks: shortUrl.clicks || [], // Clicks array
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
