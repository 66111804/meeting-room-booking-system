import { Router } from "express";
import { meetingRoomList } from "../controllers/booking-room";

const router = Router();

router.get('', async (req, res) => {
  await meetingRoomList(req, res);
});

export default router;