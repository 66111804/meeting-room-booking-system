// import express from "express";
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import routes from "express-list-endpoints";
import { createServer } from "http";
import auth from "./routes/auth";
import { PrismaClient } from "@prisma/client";
import cron from "node-cron";

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();
const httpServer = createServer(app);
// Access-Control-Allow-Origin
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});
const prisma = new PrismaClient();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) =>{
    // console.log("session", req.body);
    next();
});

app.get("/", (req:Request, res:Response) => {
    res.json({ status: "server is running..."});
});

app.get("/api", (req, res) => {
    res.json({ status: "server is running96" });
});

// ----------------- Routes -----------------
app.use('/api/auth',auth);

app.get('/api/sessions', async (req, res) => {
    const sessions = await prisma.session.findMany();
    res.json(sessions);
});
// List all routes
console.table(routes(app));


// Task to delete expired sessions
const task = cron.schedule('0 * * * *', async () => {
    const now = new Date();

    const sessions = await prisma.session.deleteMany({
        where: {
            expires: {
                lt: now
            }
        }
    })

    console.log(`Deleted ${sessions.count} sessions, expired sessions at ${now.toString()}`);
});


// Start server
httpServer.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
