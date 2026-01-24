import { Route, Routes, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleBasedRoute } from './RoleBasedRoute';

// Pages
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { VerifyPage } from '../pages/VerifyPage';

import { StudentDashboard } from '../features/student/StudentDashboard';
import { SubmitSkill } from '../features/student/SubmitSkill';
import { MySubmissions } from '../features/student/MySubmissions';
import { MyCredentials } from '../features/student/MyCredentials';

import { SearchCandidates } from '../features/employer/SearchCandidates';
import { UnlockedProfiles } from '../features/employer/UnlockedProfiles';

import { PendingSubmissions } from '../features/admin/PendingSubmissions';

export const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="verify/:credentialId" element={<VerifyPage />} />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>

                    {/* Student Routes */}
                    <Route element={<RoleBasedRoute allowedRoles={['student']} />}>
                        <Route path="student/dashboard" element={<StudentDashboard />} />
                        <Route path="submissions/new" element={<SubmitSkill />} />
                        <Route path="submissions/my" element={<MySubmissions />} />
                        <Route path="credentials/my" element={<MyCredentials />} />
                    </Route>

                    {/* Employer Routes */}
                    <Route element={<RoleBasedRoute allowedRoles={['employer']} />}>
                        <Route path="employer/search" element={<SearchCandidates />} />
                        <Route path="employer/unlocks" element={<UnlockedProfiles />} />
                    </Route>

                    {/* Admin Routes */}
                    <Route element={<RoleBasedRoute allowedRoles={['admin']} />}>
                        <Route path="admin/submissions" element={<PendingSubmissions />} />
                    </Route>

                </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};
