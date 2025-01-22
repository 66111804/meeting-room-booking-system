import { Router } from "express";
import {
  cancelMeetingRoomBooking,
  createMeetingRoomBooking,
  getMeetingRoomBooking, getMyBooking,
  IsValidateBookingRoom,
  meetingRoomList,
  updateMeetingRoomBooking
} from "../controllers/bookingRoomController";
const router = Router();

router.get('', meetingRoomList);

router.post('/create', createMeetingRoomBooking);
router.get('/list-time-slot/:id', getMeetingRoomBooking);
router.put('/update/:id', updateMeetingRoomBooking);
router.delete('/delete/:id', createMeetingRoomBooking);
router.post('/validate', IsValidateBookingRoom);

// mybooking
router.get('/my-booking', getMyBooking);
router.delete('/my-booking/:id/cancel', cancelMeetingRoomBooking);
export default router;