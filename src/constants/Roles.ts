// constants/Roles.ts
// User roles and permissions
export enum UserRole {
  OWNER = "owner",
  ADMIN = "admin",
  MANAGER = "manager",
  CASHIER = "cashier",
  KITCHEN = "kitchen",
}

export const RolePermissions = {
  [UserRole.OWNER]: {
    canManageBusiness: true,
    canManageUsers: true,
    canManageInventory: true,
    canViewReports: true,
    canManageSettings: true,
    canProcessSales: true,
    canManageShifts: true,
    canApproveDiscounts: true,
  },
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
    canViewReports: true,
    canManageSettings: true,
    canProcessSales: true,
    canManageShifts: false,
    canApproveDiscounts: false,
  },
  [UserRole.KITCHEN]: {
    canManageBusiness: false,
    canManageUsers: false,
    canManageInventory: false,
    canViewReports: false,
    canManageSettings: false,
    canProcessSales: false,
    canManageShifts: false,
    canApproveDiscounts: false,
    isKDS: true,
  },
}
