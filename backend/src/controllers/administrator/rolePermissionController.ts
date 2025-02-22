

import {
    permissionAssignService,
    permissionList, revokePermissionService,
    roleCreateService, roleDeleteService,
    roleList, roleUpdateService,
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
        const role = await roleCreateService(req, res);
        res.json({ message: "success", data: role });
    }catch (error:any) {
        res.status(400).json({message: error.message});
    }
};

// ----------- UPDATE ROLE -----------
export const updateRole = async (req: any, res: any) => {
    try {
        const role = await roleUpdateService(req, res);
        res.json({ message: "success", data: role });
    }catch (error:any) {
        res.status(500).json({ message: error.message });
    }
};

// ----------- DELETE ROLE -----------
export const deleteRole = async (req: any, res: any) => {
    try {
        const role = await roleDeleteService(req, res);
        res.json({ message: "success", data: role });
    }catch (error:any) {
        res.status(500).json({ message: error.message });
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
