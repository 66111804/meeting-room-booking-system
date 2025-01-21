// src/routes/slotTimeRoutes.ts
import express from "express";
import { generateDefaultSlotsSafe, getAvailableTimeSlots, getTimeSlots } from "../controllers/slotTimeController";

const router = express.Router();

// router.post('/generate-slots', generateDefaultSlots);
router.post('/generate-slots-safe', generateDefaultSlotsSafe);
router.get('/slots', getTimeSlots);
router.get('/available-slots', getAvailableTimeSlots);


export default router;
