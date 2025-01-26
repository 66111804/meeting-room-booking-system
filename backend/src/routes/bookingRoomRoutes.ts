import { Router } from "express";
import {
  cancelMeetingRoomBooking,
  createMeetingRoomBooking, getBookingById,
  getMeetingRoomBooking, getMyBooking,
  IsValidateBookingRoom,
  meetingRoomList, updateBooking
} from "../controllers/bookingRoomController";
const router = Router();

router.get('', meetingRoomList);

router.post('/create', createMeetingRoomBooking);
router.get('/list-time-slot/:id', getMeetingRoomBooking);
// router.put('/update/:id', updateMeetingRoomBooking);
router.delete('/delete/:id', createMeetingRoomBooking);
router.post('/validate', IsValidateBookingRoom);

// mybooking
router.get('/my-booking', getMyBooking);
router.delete('/my-booking/:id/cancel', cancelMeetingRoomBooking);
router.get('/my-booking/:id/info', getBookingById);
router.put('/my-booking/:id/update', updateBooking);

export default router;