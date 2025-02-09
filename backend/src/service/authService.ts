import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../core/config";
const prisma = new PrismaClient();

export const singInService = async (employeeId: string, password: string) => {
  // const { employeeId, password } = req.body;
  const user = await prisma.user.findUnique({
    where: {
      employeeId: employeeId
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
    // return res.status(404).json({ message: "User not found" });
    throw new Error("User not found");
  }

  let isPasswordValid = await bcrypt.compare(password, user.password ?? "");
  if (!isPasswordValid) {
    // return res.status(401).json({ message: "Password is not valid" });
    throw new Error("Password is not valid");
  }
  const token = jwt.sign({
    id: user.id,
    employeeId: user.employeeId,
    email: user.email,
    name: user.name,
    lastName: user.lastName,
    position: user.position,
    department: user.department,
    dateEmployment: user.dateEmployment,
    avatar: user.avatar
  }, JWT_SECRET, { expiresIn: "24h", algorithm: "HS256" });

  const formattedUser = {
    ...user,
    password: undefined,
    permissions: [
      ...new Set(
        user.roles.flatMap((role) =>
          role.Role.permissions.map((perm) => perm.Permission.name)
        )
      ),
    ],
    hasRole: [
      ...new Set(
        user.roles.map((role) => ({ id: role.Role.id, name: role.Role.name }))
      )
    ]
  }

  return { user: formattedUser, token: token , message: "success" };
};