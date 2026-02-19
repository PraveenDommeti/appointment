import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
    Activity,
    BarChart3,
    Cpu,
    Globe,
    LayoutDashboard,
    LogOut,
    MessageSquare,
    Settings,
    Shield,
    Terminal,
    Users,
    Zap,
} from "lucide-react";
import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface NavItem {
    label: string;
    href: string;
    icon: any;
}

interface SuperAdminLayoutProps {
    children: ReactNode;
    userName?: string;
}

const navItems: NavItem[] = [
    { label: "Nexus Control", href: "/superadmin", icon: LayoutDashboard },
    { label: "Admin Fleet", href: "/superadmin/admins", icon: Shield },
    { label: "User Registry", href: "/superadmin/users", icon: Users },
    { label: "System Analytics", href: "/superadmin/analytics", icon: BarChart3 },
    { label: "Neural Messages", href: "/superadmin/messages", icon: MessageSquare },
    { label: "Audit Logs", href: "/superadmin/logs", icon: Terminal },
    { label: "Core Settings", href: "/superadmin/settings", icon: Settings },
];

const SuperAdminLayout = ({ children, userName = "Admin" }: SuperAdminLayoutProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="flex min-h-screen dashboard-theme bg-white text-foreground selection:bg-primary/30">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-[#0a0a0a] border-r border-white/5 shadow-2xl overflow-hidden group">
                {/* Animated background element */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                {/* Logo */}
                <div className="flex items-center gap-3 px-6 py-8">
                    <div className="relative">
                        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <Zap className="h-5 w-5 text-black fill-current" />
                        </div>
                        <div className="absolute -inset-1 bg-primary/20 blur-lg rounded-xl animate-pulse" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-display text-lg font-black tracking-tighter uppercase leading-none">ClassBook</span>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">Super Authority</span>
                    </div>
                </div>

                {/* Identity Section */}
                <div className="px-4 mb-6">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden group/card shadow-inner">
                        <div className="absolute top-0 right-0 p-2 opacity-20">
                            <Shield className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-1">Authenticated As</p>
                        <p className="font-display font-bold text-sm truncate">{userName}</p>
                        <div className="mt-3 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-tighter">Status: Active Node</span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar">
                    <p className="px-4 text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Command Center</p>
                    <ul className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <li key={item.href}>
                                    <Link
                                        to={item.href}
                                        className={cn(
                                            "group flex items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-bold transition-all relative overflow-hidden",
                                            isActive
                                                ? "bg-primary text-black shadow-lg shadow-primary/20"
                                                : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
                                        )}
                                    >
                                        <item.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive ? "text-black" : "text-white/40 group-hover:text-primary")} />
                                        <span className="relative z-10">{item.label}</span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-pill"
                                                className="absolute right-0 w-1 h-3/5 bg-black rounded-l-full"
                                            />
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="mt-8 space-y-4">
                        <p className="px-4 text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Core Systems</p>
                        <div className="px-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 cursor-help group/sys">
                                    <Cpu className="h-3.5 w-3.5 text-white/30 group-hover/sys:text-primary transition-colors" />
                                    <span className="text-[11px] font-bold text-white/50 group-hover/sys:text-white transition-colors">CPU Usage</span>
                                </div>
                                <span className="text-[11px] font-black text-primary">24%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 cursor-help group/sys">
                                    <Activity className="h-3.5 w-3.5 text-white/30 group-hover/sys:text-primary transition-colors" />
                                    <span className="text-[11px] font-bold text-white/50 group-hover/sys:text-white transition-colors">Memory</span>
                                </div>
                                <span className="text-[11px] font-black text-primary">1.2GB</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 cursor-help group/sys">
                                    <Globe className="h-3.5 w-3.5 text-white/30 group-hover/sys:text-primary transition-colors" />
                                    <span className="text-[11px] font-bold text-white/50 group-hover/sys:text-white transition-colors">Throughput</span>
                                </div>
                                <span className="text-[11px] font-black text-primary">8.4TB</span>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Footer */}
                <div className="p-4 mt-auto border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-bold text-rose-400 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
                    >
                        <LogOut className="h-4 w-4" />
                        Deauthenticate
                    </button>
                    <p className="text-[8px] text-center text-white/20 mt-4 font-bold uppercase tracking-widest">v4.2.0-secure // nexus core</p>
                </div>
            </aside>

            {/* Main content */}
            <main className="ml-64 flex-1 p-8 lg:p-12 relative overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -ml-64 -mb-64" />

                <div className="relative z-10 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default SuperAdminLayout;
