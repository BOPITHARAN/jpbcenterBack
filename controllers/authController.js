const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// =====================
// TOKEN
// =====================
const createToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || "user",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// =====================
// REGISTER
// =====================
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone and password required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password minimum 6 characters",
      });
    }

    // check existing user
    const { data: existing, error: existError } = await supabase
      .from("users")
      .select("*")
      .or(`email.eq.${cleanEmail},phone.eq.${cleanPhone}`);

    if (existError) {
      console.log(existError);
      return res.status(500).json({ success: false });
    }

    if (existing && existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email or phone already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          name: name.trim(),
          email: cleanEmail,
          phone: cleanPhone,
          password: hashedPassword,
          role: "user",
        },
      ])
      .select()
      .single();

    if (error || !data) {
      console.log("REGISTER ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "Registration failed",
      });
    }

    res.json({
      success: true,
      user: data,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =====================
// LOGIN
// =====================
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/Phone and password required",
      });
    }

    const cleanEmail = identifier.trim().toLowerCase();
    const cleanPhone = identifier.trim();

    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .or(`email.eq.${cleanEmail},phone.eq.${cleanPhone}`);

    if (error) {
      console.log(error);
      return res.status(500).json({ success: false });
    }

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = users[0];

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = createToken(user);

    res.json({
      success: true,
      token,
      user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =====================
// PHONE LOGIN
// =====================
exports.phoneLogin = async (req, res) => {
  try {
    const { phone } = req.body;

    const cleanPhone = phone?.trim();

    if (!cleanPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone required",
      });
    }

    // check existing user
    const { data: users, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("phone", cleanPhone);

    if (fetchError) {
      console.log(fetchError);
      return res.status(500).json({ success: false });
    }

    if (users && users.length > 0) {
      const user = users[0];
      const token = createToken(user);

      return res.json({
        success: true,
        token,
        user,
      });
    }

    // create new user
    const hashedPassword = await bcrypt.hash("PHONE_USER", 10);

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          name: "User",
          phone: cleanPhone,
          password: hashedPassword,
          role: "user",
        },
      ])
      .select()
      .single();

    if (error || !data) {
      console.log("PHONE INSERT ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "User creation failed",
      });
    }

    const token = createToken(data);

    res.json({
      success: true,
      token,
      user: data,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =====================
// GOOGLE LOGIN
// =====================
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email.toLowerCase();

    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email);

    if (error) {
      console.log(error);
      return res.status(500).json({ success: false });
    }

    let user;

    if (users && users.length > 0) {
      user = users[0];
    } else {
      const { data, error: insertError } = await supabase
        .from("users")
        .insert([
          {
            name: payload.name,
            email,
            password: "google",
            role: "user",
          },
        ])
        .select()
        .single();

      if (insertError || !data) {
        console.log(insertError);
        return res.status(500).json({
          success: false,
          message: "Google user create failed",
        });
      }

      user = data;
    }

    const jwtToken = createToken(user);

    res.json({
      success: true,
      token: jwtToken,
      user,
    });
  } catch (err) {
    console.log(err);
    res.status(401).json({
      success: false,
      message: "Google login failed",
    });
  }
};