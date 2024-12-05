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
const express_session_1 = require("express-session");
class PrismaSessionStore extends express_session_1.Store {
    constructor(prismaClient) {
        super();
        this.prismaClient = prismaClient;
        this.prisma = prismaClient;
    }
    get(sid, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const session = yield this.prisma.session.findUnique({
                    where: { id: sid },
                });
                if (!session || session.expires < new Date()) {
                    return callback(null, null);
                }
                callback(null, JSON.parse(session.sessionData));
            }
            catch (err) {
                callback(err);
            }
        });
    }
    set(sid, sessionData, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const expires = ((_a = sessionData.cookie) === null || _a === void 0 ? void 0 : _a.expires) || new Date(Date.now() + 86400000); // 1 day
                yield this.prisma.session.upsert({
                    where: { id: sid },
                    update: {
                        sessionData: JSON.stringify(sessionData),
                        expires,
                    },
                    create: {
                        id: sid,
                        sessionData: JSON.stringify(sessionData),
                        expires,
                    },
                });
                callback(null);
            }
            catch (err) {
                callback(err);
            }
        });
    }
    destroy(sid, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.prisma.session.delete({ where: { id: sid } });
                callback(null);
            }
            catch (err) {
                callback(err);
            }
        });
    }
}
exports.default = PrismaSessionStore;
