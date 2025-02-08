import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


// ----------- Role Service ------------
export const roleList = async (req: any, res: any) => {
  try {
    let { page, limit, search } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    let where = {};
    if (search) {
      where = {
        OR: [
          { name: { startsWith: search },}]
      };
    }

    const roles = await prisma.role.findMany({
      where,
      include: {
        permissions: {
          include: {
            Permission: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    const total = await prisma.role.count({ where });
    const totalPages = Math.ceil(total / limit);
    const rolesFormatted = roles.map((role) => {
      return {
        ...role,
        permissions: role.permissions.map((perm) => perm.Permission.name),
      };
    });

    return { roles:rolesFormatted, total, totalPages , currentPage: page, limit};
  } catch (e:any) {
    res.status(500).json({ error: e.message });
  }
};

export const roleCreate = async (req: any, res: any) => {
    const { name } = req.body;

    if(!name) {
      throw new Error("Role name is required");
    }
    // Check if role already exists
    const roleExist = await prisma.role.findFirst({
      where: {
        name,
      },
    });

    if (roleExist) {
      throw new Error("Role already exists");
    }

   return prisma.role.create({
     data: {
       name,
     },
   });
};

export const validateRoleNameService = async (req: any, res: any): Promise<boolean> => {

  const { name } = req.params;
  const roleExist = await prisma.role.findFirst({
    where: {
      name,
    },
  });
  return !!roleExist; // return true if role exist
};

// ----------- Permission Service ------------
export const permissionList = async (req: any, res: any) => {
    let { page, limit, search } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    let where = {};
    if (search) {
      where = {
        OR: [
          { name: { startsWith: search },},
          { description: { startsWith: search },},
        ]
      };
    }

    const permissions = await prisma.permission.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
    });

    const total = await prisma.permission.count({ where });
    const totalPages = Math.ceil(total / limit);
    return { permissions, total, currentPage: page, limit, totalPages };

};


export const generateDefaultPermissionsService = async () => {
  const permissions = [
    {
      name: "user create",
    },
    {
      name: "user read",
    },
    {
      name: "user update",
    },
    {
      name: "user delete",
    },
    {
      name: "role create",
    },
    {
      name: "role read",
    },
    {
      name: "role update",
    },
    {
      name: "role delete",
    },
    {
    name: 'meetingRoom create',
    },
    {
      name: "meetingRoom update",
    },
    {
      name: "meetingRoom delete",
    },{
      name: "meetingRoom read",
    },
    {
      name: "bookingRoom create",
    },
    {
      name: "bookingRoom update",
    },
    {
      name: "bookingRoom delete",
    },
    {
      name: "bookingRoom read",
    },
    {
      name: "bookingMultipleRoom create",
    }
  ];

  const permissionToAdd = [];
  // Check if permission already exists
  for (const perm of permissions) {
    const permissionExist = await prisma.permission.findFirst({
      where: {
        name: perm.name,
      },
    });
    if (!permissionExist) {
      permissionToAdd.push(perm);
    }
  }
  // Add permissions to database
  if (permissionToAdd.length > 0) {
    return prisma.permission.createMany({
      data: permissionToAdd,
    });
  }

  // Create role admin
  const roleExist = await prisma.role.findFirst({
    where: {
      name: "admin",
    },
  });

  if (!roleExist) {
    const role = await prisma.role.create({
      data: {
        name: "admin",
      },
    });

    // Add all permissions to admin role
    const permissions = await prisma.permission.findMany();
    const rolePermissions = permissions.map((perm) => {
      return {
        roleId: role.id,
        permissionId: perm.id,
      };
    });

    return prisma.rolePermission.createMany({
      data: rolePermissions,
    });
  }

  return permissionToAdd;
};


export const permissionAssignService = async (req: any, res: any) => {
  // noinspection DuplicatedCode
  const { roleId, permissionId } = req.body;
  if (!roleId || !permissionId) {
    throw new Error("Role and permission id is required");
  }

  const roleExist = await prisma.role.findFirst({
    where: {
      id: roleId,
    },
  });

  if (!roleExist) {
    throw new Error("Role not found");
  }

  const permissionExist = await prisma.permission.findFirst({
    where: {
      id: permissionId,
    },
  });

  if (!permissionExist) {
    throw new Error("Permission not found");
  }

  const rolePermissionExist = await prisma.rolePermission.findFirst({
    where: {
      roleId,
      permissionId,
    },
  });

  if (rolePermissionExist) {
    throw new Error("Permission already assigned to role");
  }

  return prisma.rolePermission.create({
    data: {
      roleId,
      permissionId,
    },
  });
};

export const revokePermissionService = async (req: any, res: any) => {
  // noinspection DuplicatedCode
  const { roleId, permissionId } = req.body;
  if (!roleId || !permissionId) {
    throw new Error("Role and permission id is required");
  }

  const roleExist = await prisma.role.findFirst({
    where: {
      id: roleId,
    },
  });

  if (!roleExist) {
    throw new Error("Role not found");
  }

  const permissionExist = await prisma.permission.findFirst({
    where: {
      id: permissionId,
    },
  });

  if (!permissionExist) {
    throw new Error("Permission not found");
  }

  const rolePermissionExist = await prisma.rolePermission.findFirst({
    where: {
      roleId,
      permissionId,
    },
  });

  if (!rolePermissionExist) {
    throw new Error("Permission not assigned to role");
  }

  return prisma.rolePermission.delete({
    where: {
      id: rolePermissionExist.id,
    },
  });

}