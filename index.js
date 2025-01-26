const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
// Use CORS middleware to allow requests from specific origins
app.use(cors({
  origin: "http://localhost:3000",  // Replace with your frontend's origin
  methods: ["GET", "POST", "PUT", "DELETE"],  // Allow these methods
  allowedHeaders: ["Content-Type", "Authorization"],  // Allow these headers
},
  {
    origin: "https://wraptee-frontend-rudras-projects-d276a0b1.vercel.app",  // Replace with your frontend's origin
    methods: ["GET", "POST", "PUT", "DELETE"],  // Allow these methods
    allowedHeaders: ["Content-Type", "Authorization"],  // Allow these headers
  },
  {
    origin: "https://wraptee.com",  // Replace with your frontend's origin
    methods: ["GET", "POST", "PUT", "DELETE"],  // Allow these methods
    allowedHeaders: ["Content-Type", "Authorization"],  // Allow these headers
}));
app.use(bodyParser.json());

// Import Routes
const emailRoutes = require("./routes/email");
app.use("/api", emailRoutes);

// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
