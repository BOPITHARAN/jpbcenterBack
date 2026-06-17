const router = require("express").Router();
const upload = require("../middleware/upload");

const { getAds, addAd, deleteAd } = require("../controllers/adController");

/**
 * @swagger
 * tags:
 *   name: Ads
 *   description: Advertisement management
 */

/**
 * @swagger
 * /api/ads:
 *   get:
 *     summary: Get all ads
 *     tags: [Ads]
 *     responses:
 *       200:
 *         description: List of all ads
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
 *                     $ref: '#/components/schemas/Ad'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", getAds);

/**
 * @swagger
 * /api/ads:
 *   post:
 *     summary: Add a new ad (with optional image upload)
 *     tags: [Ads]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Summer Sale
 *               subtitle:
 *                 type: string
 *                 example: Up to 50% off
 *               description:
 *                 type: string
 *                 example: Hurry! Limited time offer.
 *               button_text:
 *                 type: string
 *                 example: Shop Now
 *               bg_color:
 *                 type: string
 *                 example: "#1a73e8"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Ad image (PNG/JPG/WEBP, max 5MB)
 *     responses:
 *       200:
 *         description: Ad added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 id:
 *                   type: integer
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", upload.single("image"), addAd);

/**
 * @swagger
 * /api/ads/{id}:
 *   delete:
 *     summary: Delete an ad by ID
 *     tags: [Ads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ad ID
 *     responses:
 *       200:
 *         description: Ad deleted
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
router.delete("/:id", deleteAd);

module.exports = router;
