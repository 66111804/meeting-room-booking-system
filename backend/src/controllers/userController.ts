import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export const updateUser = async (req: any, res: any) =>
{
  try
  {
    const id = req.user.id;
    if(req.user === undefined)
    {
      return res.status(403).json({ message: "You don't have permission to update this user" });
    }


    let { name, lastName } = req.body;
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