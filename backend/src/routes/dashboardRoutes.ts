import { Router } from "express";
import {dashboardController, getBlogController, getBlogsController} from "../controllers/dashboardController";

const router = Router();

router.get('/stats', dashboardController);

router.get('/blogs',getBlogsController);
router.get('/blog/:id/info', getBlogController);

export default router;