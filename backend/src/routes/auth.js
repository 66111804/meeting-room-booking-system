"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const auth_2 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.post('/sign-in', (req, res) => __awaiter(void 0, void 0, void 0, function* () { yield (0, auth_1.singIn)(req, res); }));
//
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () { yield (0, auth_1.register)(req, res); }));
//
router.get('/is-login', auth_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({ message: "User is logged in", user: req.user });
}));
router.post('/sign-out', auth_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () { yield (0, auth_1.logout)(req, res); }));
exports.default = router;
