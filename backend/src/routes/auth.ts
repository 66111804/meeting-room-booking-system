import { Router } from 'express';
import {
    checkUsername,
    checkUsernameId, deleteAccount,
    hasSignedIn,
    register,
    singIn,
    singOut,
    updateUsername
} from '../controllers/auth';

const router = Router();

router.post('/sign-in', async (req:any, res:any) =>{ await singIn(req, res)});

router.post('/signup', async (req:any, res:any) =>{ await register(req, res)});

router.get('/check-username/:username', async (req:any, res:any) =>{ await checkUsername(req, res)});

router.post('/check-username', async (req:any, res:any) =>{
    await checkUsernameId(req, res)
});

router.post('/update-username', async (req:any, res:any) =>{
    await updateUsername(req, res)
});

router.post('/delete-account', async (req:any, res:any) =>{ await  deleteAccount(req, res)});

router.get('/has-sign-in/:username', async (req:any, res:any) =>{ await hasSignedIn(req, res)});

router.post('/sign-out', async (req:any, res:any) =>{ await singOut(req, res)});

export default router;