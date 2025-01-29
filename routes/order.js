const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

const router = express.Router();

// POST route to send orders
router.post("/send-order", async (req, res) => {
  const { name, email, phoneNumber, cart } = req.body;

  // Validate input
  if (!name || !email || !phoneNumber || !cart || cart.length === 0) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Log the request body for debugging
    console.log("Received order details:", { name, email, phoneNumber, cart });

    // Create a transporter for sending email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    // Format the cart details with product URLs
    const cartDetails = cart
      .map((item) => {
        // Construct product URL (assuming the SKU is in the 'sku' field)
        const productUrl = `https://wraptee.com/product/${item.sku}`;

        return `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">
            <a href="${productUrl}" target="_blank" style="color: #007bff; text-decoration: none;">View Product</a>
          </td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">
            ${item.name}
          </td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">
            ₹${item.price}
          </td>
        </tr>
      `;
      })
      .join("");

    // Calculate total price
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Email template
    const emailTemplate = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px;">
        <div style="text-align: center; padding-bottom: 20px;">
          <img src="cid:wrapteeLogo" alt="WrapTee Logo" width="150">
        </div>

        <h2 style="text-align: center; color: #333;">Order Confirmation</h2>
        <p style="text-align: center; color: #666;">Thank you for shopping with WrapTee! Here are your order details:</p>

        <h3>Customer Details</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phoneNumber}</p>

        <h3>Order Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr>
              <th style="padding: 10px; border: 1px solid #ddd; background: #f8f8f8;">Product</th>
              <th style="padding: 10px; border: 1px solid #ddd; background: #f8f8f8;">Product Name</th>
              <th style="padding: 10px; border: 1px solid #ddd; background: #f8f8f8;">Quantity</th>
              <th style="padding: 10px; border: 1px solid #ddd; background: #f8f8f8;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${cartDetails}
          </tbody>
        </table>

        <h3 style="text-align: right; margin-top: 20px;">Total: ₹${totalPrice}</h3>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="text-align: center; font-size: 14px; color: #666;">
            Need help? Contact us at <a href="mailto:support@wraptee.com">support@wraptee.com</a>
          </p>
          <p style="text-align: center; font-size: 14px; color: #666;">WrapTee - Premium Custom Apparel</p>
        </div>
      </div>
    `;

    // Create an array of attachments (logo only)
    const attachments = [
      {
        filename: "blackLogo.png",
        path: path.join(__dirname, "../asset/blackLogo.png"),
        cid: "wrapteeLogo", // Content-ID for logo
      },
    ];

    // Log attachments to ensure they're correctly set
    console.log("Attachments:", attachments);

    const mailOptions = {
      from: process.env.EMAIL,
      to: `${email}, ${process.env.TO_EMAIL}`,
      subject: "Your WrapTee Order Confirmation",
      html: emailTemplate,
      attachments: attachments,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Order email sent successfully" });
  } catch (error) {
    console.error("Error sending the email:", error);
    res.status(500).json({
      message: "Failed to send order email",
      error: error.message,
      stack: error.stack, // Include stack trace for debugging
    });
  }
});

module.exports = router;
