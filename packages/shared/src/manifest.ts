// The module-facing contract. Every module repo authors a manifest of this shape;
// core reads it to register routes, nav, events, and to sync permissions.

export type PermissionLevel = 'module' | 'page' | 'function';

export interface PermissionDef {
  key: string; // e.g. 'admin:users:create'
  label: string; // e.g. 'Create user'
  level: PermissionLevel;
  page?: string; // grouping for page/function levels, e.g. 'Users'
}

export interface NavItem {
  label: string;
  path: string;
  icon?: string;
}

export interface RouteItem {
  path: string;
  component: string;
}

export interface ModuleEvents {
  publishes: string[];
  subscribes: string[];
}

export interface ModuleManifest {
  name: string;
  apiPrefix: string;
  nav: NavItem[];
  routes: RouteItem[];
  permissions: PermissionDef[];
  events: ModuleEvents;
}
