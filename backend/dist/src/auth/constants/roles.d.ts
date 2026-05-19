import { UserRole } from '@prisma/client';
export type SelectedRole = 'super_admin' | 'owner' | 'coach' | 'athlete';
export declare const AUTH0_NAMESPACE = "https://hercix.com";
export declare const SELECTED_ROLE_TO_PRISMA: Record<SelectedRole, UserRole>;
export declare const PRISMA_TO_SELECTED_ROLE: Record<UserRole, SelectedRole>;
export declare const ROLE_HOME_PATH: Record<SelectedRole, string>;
export declare const AUTH0_RBAC_ROLE_NAMES: Record<SelectedRole, string[]>;
export declare function resolveRoleFromAuth0Claims(customRoles: string[] | undefined): UserRole;
export declare function isSelectedRoleAllowed(selected: SelectedRole, actual: UserRole): boolean;
