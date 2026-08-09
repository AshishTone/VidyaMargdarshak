import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-600">
        Loading your guidance workspace...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.profileCompleted && location.pathname !== "/profile") {
    return <Navigate to="/profile" replace />;
  }

  return children;
}
