const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

// POST route to send email
router.post("/send-email", async (req, res) => {
  const { email, phoneNumber } = req.body;

  if (!email || !phoneNumber) {
    return res.status(400).json({ message: "Email and Phone number are required" });
  }

  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail", // You can use other services like Outlook, Yahoo, etc.
      auth: {
        user: process.env.EMAIL, // Your email address
        pass: process.env.PASSWORD, // Your email password or app-specific password
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL,
      to: process.env.TO_EMAIL, // Destination email address
      subject: "New Customer Info",
      text: `Name: ${email}\nPhone: ${phoneNumber}`,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email", error: error.message });
  }
});

module.exports = router;
