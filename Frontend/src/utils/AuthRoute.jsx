import { Navigate } from "react-router-dom";
import { getUser } from "./auth";

const AuthRoute = ({ children }) => {
  const user = getUser();

  if (user) {
    return <Navigate to="/" />;
  }

  return children;
};

export default AuthRoute;
