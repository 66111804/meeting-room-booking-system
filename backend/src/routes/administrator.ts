import { Router } from "express";
import { getUsers } from "../controllers/administrator/user";

const router = Router();

router.get('', (req, res) => {
    res.send('Administrator route');
});

router.get('/users', async (req, res) => { await getUsers(req, res) });

export default router;