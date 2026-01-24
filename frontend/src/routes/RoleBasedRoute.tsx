import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FullPageSpinner } from '../components/ui/Spinner';

interface RoleBasedRouteProps {
    allowedRoles: ('student' | 'employer' | 'admin')[];
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ allowedRoles }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <FullPageSpinner />;
    }

    if (!user || !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on actual role
        if (user?.role === 'student') return <Navigate to="/student/dashboard" replace />;
        if (user?.role === 'employer') return <Navigate to="/employer/search" replace />;
        if (user?.role === 'admin') return <Navigate to="/admin/submissions" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
