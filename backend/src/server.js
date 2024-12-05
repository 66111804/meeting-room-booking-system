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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_list_endpoints_1 = __importDefault(require("express-list-endpoints"));
const http_1 = require("http");
const express_session_1 = __importDefault(require("express-session"));
const auth_1 = __importDefault(require("./routes/auth"));
const PrismaSessionStore_1 = __importDefault(require("./core/PrismaSessionStore"));
const config_1 = require("./core/config");
const client_1 = require("@prisma/client");
const node_cron_1 = __importDefault(require("node-cron"));
dotenv_1.default.config();
const PORT = process.env.PORT || 3000;
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// Access-Control-Allow-Origin
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});
const prisma = new client_1.PrismaClient();
app.use((0, express_session_1.default)({
    store: new PrismaSessionStore_1.default(prisma),
    secret: config_1.APP_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        httpOnly: false, // allow client-side JavaScript to access the cookie
    }
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((req, res, next) => {
    // console.log("session", req.body);
    next();
});
// app.get("/", (req:Request, res:Response) => {
//     const session = req.session;
//
//     if ((req.session as any).views) {
//         (req.session as any).views++;
//     } else {
//         (req.session as any).views = 1;
//     }
//
//     res.json({ status: "server is running..." , session});
// });
app.get('/', (req, res) => {
    if (req.user) {
        res.send(`User ID: ${req.user.id}, Email: ${req.user.email}`);
    }
    else {
        res.status(401).send('Unauthorized');
    }
});
app.get("/api", (req, res) => {
    res.json({ status: "server is running96" });
});
app.use('/api/auth', auth_1.default);
app.get('/api/sessions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sessions = yield prisma.session.findMany();
    res.json(sessions);
}));
// List all routes
console.table((0, express_list_endpoints_1.default)(app));
// Task to delete expired sessions
const task = node_cron_1.default.schedule('0 * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    const sessions = yield prisma.session.deleteMany({
        where: {
            expires: {
                lt: now
            }
        }
    });
    console.log(`Deleted ${sessions.count} sessions, expired sessions at ${now.toString()}`);
}));
// Start server
httpServer.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
