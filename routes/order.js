const express = require("express");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");

// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads")); // Directory where images will be stored temporarily
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Create unique filename based on timestamp
  },
});

const upload = multer({ storage: storage }); // Initialize multer with storage configuration

const router = express.Router();

// POST route to send orders
router.post("/send-order", upload.array("productImages"), async (req, res) => {
  const { name, email, phoneNumber, cart } = req.body;

  // Validate input
  if (!name || !email || !phoneNumber || !cart || cart.length === 0) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Create a transporter for sending the email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    // Format the cart details with images (if available)
    const cartDetails = cart
      .map((item, index) => {
        // Check if an image exists for this product in the request
        const imageFile = req.files && req.files[index];

        // Use the appropriate image URL or 'No Image' if none is provided
        const imageUrl = imageFile
          ? `cid:${imageFile.filename}` // Use CID for inline images
          : item.imageUrl || "No Image";

        return `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">
            ${imageFile ? `<img src="cid:${imageFile.filename}" alt="${item.name}" style="width: 80px; height: 80px; border-radius: 5px;">` : 'No Image'}
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
              <th style="padding: 10px; border: 1px solid #ddd; background: #f8f8f8;">Image</th>
              <th style="padding: 10px; border: 1px solid #ddd; background: #f8f8f8;">Product</th>
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

    // Create an array of attachments (logo + product images if available)
    const attachments = [
      {
        filename: "blackLogo.png",
        path: path.join(__dirname, "../asset/blackLogo.png"),
        cid: "wrapteeLogo", // Content-ID for logo
      },
      ...(req.files ? req.files.map((file) => ({
        filename: file.filename,
        path: file.path,
        cid: file.filename, // Content-ID for each product image
      })) : []),
    ];

    const mailOptions = {
      from: process.env.EMAIL,
      to: `${email}, ${process.env.TO_EMAIL}`,
      subject: "Your WrapTee Order Confirmation",
      html: emailTemplate,
      attachments: attachments,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Order email sent successfully" });
  } catch (error) {
    console.error("Error sending the email:", error);
    res.status(500).json({ message: "Failed to send order email", error: error.message });
  }
});

module.exports = router;
