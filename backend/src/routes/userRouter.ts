import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { updateUser } from "../controllers/userController";
import { upload } from "../shared/uploadFile";

const router = Router();


router.post('/update' , upload.single('avatar') , updateUser);


export default router;