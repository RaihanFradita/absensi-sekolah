import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Loading from "../components/ui/Loading";

function RequireAuth() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) return <Loading fullScreen label="Memeriksa sesi..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export default RequireAuth;
