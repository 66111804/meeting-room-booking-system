// export class User {
//   id?: number;
//   // username?: string;
//   employeeId?: string;
//   password?: string;
//   name?: string;
//   lastName?: string;
//   token?: string;
//   email?: string;
// }

export interface UserList {
  users:      User[];
  total:      number;
  totalPages: number;
  current:    number;
}
export interface IUserResponse {
  user: User
}

export interface User {
  id: number
  employeeId: string
  email: string
  name: string
  lastName: string
  avatar: any
  dateEmployment: string
  position: string
  department: string
  status: string
  createdAt: string
  updatedAt: string
  roles?: Role[]
  permissions?: string[]
  hasRole?: HasRole[]
}
export interface UserInformation {
  id: number
  employeeId: string
  email: string
  name: string
  lastName: string
  avatar: any
  dateEmployment: string
  position: string
  department: string
  status: string
  createdAt: string
  updatedAt: string
  roles?: Role[]
  permissions?: string[]
  hasRole?: HasRole[]
}

export interface Role {
  id: number
  userId: number
  roleId: number
  createdAt: string
  updatedAt: string
  Role: Role2
}

export interface Role2 {
  id: number
  name: string
  createdAt: string
  updatedAt: string
  permissions: Permission[]
}
export interface Permission {
  id: number
  roleId: number
  permissionId: number
  createdAt: string
  updatedAt: string
  Permission: Permission2
}

export interface Permission2 {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export interface HasRole {
  id: number
  name: string
}
