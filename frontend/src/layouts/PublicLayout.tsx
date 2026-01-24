import { Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';
import { Menu, X, Github, Twitter, Linkedin } from 'lucide-react';
import { useState, useEffect } from 'react';

export const PublicLayout = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Handle scroll effect for sticky nav
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { label: 'Features', href: '/#features' },
        { label: 'For Students', href: '/#students' },
        { label: 'For Employers', href: '/#employers' },
    ];

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Navigation */}
            <header
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                    scrolled ? "bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm py-3" : "bg-white/50 backdrop-blur-sm py-5"
                )}
            >
                <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-105 transition-transform">
                            S
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 group-hover:from-indigo-600 group-hover:to-violet-600 transition-all">
                            SkillChain
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {location.pathname === '/' && navLinks.map(link => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        {isAuthenticated ? (
                            <Link to="/login">
                                <Button variant="default" size="sm" className="shadow-none">Dashboard</Button>
                            </Link>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-indigo-600">Log in</Button>
                                </Link>
                                <Link to="/register">
                                    <Button size="sm" className="rounded-full px-6 shadow-glow">Get Started</Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button className="md:hidden p-2 text-gray-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 p-6 shadow-xl md:hidden animate-slide-up">
                        <div className="flex flex-col space-y-4">
                            {location.pathname === '/' && navLinks.map(link => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="text-base font-medium text-gray-600"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </a>
                            ))}
                            <div className="h-px bg-gray-100 my-2" />
                            {isAuthenticated ? (
                                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                    <Button className="w-full">Dashboard</Button>
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="ghost" className="w-full justify-start">Log in</Button>
                                    </Link>
                                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                                        <Button className="w-full">Get Started</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>

            <main className="flex-1">
                <Outlet />
            </main>

            <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div className="space-y-4 col-span-1 md:col-span-1">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">S</div>
                                <span className="font-bold text-gray-900">SkillChain</span>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                The world's first blockchain-verified skill platform. We turn projects into proof and developers into hires.
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors"><Github className="w-5 h-5" /></a>
                                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors"><Twitter className="w-5 h-5" /></a>
                                <a href="#" className="text-gray-400 hover:text-blue-700 transition-colors"><Linkedin className="w-5 h-5" /></a>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li><a href="#" className="hover:text-indigo-600">Features</a></li>
                                <li><a href="#" className="hover:text-indigo-600">Pricing</a></li>
                                <li><a href="#" className="hover:text-indigo-600">Enterprise</a></li>
                                <li><a href="#" className="hover:text-indigo-600">Success Stories</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li><a href="#" className="hover:text-indigo-600">Documentation</a></li>
                                <li><a href="#" className="hover:text-indigo-600">API Reference</a></li>
                                <li><a href="#" className="hover:text-indigo-600">Community</a></li>
                                <li><a href="#" className="hover:text-indigo-600">Blog</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li><a href="#" className="hover:text-indigo-600">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-indigo-600">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-indigo-600">Cookie Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-400">© 2024 SkillChain Inc. All rights reserved.</p>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-xs font-medium text-gray-500">Systems Operational</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
