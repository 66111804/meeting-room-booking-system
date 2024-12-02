import dotenv from "dotenv";

dotenv.config({ path: __dirname + "/.env" });

export const JWT_SECRET = process.env.JWT_SECRET || "secret";
export const APP_SECRET = process.env.APP_SECRET || "secret";