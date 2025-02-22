import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

/**
 * Update Profile
 * @param req
 * @param res
 */
export const updateUserProfile = async (req: any, res: any) =>
{
  try
  {
    const id = req.user.id;
    // noinspection PointlessBooleanExpressionJS
    if(req.user == undefined)
    {
      return res.status(403).json({ message: "You don't have permission to update this user" });
    }


    let { name, lastName } = req.body;
    // console.log({body:req.body});
    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!lastName) return res.status(400).json({ message: "Last name is required" });

    const file = req.file;
    const avatar = file ? file.filename : req.user.avatar;

    const user = await prisma.user.update({
      where: {
        id: typeof id === "string" ? parseInt(id) : id,
      },
      data: {
        name,
        lastName,
        avatar,
      },
    });

    return res.status(200).json({
      message: "User updated successfully",
      user: {
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        employeeId: user.employeeId,
        email: user.email,
        position: user.position,
        department: user.department,
        avatar: user.avatar,
        status: user.status
      },
      token: req.token
    });

  }
  catch (e)
  {
    return res.status(500).json({ message: "Internal server error" });
  }
};


/**
 * Update Password
  * @param req
  * @param res
  */
export const updateUserPassword = async (req: any, res: any) => {
  try {
    const id = req.user.id;
    // noinspection PointlessBooleanExpressionJS
    if (req.user == undefined) {
      return res.status(403).json({ message: "You don't have permission to update this user" });
    }
    let { password, newPassword } = req.body;
    if (!password) return res.status(400).json({ message: "Password is required" });
    if (!newPassword) return res.status(400).json({ message: "New password is required" });
    const user = await prisma.user.findUnique({
      where: {
        id: typeof id === "string" ? parseInt(id) : id,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const valid = await bcrypt.compare(password, user.password ?? "");
    if (!valid) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const hash = await bcrypt.hash(newPassword, 12);

    const updatedUser = await prisma.user.update({
      where: {
        id: typeof id === "string" ? parseInt(id) : id,
      },
      data: {
        password: hash,
      },
    });

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}