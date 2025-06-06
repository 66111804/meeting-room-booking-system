import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../core/config";
import { singInService } from "../service/authService";

const prisma = new PrismaClient();

export const singIn = async (req: any, res: any) => {
  try {
    const result = await singInService(req.body.employeeId, req.body.password);
    return res.status(200).json(result);
  }catch (e:any) {
    return res.status(400).json({ message: e.message });
  }
};

export const register = async (req: any, res: any) => {
  try {
    let { employeeId, password, confirmPassword, email, name, lastName, dateEmployment } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password not match" });
    }
    let user = await prisma.user.findUnique({
      where: {
        employeeId: employeeId
      }
    });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 12);
    // Save user
    user = await prisma.user.create({
      data: {
        employeeId: employeeId,
        password: hash,
        email: email,
        name: name,
        lastName: lastName,
        dateEmployment: dateEmployment
      }
    });
    // Token
    const token = jwt.sign({
      id: user.id,
      employeeId: user.employeeId,
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      dateEmployment: user.dateEmployment,
      avatar: user.avatar
    }, JWT_SECRET, { expiresIn: "2h", algorithm: "HS256" });
    // Save token in session
    return res.json({ message: "Register success", user: user, token: token });
  }catch (e) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const refreshToken = async (req: any, res: any) => {
  try {
    const token = req.session.token;
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const newToken = jwt.sign({
        id: decoded.id,
        employeeId: decoded.employeeId,
        email: decoded.email,
        name: decoded.name,
        lastName: decoded.lastName,
        dateEmployment: decoded.dateEmployment,
        avatar: decoded.avatar
      }, JWT_SECRET, { expiresIn: "1h", algorithm: "HS256" });
      return res.status(200).json({ message: "Token refreshed", token: newToken });
    } catch (error) {
      return res.status(401).json({ message: "Access denied. Invalid token" });
    }
  }catch (e) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req: any, res: any) => {
  try {
    req.session.token = null;
    return res.status(200).json({ message: "Logout success" });
  }catch (e) {
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const isLogin = async (req: any, res: any) =>
{
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id
      }
    });

    const token = req.token;
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // update token
    const newToken = jwt.sign({
      id: user.id,
      employeeId: user.employeeId,
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      dateEmployment: user.dateEmployment,
      avatar: user.avatar
    }, JWT_SECRET, { expiresIn: "24h", algorithm: "HS256" });

    return res.status(200).json({ message: "OK" , user: {
      id: user.id,
      employeeId: user.employeeId,
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      avatar: user.avatar,
      position: user.position,
      department: user.department,
      dateEmployment: user.dateEmployment
      }, token: newToken });

  }catch (e) {
    return res.status(500).json({ message: "Internal server error" });
  }
}