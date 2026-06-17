const express = require("express");
const router = express.Router();
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase env variables");
}

const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * tags:
 *   name: Companies
 *   description: Company management with logo upload to Supabase Storage
 */

/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: Get all companies
 *     tags: [Companies]
 *     responses:
 *       200:
 *         description: List of all companies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Company'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .order("id", { ascending: false });

    if (error) return res.status(500).json({ success: false, message: error.message });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @swagger
 * /api/companies:
 *   post:
 *     summary: Add a new company with optional logo
 *     tags: [Companies]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Acme Corp
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Company logo image (PNG/JPG/WEBP, max 5MB)
 *     responses:
 *       201:
 *         description: Company added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Company'
 *       400:
 *         description: Company name is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error or upload failure
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", upload.single("logo"), async (req, res) => {
  try {
    const { name } = req.body;
    const file = req.file;

    if (!name) return res.status(400).json({ success: false, message: "Company name is required" });

    let logoUrl = null;

    if (file) {
      const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
      const { error: uploadError } = await supabase.storage
        .from("companies")
        .upload(fileName, file.buffer, { contentType: file.mimetype });

      if (uploadError) return res.status(500).json({ success: false, message: uploadError.message });

      const { data: publicData } = supabase.storage.from("companies").getPublicUrl(fileName);
      logoUrl = publicData.publicUrl;
    }

    const { data, error } = await supabase
      .from("companies")
      .insert([{ name, logo: logoUrl }])
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, message: error.message });

    res.status(201).json({ success: true, message: "Company added successfully", data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @swagger
 * /api/companies/{id}:
 *   delete:
 *     summary: Delete a company and its logo from storage
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Company ID
 *     responses:
 *       200:
 *         description: Company deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: company, error: fetchError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) return res.status(500).json({ success: false, message: fetchError.message });

    if (company?.logo) {
      const fileName = company.logo.split("/").pop();
      await supabase.storage.from("companies").remove([fileName]);
    }

    const { error: deleteError } = await supabase.from("companies").delete().eq("id", id);

    if (deleteError) return res.status(500).json({ success: false, message: deleteError.message });

    res.json({ success: true, message: "Company deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
