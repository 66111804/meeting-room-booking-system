import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUsersService = async (req: any, res: any) => {
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
    hasRole:[
      ...new Set(
        user.roles.map((role) => ({id:role.Role.id, name:role.Role.name}))
      )
    ]
  }));

  return res.status(200).json({ users:formattedUsers, total, totalPages,current:page });
};

export const getUserService = async (req: any, res: any) => {
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
    hasRole:[
      ...new Set(
        user.roles.map((role) => ({id:role.Role.id, name:role.Role.name}))
      )
    ]
  };

  return res.status(200).json({ user: formattedUser });
};

export const roleAssignUserService = async (req: any, res: any) => {
  const { roleId, userId } = req.body;
  if (!roleId || !userId) {
    return res.status(400).json({ message: "Role and user id is required" });
  }

  const roleExist = await prisma.role.findFirst({
    where: {
      id: roleId,
    },
  });

  if (!roleExist) {
    return res.status(404).json({ message: "Role not found" });
  }

  const userExist = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });

  if (!userExist) {
    return res.status(404).json({ message: "User not found" });
  }

  const roleUserExist = await prisma.userRole.findFirst({
    where: {
      roleId,
      userId,
    },
  });

  if (roleUserExist) {
    return res.status(400).json({ message: "Role already assigned to user" });
  }

  await prisma.userRole.create({
    data: {
      roleId,
      userId,
    },
  });

  return res.status(200).json({ message: "Role assigned to user" });
};

export const revokeRoleUserService = async (req: any, res: any) => {
  const { roleId, userId } = req.body;
  if (!roleId || !userId) {
    return res.status(400).json({ message: "Role and user id is required" });
  }
  const roleExist = await prisma.userRole.findFirst({
    where: {
      roleId,
      userId,
    },
  });

  if (!roleExist) {
    return res.status(404).json({ message: "Role not found" });
  }

  await prisma.userRole.delete({
    where: {
      id: roleExist.id,
    },
  });

  return res.status(200).json({ message: "Role revoked from user" });
};

export const roleAssignUserAllService = async (req: any, res: any) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "User id is required" });
  }

  const userExist = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });

  if (!userExist) {
    return res.status(404).json({ message: "User not found" });
  }

  const roles = await prisma.role.findMany();

  for (const role of roles) {
    // check if role is already assigned to user
    const roleUserExist = await prisma.userRole.findFirst({
      where: {
        roleId: role.id,
        userId: userId,
      },
    });

    if (!roleUserExist) {
      await prisma.userRole.create({
        data: {
          roleId: role.id,
          userId: userId,
        },
      });
    }
  }

  return res.status(200).json({ message: "All roles assigned to user" });
};

export const revokeRoleUserAllService = async (req: any, res: any) => {
  const { userId , isRes } = req.body;
  console.log(req.body);
  if (!userId) {
    return res.status(400).json({ message: "User id is required" });
  }
  const _userId = typeof userId === "string" ? parseInt(userId) : userId;
  const userExist = await prisma.user.findFirst({
    where: {
      id:_userId
    },
  });

  if (!userExist) {
    return res.status(404).json({ message: "User not found" });
  }

  await prisma.userRole.deleteMany({
    where: {
      userId: userId,
    },
  });


  if(isRes == true)
  {
    return;
  }
  return res.status(200).json({ message: "All roles revoked from user" });
};