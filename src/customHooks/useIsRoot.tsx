import { useEffect, useState } from "react";
import { USER_ROLES } from "../utilities/contsants";
import authService from "../services/auth.service";

function useIsRoot() {
  const [rol] = useState<string>(() => {
    const setRoleFromAuth = authService.getUserRole();
    return setRoleFromAuth;
  });
  const [isRoot, setIsRoot] = useState(false);
  
  const checkAccess = () => {
    if (rol === USER_ROLES.ROOT) {
      setIsRoot(true);
    } else {
      setIsRoot(false);
    }
  };

  useEffect(() => {
    checkAccess();
  }, [rol]);

  return isRoot;
}

export default useIsRoot;
