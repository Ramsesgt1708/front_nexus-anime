import { useEffect, useState } from "react";
import { USER_ROLES } from "../utilities/contsants";
import authService from "../services/auth.service";

function useHasAccess() {
  const [rol] = useState<string>(() => {
    const setRoleFromAuth = authService.getUserRole();
    return setRoleFromAuth;
  });
  const [hasAccess, setHasAccess] = useState(false);
  const checkAccess = () => {
    if (rol === USER_ROLES.ADMIN || rol === USER_ROLES.ROOT) {
      setHasAccess(true);
    } else {
      setHasAccess(false);
    }
  };

  useEffect(() => {
    checkAccess();
  }, [rol]);

  return hasAccess;
}

export default useHasAccess;
