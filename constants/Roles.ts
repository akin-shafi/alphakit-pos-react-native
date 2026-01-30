// User roles and permissions
export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  CASHIER = "cashier",
}

export const RolePermissions = {
  [UserRole.ADMIN]: {
    canManageBusiness: true,
    canManageUsers: true,
    canManageInventory: true,
    canViewReports: true,
    canManageSettings: true,
    canProcessSales: true,
    canManageShifts: true,
    canApproveDiscounts: true,
  },
  [UserRole.MANAGER]: {
    canManageBusiness: false,
    canManageUsers: false,
    canManageInventory: true,
    canViewReports: true,
    canManageSettings: false,
    canProcessSales: true,
    canManageShifts: true,
    canApproveDiscounts: true,
  },
  [UserRole.CASHIER]: {
    canManageBusiness: false,
    canManageUsers: false,
    canManageInventory: false,
    canViewReports: false,
    canManageSettings: false,
    canProcessSales: true,
    canManageShifts: false,
    canApproveDiscounts: false,
  },
}
