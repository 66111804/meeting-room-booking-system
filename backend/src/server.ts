// import express from "express";
import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import routes from "express-list-endpoints";
import { createServer } from "http";
import auth from "./routes/authRoutes";
import { PrismaClient } from "@prisma/client";
import administrator from "./routes/administratorRoutes";
import { authMiddleware } from "./middlewares/auth";
import fs from "fs";
import { upload, uploadDir } from "./shared/uploadFile";
import bookingRoom from "./routes/bookingRoomRoutes";
import slotTimeRoutes from './routes/slotTimeRoutes';


// ----------------- Auto call routes -----------------
// create time slots for booking room
import * as slots from "./controllers/slotTimeController";
import userRouter from "./routes/userRouter";

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();
const httpServer = createServer(app);
// Access-Control-Allow-Origin
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-access-token");
    next();
});

app.options("*", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-access-token");
    res.sendStatus(200);
});

const prisma = new PrismaClient();

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.use('/files/uploads',express.static(uploadDir));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
    // console.log('Headers:', req.headers);
    // console.log('Content-Type:', req.headers['content-type']);
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
app.use('/api/user-profile',authMiddleware , userRouter);
app.use('/api/admin',authMiddleware,administrator);
app.use('/api/booking-room',authMiddleware,bookingRoom);
app.use('/api/slot-time', slotTimeRoutes);

// ----------------- Auto call routes -----------------
const headers = {
    "Content-Type": "application/json"
};
try {
    setTimeout(() => {
        fetch(`http://localhost:${PORT}/api/slot-time/generate-slots-safe`,
          {
              method: "POST",
              headers: headers}
        ).then(
          res => res.json()
        ).then().catch(
          error => console.error(error)
        )
    }, 2000);
}catch (error) {
    console.error(error);
}

// List all routes
console.table(routes(app));

// Task to delete expired sessions
// const task = cron.schedule('0 * * * *', async () => {
//     console.log(`Deleted ${sessions.count} sessions, expired sessions at ${now.toString()}`);
// });


// Start server
httpServer.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
