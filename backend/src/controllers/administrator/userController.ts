import { PrismaClient } from "@prisma/client";
import { ValidateResponse } from "../../shared/Validate";
import * as bcrypt from "bcrypt";
import { uploadDir } from "../../shared/uploadFile";
import path from "path";

const prisma = new PrismaClient();


export const getUsers = async (req: any, res: any) => {
  try {
    let { page, limit, search } = req.query;
    // const token = req.headers.authorization.split(" ")[1];
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    let where = {};
    if (search) {
      where = {
        OR: [
          { name: { startsWith: search } },
          { lastName: { startsWith: search } },
          { email: { startsWith: search } },
          { employeeId: { startsWith: search } },
          { position: { startsWith: search } },
          { department: { startsWith: search } },
        ]
      };
    }

    const users = await prisma.user.findMany({
      include: {
        roles: {
          include: {
            Role: {
              include: {
                permissions: {
                  include: {
                    Permission: true,
                  },
                },
              },
            },
          },
        },
      },
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy:{
        updatedAt:"desc"
      }
    });

    const total = await prisma.user.count({ where });
    const totalPages = Math.ceil(total / limit);
    const usersWithoutPassword = users.map(({ password, ...rest }) => rest);
    const formattedUsers = usersWithoutPassword.map((user) => ({
      ...user,
      permissions: [
        ...new Set(
          user.roles.flatMap((role) =>
            role.Role.permissions.map((perm) => perm.Permission.name)
          )
        ),
      ],
    }));

    return res.status(200).json({ users:formattedUsers, total, totalPages,current:page });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUser = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        roles: {
          include: {
            Role: {
              include: {
                permissions: {
                  include: {
                    Permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userWithoutPassword = { ...user, password: undefined };
    const formattedUser = {
      ...userWithoutPassword,
      permissions: [
        ...new Set(
          user.roles.flatMap((role) =>
            role.Role.permissions.map((perm) => perm.Permission.name)
          )
        ),
      ],
    };

    return res.status(200).json({ user: formattedUser });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const employeeIdValidation = async (req: any, res: any) => {
  try {
    const { employeeId } = req.query;
    const id = req.params.id;
    if(!employeeId) return res.status(400).json({ message: "Employee ID is required" });

    if(id){
      const user = await prisma.user.findFirst({
        where: {
          employeeId,
          NOT:{
            id:parseInt(id)
          }
        },
      });
      const response:ValidateResponse = { valid: !user };
      return res.status(200).json(response);
    }
    const user = await prisma.user.findFirst({
      where: {
        employeeId,
      },
    });
    const response:ValidateResponse = { valid: !user };
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error validating employee ID:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createUser = async (req: any, res: any) => {
  try {
    const { name, lastName, employeeId, email, password, position, department, status, roles } = req.body;

    if(!name) return res.status(400).json({ message: "Name is required" });
    if(!lastName) return res.status(400).json({ message: "Last name is required" });
    if(!employeeId) return res.status(400).json({ message: "Employee ID is required" });
    if(!email) return res.status(400).json({ message: "Email is required" });
    if(!password) return res.status(400).json({ message: "Password is required" });
    if(!position) return res.status(400).json({ message: "Position is required" });
    if(!department) return res.status(400).json({ message: "Department is required" });
    // if(!status) return res.status(400).json({ message: "Status is required" });

    const file = req.file;
    const avatar = file ? file.filename : null;

    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        lastName,
        employeeId,
        email,
        password: hash,
        position,
        avatar: avatar || null,
        department,
        status: status || "active",
        roles: {
          connect:roles ? roles.map((id:number) => ({ id })) : [],
        },
      },
    });

    const userWithoutPassword = { ...user, password: undefined };


    return res.status(201).json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUser = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    let { name, lastName, employeeId, email, password, position, department, status, roles } = req.body;

    // noinspection DuplicatedCode
    if(!name) return res.status(400).json({ message: "Name is required" });
    if(!lastName) return res.status(400).json({ message: "Last name is required" });
    if(!employeeId) return res.status(400).json({ message: "Employee ID is required" });
    if(!email) return res.status(400).json({ message: "Email is required" });
    if(!position) return res.status(400).json({ message: "Position is required" });
    if(!department) return res.status(400).json({ message: "Department is required" });

   const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const file = req.file;
    const avatar = file ? file.filename : user.avatar;

    const hash = password ? await bcrypt.hash(password, 12) : user.password;

    status = status || user.status;
    const updatedUser = await prisma.user.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name,
        lastName,
        employeeId,
        email,
        password: hash,
        position,
        avatar,
        department,
        status: status || "active",
        roles: {
          set: roles ? roles.map((id:number) => ({ id })) : [],
        },
      },
    });

    const userWithoutPassword = { ...updatedUser, password: undefined };

    return res.status(200).json({ user: userWithoutPassword });
  }
  catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUser = async (req: any, res: any) => {

  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if(user.id === 1){
      return res.status(400).json({ message: "Cannot delete default user" });
    }

    // Delete image avatar
    try {
      if (user.avatar) {
        const fs = require("fs");
        const path = require('path');
        const filePath = path.join(`${uploadDir}/${user.avatar}`);
        fs.unlinkSync(filePath);

      }
    }catch (error) {
      console.error("Error deleting user avatar:", error);
    }

    await prisma.user.delete({
      where: {
        id: parseInt(id),
      },
    });

    return res.status(200).json({ message: "User deleted successfully" });
  }
  catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }

};


const validateData = (data: any) => {
  const { name, lastName, employeeId, email, password, position, department } = data;
  if(!name) return "Name is required";
  if(!lastName) return "Last name is required";
  if(!employeeId) return "Employee ID is required";
  if(!email) return "Email is required";
  if(!password) return "Password is required";
  if(!position) return "Position is required";
  if(!department) return "Department is required";
  return null;
}