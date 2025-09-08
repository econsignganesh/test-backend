const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const db = require("./models");

const port = process.env.APP_PORT || 3000;
const environment = process.env.NODE_ENV || "development";

// ---- Logger (simple console logs) ----
app.use(morgan("dev"));

// ---- Middlewares ----
app.use(bodyParser.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);

// ---- CORS ----
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://adminpanalnew.netlify.app"
];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow curl/postman
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ---- Static Folders (if needed) ----
// app.use("/userdocuments", express.static("userdocuments"));

// ---- Routes ----
require("./routes/index")(app);

// ---- Database & Server Start ----
db.sequelize
  .authenticate()
  .then(() => {
    app.listen(port, () => {
      console.log(
        `${environment} environment listening on port ${port}`
      );
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
