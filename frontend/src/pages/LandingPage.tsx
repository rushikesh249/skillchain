import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import {
    CheckCircle, Shield, Award, ArrowRight, Code, Database, Globe, Briefcase, Star
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const trustedCompanies = [
    { name: "TechCorp", icon: Code },
    { name: "DataFlow", icon: Database },
    { name: "GlobalNet", icon: Globe },
    { name: "FutureWorks", icon: Briefcase },
    { name: "StarStart", icon: Star },
];

export const LandingPage = () => {
    return (
        <div className="overflow-x-hidden">
            {/* HERO SECTION */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 lg:px-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">

                {/* Background Blobs */}
                <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 -z-10 w-80 h-80 bg-violet-500/10 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2" />

                <div className="flex-1 space-y-8 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold animate-fade-in">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        New: Resume-less hiring is here
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
                        Proof of Skills, <br />
                        <span className="text-gradient-primary">Not Just Degrees.</span>
                    </h1>

                    <p className="text-xl text-gray-600 max-w-2xl mx-auto md:mx-0 leading-relaxed">
                        The verifiable credential platform where developers turn projects into careers.
                        Submit work, get expert reviews, earn on-chain validation, and get hired.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start pt-4">
                        <Link to="/register" className="w-full sm:w-auto">
                            <Button size="xl" variant="gradient" className="w-full sm:w-auto shadow-glow">
                                Start Earning Credentials
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Link to="/employer/search" className="w-full sm:w-auto">
                            <Button size="xl" variant="outline" className="w-full sm:w-auto border-gray-300 hover:bg-gray-50/80">
                                Hire Verified Talent
                            </Button>
                        </Link>
                    </div>

                    <p className="text-sm text-gray-500 pt-2 flex items-center justify-center md:justify-start gap-4">
                        <span>✓ No credit card required</span>
                        <span>✓ Blockchain backed</span>
                        <span>✓ Instant verification</span>
                    </p>
                </div>

                <div className="flex-1 w-full max-w-lg md:max-w-none relative animate-slide-up animation-delay-300">
                    <div className="relative z-10 bg-white rounded-2xl shadow-strong border border-gray-200 p-2 overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 z-0" />
                        <img
                            src="https://placehold.co/800x600/f8fafc/e2e8f0?text=SkillChain+Dashboard+Preview"
                            alt="Platform Preview"
                            className="rounded-xl w-full h-auto shadow-sm"
                        />
                        {/* Floating Badge */}
                        <div className="absolute top-8 -right-4 bg-white p-3 rounded-lg shadow-lg border border-gray-100 flex items-center gap-3 animate-bounce-slow">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">New Credential</p>
                                <p className="text-sm font-bold text-gray-900">React Expert</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* TRUST BAR */}
            <section className="py-10 border-y border-gray-100 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-6 overflow-hidden">
                    <p className="text-center text-sm font-semibold text-gray-400 mb-8 uppercase tracking-wider">Trusted by innovative teams everywhere</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {trustedCompanies.map((c, i) => (
                            <div key={i} className="flex items-center gap-2 group cursor-default">
                                <c.icon className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                                <span className="font-bold text-xl text-gray-400 group-hover:text-gray-900 transition-colors">{c.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="features" className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-indigo-600 font-semibold tracking-wide uppercase text-sm mb-4">Process</h2>
                        <h3 className="text-4xl font-bold text-gray-900 mb-6">From Code to Career in 3 Steps</h3>
                        <p className="text-lg text-gray-600">
                            Stop relying on resumes. Prove your skills with verifiable data that employers actually trust.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-gray-200 via-indigo-200 to-gray-200 z-0" />

                        <Card variant="flat" className="relative z-10 border-none shadow-none bg-transparent text-center hover:bg-transparent px-4">
                            <div className="w-24 h-24 mx-auto bg-white rounded-2xl shadow-soft border border-gray-100 flex items-center justify-center mb-6 relative group transition-transform hover:-translate-y-2">
                                <Code className="w-10 h-10 text-indigo-600" />
                                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold border-4 border-white">1</div>
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-3">Submit Project</h4>
                            <p className="text-gray-600 leading-relaxed">
                                Link your GitHub repository or live demo. We analyze code quality, complexity, and best practices.
                            </p>
                        </Card>

                        <Card variant="flat" className="relative z-10 border-none shadow-none bg-transparent text-center hover:bg-transparent px-4">
                            <div className="w-24 h-24 mx-auto bg-white rounded-2xl shadow-soft border border-gray-100 flex items-center justify-center mb-6 relative group transition-transform hover:-translate-y-2">
                                <Shield className="w-10 h-10 text-violet-600" />
                                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold border-4 border-white">2</div>
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-3">Get Verified</h4>
                            <p className="text-gray-600 leading-relaxed">
                                Expert reviewers and automated systems validate your work against industry standards.
                            </p>
                        </Card>

                        <Card variant="flat" className="relative z-10 border-none shadow-none bg-transparent text-center hover:bg-transparent px-4">
                            <div className="w-24 h-24 mx-auto bg-white rounded-2xl shadow-soft border border-gray-100 flex items-center justify-center mb-6 relative group transition-transform hover:-translate-y-2">
                                <Award className="w-10 h-10 text-emerald-600" />
                                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold border-4 border-white">3</div>
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-3">Earn Credential</h4>
                            <p className="text-gray-600 leading-relaxed">
                                Receive a soulbound token (SBT) on the blockchain. Permanent, tamper-proof proof of skill.
                            </p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* FOR STUDENTS & EMPLOYERS */}
            <section className="py-24 bg-gray-50" id="students">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1 space-y-8">
                            <Badge variant="info" className="px-3 py-1">For Students</Badge>
                            <h3 className="text-4xl font-bold text-gray-900">
                                Turn Your Projects Into <br />
                                <span className="text-indigo-600">Verified Career Capital</span>.
                            </h3>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Don't let your side projects sit idle on GitHub. Verify them on SkillChain to prove you can do the job before you even interview.
                            </p>

                            <ul className="space-y-4">
                                {[
                                    "Showcase real-world skills, not just theory",
                                    "Build a verified portfolio that stands out",
                                    "Skip technical screens with pre-verified proofs"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        </div>
                                        <span className="text-gray-700 font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link to="/register">
                                <Button size="lg" className="mt-4">Start Your Portfolio</Button>
                            </Link>
                        </div>
                        <div className="order-1 lg:order-2 relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-3xl rotate-3 opacity-10"></div>
                            <div className="relative bg-white rounded-3xl shadow-xl border border-gray-100 p-8 overflow-hidden">
                                <div className="flex items-center gap-4 mb-6 border-b border-gray-50 pb-6">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full"></div>
                                    <div>
                                        <div className="h-4 w-32 bg-gray-100 rounded mb-2"></div>
                                        <div className="h-3 w-24 bg-gray-50 rounded"></div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-4 w-full bg-gray-50 rounded"></div>
                                    <div className="h-4 w-5/6 bg-gray-50 rounded"></div>
                                    <div className="h-4 w-4/6 bg-gray-50 rounded"></div>
                                </div>
                                <div className="mt-8 flex gap-3">
                                    <div className="flex-1 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 text-sm font-bold">React: 95/100</div>
                                    <div className="flex-1 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 text-sm font-bold">Node: 88/100</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-24 bg-white" id="employers">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-bl from-violet-600 to-indigo-600 rounded-3xl -rotate-3 opacity-10"></div>
                            <div className="relative bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                                {/* Fake Search Interface */}
                                <div className="flex gap-2 mb-6">
                                    <div className="flex-1 h-10 bg-gray-50 border border-gray-200 rounded-lg"></div>
                                    <div className="w-10 h-10 bg-indigo-600 rounded-lg"></div>
                                </div>
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
                                            <div className="flex-1">
                                                <div className="h-3 w-24 bg-gray-200 rounded mb-1"></div>
                                                <div className="h-2 w-16 bg-gray-100 rounded"></div>
                                            </div>
                                            <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Verified</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <Badge variant="info" className="px-3 py-1 bg-violet-100 text-violet-700">For Employers</Badge>
                            <h3 className="text-4xl font-bold text-gray-900">
                                Hire Based on Skills, <br />
                                <span className="text-violet-600">Not Just Resumes</span>.
                            </h3>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Access a pre-vetted pool of developers. Filter by verified skill scores, view source code, and hire with confidence.
                            </p>

                            <ul className="space-y-4">
                                {[
                                    "Filter candidates by validated technical scores",
                                    "View code quality before the first interview",
                                    "Reduce time-to-hire by 50% with verified talent"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle className="w-4 h-4 text-violet-600" />
                                        </div>
                                        <span className="text-gray-700 font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link to="/employer/search">
                                <Button size="lg" variant="outline" className="mt-4">Search Talent Database</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="py-24">
                <div className="max-w-5xl mx-auto px-6 lg:px-8">
                    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-12 text-center text-white shadow-glow relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

                        <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">Ready to prove your skills?</h2>
                        <p className="text-indigo-100 text-xl mb-8 max-w-2xl mx-auto relative z-10">
                            Join thousands of developers building their verified portfolio on SkillChain.
                        </p>
                        <Link to="/register" className="relative z-10">
                            <Button size="xl" className="bg-white text-indigo-600 hover:bg-gray-50 border-none shadow-lg">
                                Get Started for Free
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};
