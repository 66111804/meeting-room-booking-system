import {TokenStorageService} from '../../core/services/token-storage.service';

const tokenStorageService = new TokenStorageService();

export const  isRoleMatched = (role: string[]): boolean =>{
  const roles = tokenStorageService.getRole();
  for (let i = 0; i < role.length; i++) {
    if (roles.find((r) => r.name === role[i])) {
      return true;
    }
  }
  return false;
}

export const isPermissionMatched = (permission: string[]): boolean => {
  const permissions = tokenStorageService.getPermissions();
  for (let i = 0; i < permission.length; i++) {
    if (permissions.includes(permission[i])) {
      return true;
    }
  }
  return false;
}
