import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
    // Check if the user is authenticated by looking for the isLoggedIn cookie
    const isAuthenticated = document.cookie.includes("isLoggedIn=true");

    if (isAuthenticated) {
        return <Outlet />;
    }
    
    return <Navigate to="/login" replace />;
}