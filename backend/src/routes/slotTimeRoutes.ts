// src/routes/slotTimeRoutes.ts
import express from "express";
import {
  generateDefaultSlotsSafe,
  getAvailableTimeSlots,
  getAvailableTimeSlotsV2,
  getTimeSlots
} from "../controllers/slotTimeController";

const router = express.Router();

// router.post('/generate-slots', generateDefaultSlots);
router.post('/generate-slots-safe', generateDefaultSlotsSafe);
router.get('/slots', getTimeSlots);
router.get('/available-slots', getAvailableTimeSlots);
router.get('/v2/available-slots', getAvailableTimeSlotsV2);

export default router;
