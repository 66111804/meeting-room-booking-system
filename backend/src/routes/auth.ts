import { Router } from "express";
import { logout, register, singIn } from "../controllers/auth";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.post('/sign-in', async (req:any, res:any) =>{ await singIn(req, res)});
//
router.post('/register', async (req:any, res:any) =>{ await register(req, res)});
//
router.get('/is-login', authMiddleware, async (req: any, res: any) => {
  res.status(200).json({ message: "User is logged in", user: req.user });
});

router.post('/sign-out', authMiddleware, async (req: any, res: any) => { await logout(req, res)});

export default router;