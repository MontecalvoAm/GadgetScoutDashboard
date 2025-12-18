import { JWTPayload } from './jwt';

// Role definitions
export const ROLES = {
  SUPER_ADMIN: { id: 1, name: 'Super Admin', permissions: ['*'] },
  ADMIN: { id: 2, name: 'Admin', permissions: ['read:all', 'write:all', 'delete:limited', 'manage:users'] },
  EDITOR: { id: 3, name: 'Editor', permissions: ['read:customers', 'write:customers', 'read:messages', 'read:leads', 'write:leads'] },
  VIEWER: { id: 4, name: 'Viewer', permissions: ['read:customers', 'read:messages', 'read:leads', 'read:dashboard'] }
} as const;

// Permission definitions
export type Permission =
  | 'read:all'
  | 'write:all'
  | 'delete:limited'
  | 'manage:users'
  | 'read:customers'
  | 'write:customers'
  | 'delete:customers'
  | 'read:messages'
  | 'write:messages'
  | 'read:leads'
  | 'write:leads'
  | 'delete:leads'
  | 'read:dashboard';

// API route permission mapping
export const ROUTE_PERMISSIONS: Record<string, { methods: string[], roles: number[] }> = {
  '/api/users': {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    roles: [ROLES.SUPER_ADMIN.id, ROLES.ADMIN.id]
  },
  '/api/users/[id]': {
    methods: ['GET', 'PUT', 'DELETE'],
    roles: [ROLES.SUPER_ADMIN.id, ROLES.ADMIN.id]
  },
  '/api/users/update-role': {
    methods: ['PUT'],
    roles: [ROLES.SUPER_ADMIN.id]
  },
  '/api/customers': {
    methods: ['GET'],
    roles: [ROLES.SUPER_ADMIN.id, ROLES.ADMIN.id, ROLES.EDITOR.id, ROLES.VIEWER.id]
  },
  '/api/customers/[id]': {
    methods: ['GET', 'PUT'],
    roles: [ROLES.SUPER_ADMIN.id, ROLES.ADMIN.id, ROLES.EDITOR.id]
  },
  '/api/leads': {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    roles: [ROLES.SUPER_ADMIN.id, ROLES.ADMIN.id, ROLES.EDITOR.id, ROLES.VIEWER.id]
  },
  '/api/messages': {
    methods: ['GET', 'POST'],
    roles: [ROLES.SUPER_ADMIN.id, ROLES.ADMIN.id, ROLES.EDITOR.id, ROLES.VIEWER.id]
  },
  '/api/messages/[id]': {
    methods: ['GET', 'PUT', 'DELETE'],
    roles: [ROLES.SUPER_ADMIN.id, ROLES.ADMIN.id, ROLES.EDITOR.id]
  }
};

/**
 * Get permissions for a specific role
 * @param roleId - Role ID
 * @returns Array of permissions
 */
export function getRolePermissions(roleId: number): string[] {
  const role = Object.values(ROLES).find(r => r.id === roleId);
  return role?.permissions || [];
}

/**
 * Check if user has specific permission
 * @param user - Authenticated user with role
 * @param permission - Required permission
 * @returns Boolean indicating access
 */
export function hasPermission(user: JWTPayload & { roleId: number }, permission: string): boolean {
  const permissions = getRolePermissions(user.roleId);

  // Super admin has all permissions
  if (permissions.includes('*')) {
    return true;
  }

  return permissions.includes(permission);
}

/**
 * Check if user can access specific route
 * @param user - Authenticated user
 * @param route - API route path
 * @param method - HTTP method
 * @returns Boolean indicating access
 */
export function canAccessRoute(user: JWTPayload & { roleId: number }, route: string, method: string): boolean {
  // Normalize route by removing dynamic segments
  const normalizedRoute = route.replace(/\/\d+$/, '/[id]');

  const routeConfig = ROUTE_PERMISSIONS[normalizedRoute];
  if (!routeConfig) {
    // Allow access to unknown routes for super admin
    return user.roleId === ROLES.SUPER_ADMIN.id;
  }

  if (!routeConfig.methods.includes(method.toUpperCase())) {
    return false;
  }

  return routeConfig.roles.includes(user.roleId);
}

/**
 * Get navigation items based on user role
 * @param roleId - User's role ID
 * @returns Array of accessible navigation items
 */
export function getNavigationByRole(roleId: number): string[] {
  const navigation = {
    [ROLES.SUPER_ADMIN.id]: ['dashboard', 'leads', 'customers', 'messages', 'users', 'settings'],
    [ROLES.ADMIN.id]: ['dashboard', 'leads', 'customers', 'messages', 'users'],
    [ROLES.EDITOR.id]: ['dashboard', 'leads', 'customers', 'messages'],
    [ROLES.VIEWER.id]: ['dashboard', 'leads', 'customers', 'messages']
  };

  return navigation[roleId] || ['dashboard'];
}

/**
 * Get role details
 * @param roleId - Role ID
 * @returns Role details or null
 */
export function getRoleDetails(roleId: number) {
  return Object.values(ROLES).find(r => r.id === roleId) || null;
}

/**
 * Check if role can manage other roles
 * @param managerRoleId - Role ID of the manager
 * @param targetRoleId - Role ID being managed
 * @returns Boolean indicating if management is allowed
 */
export function canManageRole(managerRoleId: number, targetRoleId: number): boolean {
  // Super admin can manage all roles
  if (managerRoleId === ROLES.SUPER_ADMIN.id) {
    return true;
  }

  // Admin can manage editor and viewer roles
  if (managerRoleId === ROLES.ADMIN.id) {
    return targetRoleId === ROLES.EDITOR.id || targetRoleId === ROLES.VIEWER.id;
  }

  return false;
}