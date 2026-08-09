import { useContext } from "react";
import { AuthContext } from "../context/AuthContextBase.jsx";

export default function useAuth() {
  return useContext(AuthContext);
}
