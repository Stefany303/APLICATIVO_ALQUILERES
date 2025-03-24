import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import Loader from "../component/Loader";

const PrivateRoute = ({ children }) => {
  const { user, cargando } = useAuth();

  if (cargando) {
    return <Loader />; 
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default PrivateRoute;