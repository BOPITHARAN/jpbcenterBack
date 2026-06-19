require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");

const app = express();

// =======================
// CORS CONFIG (Fixed for withCredentials)
// =======================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://jobcente.netlify.app" // உங்கள் Netlify URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Postman அல்லது மொபைல் ஆப்ஸ்களுக்காக origin இல்லாத கோரிக்கைகளை அனுமதிக்கிறது
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // இது true ஆக இருக்கும்போது origin '*' கொடுக்கக்கூடாது
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// ROUTES (சுருக்கமாக)
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/companies", require("./routes/companyRoutes"));
// ... மற்ற அனைத்து routes

app.get("/", (req, res) => res.json({ message: "JobCenter+ Backend Running 🚀" }));

app.use(require("./middleware/errorMiddleware"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server Running on port ${PORT}`);
});