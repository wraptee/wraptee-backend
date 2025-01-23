const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

// POST route to send general email
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
      text: `Email: ${email}\nPhone: ${phoneNumber}`,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email", error: error.message });
  }
});

// POST route to send order details
router.post("/send-order", async (req, res) => {
  const { name, email, phoneNumber, cart } = req.body;

  // Validate input
  if (!name || !email || !phoneNumber || !cart || cart.length === 0) {
    return res.status(400).json({ message: "All fields are required" });
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

    // Format the cart details
    const cartDetails = cart
      .map(
        (item) =>
          `<li><strong>${item.name}</strong>: ${item.quantity} x ₹${item.price}</li>`
      )
      .join("");

    // Email options
    const mailOptions = {
      from: process.env.EMAIL,
      to: process.env.TO_EMAIL, // Destination email address
      subject: "New Order Placed",
      html: `
        <h3>Order Details</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phoneNumber}</p>
        <h4>Cart Items:</h4>
        <ul>${cartDetails}</ul>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Order email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send order email", error: error.message });
  }
});

module.exports = router;
