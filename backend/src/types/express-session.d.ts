import "express-session";

declare module 'express-session' {
  interface SessionData {
    views?: number; // เพิ่ม property views
  }
}