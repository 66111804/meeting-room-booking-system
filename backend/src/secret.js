"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const generateSecret = () => crypto_1.default.randomBytes(32).toString("hex");
const JWT_SECRET = generateSecret();
const APP_SECRET = generateSecret();
const envFilePath = ".env";
try {
    if (fs_1.default.existsSync(envFilePath)) {
        const data = fs_1.default.readFileSync(envFilePath, "utf8");
        const lines = data.split("\n");
        const updatedLines = lines.map((line) => {
            if (line.startsWith("JWT_SECRET")) {
                return `JWT_SECRET=${JWT_SECRET}`;
            }
            else if (line.startsWith("APP_SECRET")) {
                return `APP_SECRET=${APP_SECRET}`;
            }
            return line;
        });
        const updatedData = updatedLines.join("\n");
        fs_1.default.writeFileSync(envFilePath, updatedData);
    }
    else {
        const data = `JWT_SECRET=${JWT_SECRET}\nAPP_SECRET=${APP_SECRET}\n`;
        fs_1.default.writeFileSync(envFilePath, data);
    }
    console.table({ JWT_SECRET, APP_SECRET });
    console.log("Secrets generated and saved to .env file");
}
catch (e) {
    console.log("Error generating secrets");
    console.error(e);
    process.exit(1);
}
