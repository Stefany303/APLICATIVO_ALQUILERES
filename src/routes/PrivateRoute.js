import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import Loader from "../component/Loader";

const PrivateRoute = ({ children }) => {
  const { user, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="loader-container">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }

  return children || <Outlet />;
};

export default PrivateRoute;