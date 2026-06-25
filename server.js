require("dotenv").config();

const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");

const app = express();

// =========================
// CORS CONFIG (FIXED & SECURE)
// =========================
const corsOptions = {
  origin: [
    "https://jobcente.netlify.app", 
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
// கவனிக்க: app.options("*") வரியை நீக்கிவிட்டேன் (PathError தவிர்க்க)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
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
// TEST & 404 HANDLERS
// =========================
app.get("/", (req, res) => {
  res.json({ message: "JobCenter+ Backend Running 🚀" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
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