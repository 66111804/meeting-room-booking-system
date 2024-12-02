// auth middleware
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../core/config";

const authMiddleware = (req: any, res: any, next: any) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).send('Access denied. No token provided.');
    }
    const tokenParts = token.split(' ');
    if (tokenParts.length !== 2) {
        return res.status(401).send('Access denied. Invalid token.');
    }

    const [scheme, tokenValue] = tokenParts;
    if (scheme !== 'Bearer') {
        return res.status(401).send('Access denied. Invalid token.');
    }

    try {
        (req as any).user = jwt.verify(tokenValue, JWT_SECRET);
    } catch (error) {
        return res.status(401).json({ message: "Access denied. Invalid token" });
    }
    next();
};

export { authMiddleware };