import { PrismaClient } from "@prisma/client";

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
          { name: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { employeeId: { contains: search, mode: "insensitive" } }
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
