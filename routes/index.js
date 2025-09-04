 let adminApi = require('../routes/api/admin');
 let encryptionApi = require('../routes/api/encryption')
 let clientAuth = require("../app/middleware/clientAuth");

let {
    success,
    failed,
    authFailed,
    failedValidation
} = require('../app/helper/response');

const {
    rateLimit
} = require('express-rate-limit')
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 15 minutes
    limit: 60, // Limit each IP to 60 requests per `window` (here, per 1 minutes)
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        // Customize the response message and status code
        return failed(res, "Too many requests. Please try again later.")
    },
})
module.exports = function (app) {
    app.use("/api/v1/admin", adminApi)
    app.use("/api/v1/client", encryptionApi)
}