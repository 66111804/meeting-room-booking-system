import { Router } from "express";
import {dashboardController, getBlogsController} from "../controllers/dashboardController";

const router = Router();

router.get('/stats', dashboardController);

router.get('/blogs',getBlogsController);

export default router;