"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
// auth middleware
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../core/config");
const authMiddleware = (req, res, next) => {
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
        req.user = jsonwebtoken_1.default.verify(tokenValue, config_1.JWT_SECRET);
    }
    catch (error) {
        return res.status(401).json({ message: "Access denied. Invalid token" });
    }
    next();
};
exports.authMiddleware = authMiddleware;
