import express from "express";
import dotenv from "dotenv";
import routes from "express-list-endpoints";
import { createServer } from "http";
import session from "express-session";

// const prisma = new PrismaClient();
dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();
const httpServer = createServer(app);

app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));

app.get("/", (req, res) => {
    res.json({ status: "server is running96" });
});

// List all routes
console.table(routes(app));
// Start server
httpServer.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
