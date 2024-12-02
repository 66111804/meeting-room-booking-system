import crypto from "crypto";
import fs from "fs";

const generateSecret = () => crypto.randomBytes(32).toString("hex");

const JWT_SECRET = generateSecret();
const APP_SECRET = generateSecret();
const envFilePath = ".env";
try {

  if(fs.existsSync(envFilePath)) {
    const data = fs.readFileSync(envFilePath, "utf8");
    const lines = data.split("\n");
    const updatedLines = lines.map((line) => {
      if(line.startsWith("JWT_SECRET")) {
        return `JWT_SECRET=${JWT_SECRET}`;
      } else if(line.startsWith("APP_SECRET")) {
        return `APP_SECRET=${APP_SECRET}`;
      }
      return line;
    });
    const updatedData = updatedLines.join("\n");
    fs.writeFileSync(envFilePath, updatedData);

  }else {
    const data = `JWT_SECRET=${JWT_SECRET}\nAPP_SECRET=${APP_SECRET}\n`;
    fs.writeFileSync(envFilePath, data);
  }


  console.table({JWT_SECRET, APP_SECRET});

  console.log("Secrets generated and saved to .env file");
}catch (e) {
  console.log("Error generating secrets");
  console.error(e);
  process.exit(1);
}
