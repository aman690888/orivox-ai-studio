import { useAuth } from "@/lib/auth-context";
import { Navigate } from "@tanstack/react-router";
import { ReactNode } from "react";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: string[];
  fallback?: ReactNode;
  redirectTo?: string;
}

export function RoleGuard({
  children,
  allowedRoles = ["admin"],
  fallback = null,
  redirectTo,
}: RoleGuardProps) {
  const { role, loading } = useAuth();

  if (loading) {
    return null; // Or a skeleton/spinner depending on implementation preference
  }

  const hasAccess = role && allowedRoles.includes(role);

  if (!hasAccess) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
