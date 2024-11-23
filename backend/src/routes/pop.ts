import { Router } from 'express';
import {popScore, popTopScore} from "../controllers/pop.ts";


const router = Router();

router.get('/score', async (req:any, res:any) => await popScore(req, res));



export default router;