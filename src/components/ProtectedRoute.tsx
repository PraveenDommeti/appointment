import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, Role } from "@/context/AuthContext";

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: Role[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const { user, isLoading, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                navigate("/login");
            } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
                // Redirect to their own dashboard if they hit a restricted role route
                if (user.role === "superadmin") navigate("/superadmin");
                else if (user.role === "admin") navigate("/admin");
                else if (user.role === "trainer") navigate("/trainer");
                else navigate("/student");
            }
        }
    }, [isLoading, isAuthenticated, user, navigate, allowedRoles]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="font-display font-black uppercase tracking-[0.2em] text-primary animate-pulse">Synchronizing Identity...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return null;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
