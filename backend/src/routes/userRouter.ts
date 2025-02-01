import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { updateUserPassword, updateUserProfile } from "../controllers/userController";
import { upload } from "../shared/uploadFile";

const router = Router();


router.post('/update' , upload.single('avatar') , updateUserProfile);
router.post('/update-password', updateUserPassword);

export default router;