import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthServiceImpl } from "../../../infrastructure/services/AuthServiceImpl";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authService = new AuthServiceImpl();

    const checkAuth = async () => {
      const isValid = await authService.verifyAuth();
      setIsAuthenticated(isValid);
      setIsChecking(false);

      if (!isValid) {
        navigate("/signin", { replace: true });
      }
    };

    checkAuth();
  }, [navigate]);

  if (isChecking) {
    return <div className="p-4">Verificando sesión...</div>;
  }

  return <>{isAuthenticated ? children : null}</>;
}