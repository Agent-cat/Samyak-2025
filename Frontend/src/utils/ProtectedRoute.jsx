import { Navigate, useLocation } from "react-router-dom";
import { getToken } from "./auth";

const ProtectedRoute = ({ children }) => {
  const token = getToken();
  const location = useLocation();

  if (!token) {
    if (
      location.pathname === "/registered-events" ||
      location.pathname === "/events"
    ) {
      return <Navigate to="/please-login" />;
    }
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
