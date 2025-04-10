const mongoose = require("mongoose");

function generateShortUrl() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let shortUrl = "";
  for (let i = 0; i < 6; i++) {
    shortUrl += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return shortUrl;
}

const shortUrlSchema = new mongoose.Schema({
  full: {
    type: String,
    required: true,
  },
  short: {
    type: String,
    required: true,
    unique: true,
  },
  count: {
    type: Number,
    required: true,
    default: 0,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  clicks: [
    {
      timestamp: { type: Date, default: Date.now },
      location: { type: String, default: "Unknown" },
      deviceInfo: { type: String, default: "Unknown" },
    },
  ],
});

const ShortUrl = mongoose.model("ShortUrl", shortUrlSchema);

module.exports = { ShortUrl, generateShortUrl };
