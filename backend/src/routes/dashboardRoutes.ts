import { Router } from "express";
import {
    dashboardController,
    getBlogController,
    getBlogsController,
    getBookingController
} from "../controllers/dashboardController";

const router = Router();

router.get('/stats', dashboardController);

router.get('/blogs',getBlogsController);
router.get('/blog/:id/info', getBlogController);

// booking-room
router.get('/bookings',getBookingController);

export default router;