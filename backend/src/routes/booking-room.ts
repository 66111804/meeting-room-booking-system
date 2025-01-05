import { Router } from "express";
import {
  createMeetingRoomBooking,
  getMeetingRoomBooking, getMyBooking,
  IsValidateBookingRoom,
  meetingRoomList,
  updateMeetingRoomBooking
} from "../controllers/booking-room";
const router = Router();

router.get('', meetingRoomList);

router.post('/create', createMeetingRoomBooking);
router.get('/list-time-slot/:id', getMeetingRoomBooking);
router.put('/update/:id', updateMeetingRoomBooking);
router.delete('/delete/:id', createMeetingRoomBooking);
router.post('/validate', IsValidateBookingRoom);

// mybooking
router.get('/my-booking', getMyBooking);
export default router;