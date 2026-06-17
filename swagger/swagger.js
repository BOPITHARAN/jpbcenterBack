const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "JobCenter+ API",
      version: "1.0.0",
      description: "JobCenter+ Backend API Documentation",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local Development Server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        // ─── AUTH ─────────────────────────────────────────────
        RegisterRequest: {
          type: "object",
          required: ["name", "email", "phone", "password"],
          properties: {
            name:     { type: "string", example: "John Doe" },
            email:    { type: "string", example: "john@example.com" },
            phone:    { type: "string", example: "+94771234567" },
            password: { type: "string", example: "secret123" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["identifier", "password"],
          properties: {
            identifier: { type: "string", example: "john@example.com" },
            password:   { type: "string", example: "secret123" },
          },
        },
        PhoneLoginRequest: {
          type: "object",
          required: ["phone"],
          properties: {
            phone: { type: "string", example: "+94771234567" },
          },
        },
        GoogleLoginRequest: {
          type: "object",
          required: ["token"],
          properties: {
            token: { type: "string", example: "google_id_token_here" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            token:   { type: "string" },
            user: {
              type: "object",
              properties: {
                id:    { type: "integer" },
                name:  { type: "string" },
                email: { type: "string" },
                phone: { type: "string" },
                role:  { type: "string", example: "user" },
              },
            },
          },
        },

        // ─── JOB ──────────────────────────────────────────────
        Job: {
          type: "object",
          properties: {
            id:          { type: "integer" },
            company:     { type: "string" },
            title:       { type: "string" },
            location:    { type: "string" },
            type:        { type: "string", example: "Full-time" },
            category:    { type: "string" },
            days_left:   { type: "string" },
            salary:      { type: "string" },
            description: { type: "string" },
          },
        },
        CreateJobRequest: {
          type: "object",
          required: ["company", "title", "location", "type"],
          properties: {
            company:     { type: "string", example: "Acme Corp" },
            title:       { type: "string", example: "Software Engineer" },
            location:    { type: "string", example: "Colombo" },
            type:        { type: "string", example: "Full-time" },
            category:    { type: "string", example: "IT" },
            days_left:   { type: "string", example: "10" },
            salary:      { type: "string", example: "LKR 100,000" },
            description: { type: "string", example: "Job description here..." },
          },
        },

        // ─── APPLICATION ──────────────────────────────────────
        Application: {
          type: "object",
          properties: {
            id:        { type: "integer" },
            job_id:    { type: "integer" },
            job_title: { type: "string" },
            company:   { type: "string" },
            name:      { type: "string" },
            email:     { type: "string" },
            phone:     { type: "string" },
            resume:    { type: "string", nullable: true },
            message:   { type: "string", nullable: true },
            status:    { type: "string", example: "pending" },
          },
        },

        // ─── SAVED JOB ────────────────────────────────────────
        SaveJobRequest: {
          type: "object",
          required: ["user_id", "job_id"],
          properties: {
            user_id: { type: "integer", example: 1 },
            job_id:  { type: "integer", example: 5 },
          },
        },
        SavedJob: {
          type: "object",
          properties: {
            id:      { type: "integer" },
            user_id: { type: "integer" },
            job_id:  { type: "integer" },
            jobs:    { $ref: "#/components/schemas/Job" },
          },
        },

        // ─── AD ───────────────────────────────────────────────
        Ad: {
          type: "object",
          properties: {
            id:          { type: "integer" },
            title:       { type: "string" },
            subtitle:    { type: "string" },
            description: { type: "string" },
            button_text: { type: "string" },
            image:       { type: "string", nullable: true },
            bg_color:    { type: "string" },
          },
        },

        // ─── COMPANY ──────────────────────────────────────────
        Company: {
          type: "object",
          properties: {
            id:   { type: "integer" },
            name: { type: "string" },
            logo: { type: "string", nullable: true },
          },
        },

        // ─── NEWSLETTER ───────────────────────────────────────
        NewsletterSubscribeRequest: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", example: "subscriber@example.com" },
          },
        },

        // ─── CONTACT ──────────────────────────────────────────
        ContactRequest: {
          type: "object",
          required: ["name", "email", "subject", "message"],
          properties: {
            name:    { type: "string", example: "John Doe" },
            email:   { type: "string", example: "john@example.com" },
            subject: { type: "string", example: "Job Inquiry" },
            message: { type: "string", example: "I wanted to ask about..." },
          },
        },

        // ─── DASHBOARD ────────────────────────────────────────
        DashboardStats: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: {
              type: "object",
              properties: {
                jobs:         { type: "integer" },
                applications: { type: "integer" },
                interviews:   { type: "integer" },
                hired:        { type: "integer" },
              },
            },
          },
        },

        // ─── GENERIC ──────────────────────────────────────────
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

module.exports = swaggerJsdoc(options);
