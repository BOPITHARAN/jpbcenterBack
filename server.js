require("dotenv").config();

const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");

const app = express();

// =========================
// CORS CONFIG (SAFE)
// =========================
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://jobcente.netlify.app"
    ];

    // Allow Postman / server-to-server requests
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      origin.includes("netlify.app")
    ) {
      return callback(null, true);
    }

    // TEMP: allow all (for debugging & Railway fix)
    return callback(null, true);
  },

  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "cache-control",
    "Cache-Control"
  ],

  credentials: true
};

// =========================
// MIDDLEWARE
// =========================
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// =========================
// ROUTES
// =========================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/ads", require("./routes/adRoutes"));
app.use("/api/companies", require("./routes/companyRoutes"));
app.use("/api/newsletter", require("./routes/newsletterRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/saved-jobs", require("./routes/savedJobRoutes"));

// =========================
// SWAGGER (DEV ONLY)
// =========================
if (process.env.NODE_ENV !== "production") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// =========================
// TEST ROUTE
// =========================
app.get("/", (req, res) => {
  res.json({ message: "JobCenter+ Backend Running 🚀" });
});

// =========================
// 404 HANDLER
// =========================
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});

// =========================
// ERROR HANDLER
// =========================
app.use(require("./middleware/errorMiddleware"));

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server Running on port ${PORT}`);
});