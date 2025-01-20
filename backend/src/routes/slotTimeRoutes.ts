// src/routes/slotTimeRoutes.ts
import express from "express";
import { generateDefaultSlots } from "../controllers/slotTimeController";

const router = express.Router();

router.post('/generate-slots', generateDefaultSlots);

export default router;
