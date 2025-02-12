import { Router } from "express";
import { dashboardController } from "../controllers/dashboardController";

const router = Router();

router.get('/stats', dashboardController);


export default router;