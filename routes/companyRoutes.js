const express = require("express");
const router = express.Router();
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Setup Multer for Memory Storage
const upload = multer({ storage: multer.memoryStorage() });

/**
 * 1. GET ALL COMPANIES
 * URL: /api/companies
 */
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * 2. ADD NEW COMPANY WITH LOGO
 * URL: /api/companies
 */
router.post("/", upload.single("logo"), async (req, res) => {
  try {
    const { name } = req.body;
    const file = req.file;

    if (!name) {
      return res.status(400).json({ success: false, message: "Company name is required!" });
    }

    let logoUrl = null;

    if (file) {
      const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
      
      const { error: uploadError } = await supabase.storage
        .from("companies")
        .upload(fileName, file.buffer, { contentType: file.mimetype });

      if (uploadError) {
        return res.status(500).json({ success: false, message: `Storage Error: ${uploadError.message}` });
      }

      const { data: publicData } = supabase.storage.from("companies").getPublicUrl(fileName);
      logoUrl = publicData.publicUrl;
    }

    const { data, error } = await supabase
      .from("companies")
      .insert([{ name, logo: logoUrl }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: `Database Error: ${error.message}` });
    }

    res.status(201).json({ success: true, message: "Company added successfully!", data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * 3. UPDATE COMPANY (Supports Name & New Logo Upload)
 * URL: /api/companies/:id
 */
router.put("/:id", upload.single("logo"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const file = req.file;

    if (!name) {
      return res.status(400).json({ success: false, message: "Company name is required!" });
    }

    const { data: existingCompany, error: fetchError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingCompany) {
      return res.status(500).json({ success: false, message: "Company record not found!" });
    }

    let logoUrl = existingCompany.logo;

    if (file) {
      // Delete old file if exists
      if (existingCompany.logo) {
        const oldFileName = existingCompany.logo.split("/").pop();
        await supabase.storage.from("companies").remove([oldFileName]);
      }

      const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
      const { error: uploadError } = await supabase.storage
        .from("companies")
        .upload(fileName, file.buffer, { contentType: file.mimetype });

      if (uploadError) {
        return res.status(500).json({ success: false, message: `Storage Error: ${uploadError.message}` });
      }

      const { data: publicData } = supabase.storage.from("companies").getPublicUrl(fileName);
      logoUrl = publicData.publicUrl;
    }

    const { data, error } = await supabase
      .from("companies")
      .update({ name, logo: logoUrl })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    res.json({ success: true, message: "Company updated successfully!", data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * 4. DELETE COMPANY AND LOGO
 * URL: /api/companies/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: company, error: fetchError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      return res.status(500).json({ success: false, message: fetchError.message });
    }

    if (company && company.logo) {
      const fileName = company.logo.split("/").pop();
      await supabase.storage.from("companies").remove([fileName]);
    }

    const { error: deleteError } = await supabase
      .from("companies")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return res.status(500).json({ success: false, message: deleteError.message });
    }

    res.json({ success: true, message: "Company deleted successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;