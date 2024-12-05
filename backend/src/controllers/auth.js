"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refreshToken = exports.register = exports.singIn = void 0;
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../core/config");
const prisma = new client_1.PrismaClient();
const singIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { employeeId, password } = req.body;
    const user = yield prisma.user.findUnique({
        where: {
            employeeId: employeeId
        }
    });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    let isPasswordValid = yield bcrypt.compare(password, (_a = user.password) !== null && _a !== void 0 ? _a : "");
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Password is not valid" });
    }
    const token = jsonwebtoken_1.default.sign({
        id: user.id,
        employeeId: user.employeeId,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        dateEmployment: user.dateEmployment,
        avatar: user.avatar
    }, config_1.JWT_SECRET, { expiresIn: "24h", algorithm: "HS256" });
    // Save token in session
    req.session.token = token;
    return res.status(200).json({
        message: "Sign in success", user: {
            employeeId: user.employeeId,
            email: user.email,
            name: user.name,
            lastName: user.lastName,
            avatar: user.avatar,
            dateEmployment: user.dateEmployment
        }, token: token
    });
});
exports.singIn = singIn;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { employeeId, password, confirmPassword, email, name, lastName, dateEmployment } = req.body;
    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Password not match" });
    }
    let user = yield prisma.user.findUnique({
        where: {
            employeeId: employeeId
        }
    });
    if (user) {
        return res.status(400).json({ message: "User already exists" });
    }
    const hash = yield bcrypt.hash(password, 12);
    // Save user
    user = yield prisma.user.create({
        data: {
            employeeId: employeeId,
            password: hash,
            email: email,
            name: name,
            lastName: lastName,
            dateEmployment: dateEmployment
        }
    });
    // Token
    const token = jsonwebtoken_1.default.sign({
        id: user.id,
        employeeId: user.employeeId,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        dateEmployment: user.dateEmployment,
        avatar: user.avatar
    }, config_1.JWT_SECRET, { expiresIn: "24h", algorithm: "HS256" });
    // Save token in session
    return res.json({ message: "Register success", user: user, token: token });
});
exports.register = register;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.session.token;
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        const newToken = jsonwebtoken_1.default.sign({
            id: decoded.id,
            employeeId: decoded.employeeId,
            email: decoded.email,
            name: decoded.name,
            lastName: decoded.lastName,
            dateEmployment: decoded.dateEmployment,
            avatar: decoded.avatar
        }, config_1.JWT_SECRET, { expiresIn: "1h", algorithm: "HS256" });
        return res.status(200).json({ message: "Token refreshed", token: newToken });
    }
    catch (error) {
        return res.status(401).json({ message: "Access denied. Invalid token" });
    }
});
exports.refreshToken = refreshToken;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    req.session.token = null;
    return res.status(200).json({ message: "Logout success" });
});
exports.logout = logout;
