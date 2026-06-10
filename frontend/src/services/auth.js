import { jwtDecode } from "jwt-decode";

export const getUserId = () => {

  const token =
    localStorage.getItem("token");

  if (!token) return null;

  const decoded =
    jwtDecode(token);

  return decoded.user_id;
};