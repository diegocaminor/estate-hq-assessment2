const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const router = express.Router();

const DATA_PATH = path.join(__dirname, "../../../data/items.json");

let cache = {
  mtime: 0,
  stats: null,
};

// GET /api/stats
router.get("/", async (req, res, next) => {
  try {
    const fileStats = await fs.stat(DATA_PATH);
    const currentMtime = fileStats.mtimeMs;

    console.log({ cache });
    // Use cache if file hasn't changed
    if (cache.stats && cache.mtime === currentMtime) {
      return res.json(cache.stats);
    }

    // File changed or no cache, read and recalculate
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const items = JSON.parse(raw);

    // Recalculate stats
    const stats = {
      total: items.length,
      averagePrice:
        items.length > 0
          ? items.reduce((acc, cur) => acc + cur.price, 0) / items.length
          : 0,
    };

    // Update cache
    cache = {
      mtime: currentMtime,
      stats,
    };

    res.json(stats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
