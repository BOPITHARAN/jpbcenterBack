require("dotenv").config();

const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");

const app = express();

/* =========================
   CORS CONFIG
========================= */

const allowedOrigins = [
  "https://jobcente.netlify.app",
  "https://www.jobcente.netlify.app",
  "http://localhost:5173",
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log("Origin:", origin);

    // Allow Postman / Mobile Apps / Curl
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("Blocked Origin:", origin);
    return callback(new Error("CORS blocked"));
  },

  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cache-Control",
  ],

  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/uploads", express.static("uploads"));

/* =========================
   SWAGGER
========================= */

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* =========================
   ROUTES
========================= */

app.use("/api/newsletter", require("./routes/newsletterRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/ads", require("./routes/adRoutes"));
app.use("/api/companies", require("./routes/companyRoutes"));
app.use("/api/saved-jobs", require("./routes/savedJobRoutes"));

/* =========================
   HEALTH CHECK
========================= */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "JobCenter+ Backend Running 🚀",
  });
});

/* =========================
   404 HANDLER
========================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* =========================
   ERROR HANDLER
========================= */

app.use(require("./middleware/errorMiddleware"));

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("Allowed Origins:", allowedOrigins);
});