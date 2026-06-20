require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");

const app = express();

// CORS Configuration - அனைத்துச் சூழலிலும் வேலை செய்யும் வகையில் மேம்படுத்தப்பட்டுள்ளது
const allowedOrigins = [
  "http://localhost:5173", 
  "https://jobcenter.netlify.app",
  "https://jobcente.netlify.app"
];

app.use(cors({
    origin: function (origin, callback) {
        // !origin: Postman அல்லது மொபைல் ஆப் போன்ற கோரிக்கைகளை அனுமதிக்கும்
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error("CORS Policy Blocked This Request"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// ROUTES
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/ads", require("./routes/adRoutes"));
app.use("/api/companies", require("./routes/companyRoutes"));
app.use("/api/newsletter", require("./routes/newsletterRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/saved-jobs", require("./routes/savedJobRoutes"));

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => res.json({ message: "JobCenter+ Backend Running 🚀" }));

// Error handling middleware
app.use(require("./middleware/errorMiddleware"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server Running on port ${PORT}`);
});