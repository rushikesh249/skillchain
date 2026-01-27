import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import {
    LayoutDashboard,
    LogOut,
    FileText,
    Award,
    Search,
    Users,
    CheckCircle,
    Settings,
    HelpCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Badge } from '../components/ui/Badge';

export const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const studentLinks = [
        { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/submissions/new', label: 'Submit Skill', icon: FileText },
        { href: '/submissions/my', label: 'My Submissions', icon: CheckCircle },
        { href: '/credentials/my', label: 'My Credentials', icon: Award },
    ];

    const employerLinks = [
        { href: '/employer/search', label: 'Search Talent', icon: Search },
        { href: '/employer/unlocks', label: 'Unlocked Profiles', icon: Users },
    ];

    const adminLinks = [
        { href: '/admin/submissions', label: 'Pending Reviews', icon: FileText },
    ];

    let links: typeof studentLinks = [];
    if (user?.role === 'student') links = studentLinks;
    if (user?.role === 'employer') links = employerLinks;
    if (user?.role === 'admin') links = adminLinks;

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col md:flex-row font-sans">
            {/* Sidebar */}
            <aside className="w-full md:w-72 bg-white border-r border-gray-100 flex flex-col shadow-soft z-20">
                <div className="p-6 h-20 flex items-center border-b border-gray-50">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-105 transition-transform">
                            S
                        </div>
                        <div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                                SkillChain
                            </span>
                            <Badge variant="neutral" className="ml-2 text-[10px] px-1.5 py-0 uppercase tracking-wider">{user?.role}</Badge>
                        </div>
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4">
                    <div className="mb-2 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Main Menu
                    </div>
                    <nav className="space-y-1">
                        {links.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    className={cn(
                                        "flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden",
                                        isActive
                                            ? "bg-indigo-50 text-indigo-700 shadow-sm"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-r-full"></div>}
                                    <Icon className={cn("mr-3 h-5 w-5 transition-colors", isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600")} />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-8 mb-2 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Settings
                    </div>
                    <nav className="space-y-1">
                        <Link
                            to={`/${user?.role}/settings`}
                            className={cn(
                                "w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden",
                                location.pathname.includes('/settings')
                                    ? "bg-indigo-50 text-indigo-700 shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            {location.pathname.includes('/settings') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-r-full"></div>}
                            <Settings className={cn("mr-3 h-5 w-5 transition-colors", location.pathname.includes('/settings') ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600")} />
                            Account Settings
                        </Link>
                        <Link
                            to={`/${user?.role}/help`}
                            className={cn(
                                "w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden",
                                location.pathname.includes('/help')
                                    ? "bg-indigo-50 text-indigo-700 shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            {location.pathname.includes('/help') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-r-full"></div>}
                            <HelpCircle className={cn("mr-3 h-5 w-5 transition-colors", location.pathname.includes('/help') ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600")} />
                            Help & Support
                        </Link>
                    </nav>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50/30">
                    <div className="flex items-center p-2 rounded-xl hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-gray-100 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
                            {user?.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50/50 rounded-lg"
                        onClick={handleLogout}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto max-h-screen bg-transparent relative z-10 scroll-smooth">
                {/* Header for Mobile/Context */}
                <div className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center px-4 justify-between sticky top-0 z-30">
                    <span className="font-bold text-gray-900">SkillChain</span>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
