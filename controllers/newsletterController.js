const { createClient } = require("@supabase/supabase-js");
const nodemailer = require("nodemailer"); // ✅ Nodemailer Import செய்துள்ளோம்

// Supabase setup
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ================================
// EMAIL TRANSPORTER SETUP
// ================================
const transporter = nodemailer.createTransport({
  service: "gmail", // Gmail பயன்படுத்துகிறோம்
  auth: {
    user: process.env.EMAIL_USER, // உங்கள் மெயில் ஐடி (எ.கா: admin@gmail.com)
    pass: process.env.EMAIL_PASS, // App Password (சாதாரண பாஸ்வேர்ட் அல்ல)
  },
});

// ================================
// SUBSCRIBE NEWSLETTER
// ================================
exports.subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // ================================
    // CHECK EXISTING EMAIL
    // ================================
    const { data: existing, error: fetchError } = await supabase
      .from("newsletter_subscribers")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (fetchError) {
      return res.status(500).json({
        success: false,
        message: fetchError.message,
      });
    }

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This email is already subscribed",
      });
    }

    // ================================
    // INSERT NEW SUBSCRIBER
    // ================================
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .insert([{ email: cleanEmail }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    // ================================
    // ✉️ SEND WELCOME EMAIL
    // ================================
    try {
      await transporter.sendMail({
        from: `"Job Portal" <${process.env.EMAIL_USER}>`, // அனுப்பும் பெயர்
        to: cleanEmail, // யாருக்கு அனுப்ப வேண்டும்
        subject: "Welcome to Our Job Alerts! 🎉", // மெயில் Subject
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #395886;">
            <h2>Thank You for Subscribing!</h2>
            <p>Hi there,</p>
            <p>You have successfully subscribed to our newsletter. You will now receive the latest premium job alerts directly to your inbox.</p>
            <br/>
            <p>Best Regards,</p>
            <strong>The Job Portal Team</strong>
          </div>
        `, // மெயிலின் டிசைன்
      });
      console.log("Welcome email sent to:", cleanEmail);
    } catch (mailError) {
      console.error("Failed to send welcome email:", mailError);
      // மெயில் போகவில்லை என்றாலும், Database-ல் save ஆகிவிட்டதால் Error காட்டத் தேவையில்லை
    }

    return res.status(201).json({
      success: true,
      message: "Subscribed successfully!",
      id: data.id,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};