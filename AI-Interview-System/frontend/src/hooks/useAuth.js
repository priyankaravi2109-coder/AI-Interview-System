
import { useContext } from "react";

import { useAuth as useAuthContext } from "../context/AuthContext";

function useAuth() {
  const auth = useAuthContext();

  if (!auth) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return auth;
}

export default useAuth;

