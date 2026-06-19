require("dotenv").config();

const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");

const app = express();

// =======================
// CORS CONFIG (Railway Fix: Allowed all origins temporarily)
// =======================
app.use(
  cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"],
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
  })
);

// =======================
// ROUTES
// =======================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/saved-jobs", require("./routes/savedJobRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/newsletter", require("./routes/newsletterRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/ads", require("./routes/adRoutes"));
app.use("/api/companies", require("./routes/companyRoutes"));

// =======================
// ROOT ROUTE
// =======================
app.get("/", (req, res) => {
  res.status(200).json({ message: "JobCenter+ Backend Running 🚀" });
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
});