

import {
    generateDefaultPermissionsService, permissionAssignService,
    permissionList, revokePermissionService,
    roleCreate,
    roleList,
    validateRoleNameService
} from "../../service/rolePermissionService";


// ----------- GET ALL ROLES -----------
export const getAllRoles = async (req: any, res: any) => {
    try {
        const roles = await roleList(req, res);
        //
        res.json({ message: "success", data: roles });
    }catch (error:any) {
        res.status(500).json({ error: error.message });
    }
};

// ----------- CREATE ROLE -----------
export const createRole = async (req: any, res: any) => {
    try {
        const role = await roleCreate(req, res);
        res.json({ message: "success", data: role });
    }catch (error:any) {
        res.status(400).json({message: error.message});
    }
};

export const validateRoleName = async (req: any, res: any) => {
    try {
        const roleExist = await validateRoleNameService(req, res);
        res.json({ message: "success", data: roleExist });
    }catch (error:any) {
        res.status(500).json({ error: error.message });
    }
};


// ----------- GET ALL PERMISSIONS -----------
export const getAllPermissions = async (req: any, res: any) => {
    try {
        const permissions = await permissionList(req, res);
        res.json({ message: "success", data: permissions });
    }catch (error:any) {
        res.status(500).json({ error: error.message });
    }
};

export const permissionAssign = async (req: any, res: any) => {
    try {
        const permissions = await permissionAssignService(req, res);
        res.json({ message: "success", data: permissions });
    }catch (error:any) {
        res.status(500).json({ error: error.message });
    }
};

export const revokePermission = async (req: any, res: any) => {
    try {
        const permissions = await revokePermissionService(req, res);
        res.json({ message: "success", data: permissions });
    }catch (error:any) {
        res.status(500).json({ error: error.message });
    }
};
