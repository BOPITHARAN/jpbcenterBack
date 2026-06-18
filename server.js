require("dotenv").config();

const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");

const app = express();

// =======================
// ENV CHECK (DEBUGGING)
// =======================
console.log("ENV CHECK:", {
  PORT: process.env.PORT,
  SUPABASE_URL: process.env.SUPABASE_URL ? "OK" : "MISSING",
  SUPABASE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "OK" : "MISSING",
});

// =======================
// CORS CONFIG (Updated for Railway)
// =======================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://jobcente.netlify.app",
      "https://jobcenter-production.up.railway.app", // Added Railway Frontend URL if any
    ],
    credentials: true,
  })
);

// =======================
// MIDDLEWARES
// =======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// =======================
// SWAGGER UI
// =======================
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: "JobCenter+ API Docs",
    swaggerOptions: { persistAuthorization: true },
  })
);

app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// =======================
// ROUTES
// =======================
app.use("/api/auth",         require("./routes/authRoutes"));
app.use("/api/jobs",         require("./routes/jobRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/saved-jobs",   require("./routes/savedJobRoutes"));
app.use("/api/contact",      require("./routes/contactRoutes"));
app.use("/api/newsletter",   require("./routes/newsletterRoutes"));
app.use("/api/dashboard",    require("./routes/dashboardRoutes"));
app.use("/api/ads",          require("./routes/adRoutes"));
app.use("/api/companies",    require("./routes/companyRoutes"));

// =======================
// ROOT ROUTE
// =======================
app.get("/", (req, res) => {
  res.send("JobCenter+ Backend Running 🚀 — Docs: /api-docs");
});

// =======================
// ERROR HANDLER
// =======================
app.use(require("./middleware/errorMiddleware"));

// =======================
// START SERVER (Railway Fix: Added 0.0.0.0)
// =======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server Running successfully on port ${PORT}`);
  console.log(`Swagger Docs → http://0.0.0.0:${PORT}/api-docs`);
});