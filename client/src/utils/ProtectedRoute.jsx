import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  console.log(isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
