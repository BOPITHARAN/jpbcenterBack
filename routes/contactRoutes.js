const express = require("express");
const router = express.Router();
const { sendContactEmail } = require("../controllers/contactController");

/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: Contact form email submission
 */

/**
 * @swagger
 * /api/contact/send-email:
 *   post:
 *     summary: Send a contact form email
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactRequest'
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Missing or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Email configuration error or send failure
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/send-email", sendContactEmail);

module.exports = router;
