import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import Loader from "../component/Loader";

const PrivateRoute = () => {
  const { user, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="loader-container">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;