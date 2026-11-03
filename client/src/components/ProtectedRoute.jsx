import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Getting your workspace ready…</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
