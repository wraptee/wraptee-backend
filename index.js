const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5001;

// CORS configuration to allow multiple origins
const corsOptions = {
  origin: [
    "http://localhost:3000",  // Local development URL
    "https://wraptee-frontend-rudras-projects-d276a0b1.vercel.app",  // Vercel URL
    "https://wraptee.com"  // Your production URL
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],  // Allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"],  // Allowed headers
};

// Middleware to use CORS with the defined options
app.use(cors(corsOptions));

app.use(bodyParser.json());

// Import Routes
const emailRoutes = require("./routes/email");
app.use("/api", emailRoutes);

// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
