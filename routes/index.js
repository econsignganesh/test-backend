const adminApi = require("../routes/api/admin");
const { rateLimit } = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 60, // Limit each IP to 60 requests per minute
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: false,
      message: "Too many requests. Please try again later.",
    });
  },
});

module.exports = function (app) {
  app.use("/api/v1/admin", limiter, adminApi);
};
