const nodemailer = require("nodemailer");

// Nodemailer transporter-ஐ பங்க்ஷனுக்கு வெளியே வைப்பது சர்வர் பெர்ஃபார்மன்ஸ்-ஐ அதிகரிக்கும்
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// XSS தாக்குதலைத் தடுக்க HTML escapes
const escapeHtml = (text = "") => {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

exports.sendContactEmail = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // வேலிடேஷன்
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    // Email configuration check
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: "Email configuration missing on server",
      });
    }

    // மெயில் அனுப்புதல்
    await transporter.sendMail({
      from: `"JobCenter Plus" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: cleanEmail,
      subject: `Contact Form : ${cleanSubject}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; border-radius: 18px; background: #F0F3FA; color: #395886; border: 1px solid #D5DEEF;">
          <h2 style="color: #395886; margin-bottom: 8px;">New Contact Message</h2>
          <p style="color: #638ECB; margin-top: 0; font-size: 13px;">Job Center Plus Website Contact Form</p>
          <hr style="border: none; border-top: 1px solid #B1C9EF; margin: 18px 0;" />
          <p><b>Name:</b> ${escapeHtml(cleanName)}</p>
          <p><b>Email:</b> ${escapeHtml(cleanEmail)}</p>
          <p><b>Subject:</b> ${escapeHtml(cleanSubject)}</p>
          <p><b>Message:</b></p>
          <div style="background: #ffffff; padding: 16px; border-radius: 14px; border: 1px solid #B1C9EF; line-height: 1.7;">
            ${escapeHtml(cleanMessage).replace(/\n/g, "<br />")}
          </div>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });

  } catch (error) {
    console.error("CONTACT ERROR:", error);

    // ஜிமெயில் லாகின் எரர் ஹேண்ட்லிங்
    if (error.code === "EAUTH") {
      return res.status(500).json({
        success: false,
        message: "Gmail login failed. Please check your App Password.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send message",
    });
  }
};