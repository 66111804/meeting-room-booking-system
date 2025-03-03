import { Router } from "express";
import { isLogin, logout, register, singIn } from "../controllers/authController";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.post('/sign-in', async (req:any, res:any) =>{ await singIn(req, res)});
//
router.post('/register', async (req:any, res:any) =>{ await register(req, res)});
//
router.get('/is-login', authMiddleware, isLogin);
router.post('/sign-out', authMiddleware, async (req: any, res: any) => { await logout(req, res)});

export default router;