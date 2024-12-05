// auth middleware
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../core/config";

const authMiddleware = (req: any, res: any, next: any) => {
    // x-access-token
    const token = req.header('x-access-token');
    // const token = req.header('Authorization');
    if (!token) {
        return res.status(401).send('Access denied. No token provided.');
    }

    try {
        req.user = jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return res.status(401).json({ message: "Access denied. Invalid token" });
    }
    next();
};

export { authMiddleware };