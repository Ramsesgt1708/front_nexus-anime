
export const USER_ROLES = {
  CLIENTE: "CLIENTE",
  ADMIN: "ADMIN",
  ROOT: "ROOT",
} as const;


export const isCliente = (rol: string): boolean => {
  return rol === USER_ROLES.CLIENTE;
};

export const isAdmin = (rol: string): boolean => {
  return rol === USER_ROLES.ADMIN;
};

export const isRoot = (rol: string): boolean => {
  return rol === USER_ROLES.ROOT;
};

export const canAccessAdminPanel = (rol: string): boolean => {
  return rol === USER_ROLES.ADMIN || rol === USER_ROLES.ROOT;
};
