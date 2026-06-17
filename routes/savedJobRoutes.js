const express = require("express");
const router = express.Router();

const savedJobController = require("../controllers/savedJobController");

/**
 * @swagger
 * tags:
 *   name: Saved Jobs
 *   description: Save and retrieve bookmarked jobs per user
 */

/**
 * @swagger
 * /api/saved-jobs:
 *   post:
 *     summary: Save a job for a user
 *     tags: [Saved Jobs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SaveJobRequest'
 *     responses:
 *       200:
 *         description: Job saved successfully
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
 *                   $ref: '#/components/schemas/SavedJob'
 *       400:
 *         description: Missing user_id or job_id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Job already saved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", savedJobController.saveJob);

/**
 * @swagger
 * /api/saved-jobs/{user_id}:
 *   get:
 *     summary: Get all saved jobs for a user
 *     tags: [Saved Jobs]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of saved jobs with full job details
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
 *                     $ref: '#/components/schemas/SavedJob'
 *       400:
 *         description: Missing user_id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:user_id", savedJobController.getSavedJobs);

/**
 * @swagger
 * /api/saved-jobs/{id}:
 *   delete:
 *     summary: Remove a saved job by saved-job record ID
 *     tags: [Saved Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Saved job record ID (not job_id)
 *     responses:
 *       200:
 *         description: Saved job removed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Saved job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id", savedJobController.deleteSavedJob);

module.exports = router;
