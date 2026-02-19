import { motion } from "framer-motion";
import {
    Users, Shield, Activity,
    Database, Globe, Lock, Info,
    ChevronRight, ArrowUpRight, Zap, Target,
    Cpu, HardDrive, RefreshCw, Settings, Terminal
} from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "@/lib/db";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const StatCard = ({ icon: Icon, label, value, description, trend, color }: any) => (
    <Card className="overflow-hidden border-white/5 bg-white/5 backdrop-blur-md shadow-2xl hover:bg-white/10 transition-all duration-500 group relative">
        <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-${color.replace('bg-', '')}/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
        <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl bg-${color.replace('bg-', '')}/10 border border-${color.replace('bg-', '')}/20 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <Icon className={`h-6 w-6 text-${color.replace('bg-', '')}`} />
                </div>
                {trend && (
                    <Badge variant="outline" className="text-emerald-400 bg-emerald-400/10 border-emerald-400/20 gap-1 rounded-lg">
                        <ArrowUpRight className="h-3 w-3" /> {trend}
                    </Badge>
                )}
            </div>
            <div className="space-y-1">
                <h3 className="text-4xl font-black tracking-tighter text-white">{value}</h3>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{label}</p>
            </div>
            <p className="text-[11px] text-white/30 mt-4 leading-relaxed font-medium">
                {description}
            </p>
        </CardContent>
    </Card>
);

const SuperAdminHome = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalAdmins: 0,
        systemHealth: "100%",
        activeSessions: 0
    });

    useEffect(() => {
        const refreshStats = () => {
            const analyticalData = db.getSystemAnalytics();

            setStats({
                totalUsers: analyticalData.totalUsers,
                totalAdmins: analyticalData.totalTrainers + analyticalData.totalStudents, // Total accounts managed
                systemHealth: "99.9%",
                activeSessions: Math.floor(analyticalData.totalUsers * 0.4) // Simulated live session load
            });
        };

        refreshStats();
        window.addEventListener('db-update', refreshStats);
        return () => window.removeEventListener('db-update', refreshStats);
    }, []);

    const systemNodes = [
        { name: "Edge Registry", icon: Globe, status: "Online", color: "text-emerald-400", bg: "bg-emerald-400/5" },
        { name: "Primary Cluster", icon: Database, status: "Syncing", color: "text-blue-400", bg: "bg-blue-400/5" },
        { name: "Auth Authority", icon: Lock, status: "Secure", color: "text-amber-400", bg: "bg-amber-400/5" },
        { name: "Neural Analytics", icon: Activity, status: "Optimized", color: "text-indigo-400", bg: "bg-indigo-400/5" },
    ];

    return (
        <div className="space-y-12 pb-20">
            {/* Hero Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10 p-10 lg:p-14"
            >
                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12">
                    <Shield className="h-64 w-64 text-white" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
                    <div className="max-w-xl text-center lg:text-left">
                        <Badge className="bg-primary/20 text-primary border-primary/20 mb-6 hover:bg-primary/30 py-1 transition-colors">
                            <Zap className="h-3 w-3 mr-2" /> CORE COMMAND AUTHORIZED
                        </Badge>
                        <h1 className="font-display text-5xl lg:text-7xl font-black tracking-tighter text-white mb-6 uppercase italic">
                            System <span className="text-primary not-italic">Nexus</span>
                        </h1>
                        <p className="text-lg text-white/50 font-medium leading-relaxed max-w-md mx-auto lg:mx-0">
                            Orchestrate global platform infrastructure and maintain absolute operational integrity across all sectors.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                        <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-xs" onClick={() => navigate('/superadmin/settings')}>
                            <Settings className="h-4 w-4 mr-3" /> Core Config
                        </Button>
                        <Button className="bg-primary text-black hover:scale-105 active:scale-95 transition-all rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20" onClick={() => navigate('/superadmin/logs')}>
                            <Terminal className="h-4 w-4 mr-3" /> Execute Audit
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Users}
                    label="Active Identities"
                    value={stats.totalUsers.toString()}
                    description="Total neural links active on the decentralized registry."
                    trend="+24%"
                    color="bg-primary"
                />
                <StatCard
                    icon={Shield}
                    label="Command Units"
                    value={stats.totalAdmins.toString()}
                    description="Administrative nodes currently exercising sector authority."
                    color="bg-blue-400"
                />
                <StatCard
                    icon={Zap}
                    label="System Latency"
                    value="14ms"
                    description="Global response time across all edge-replicated clusters."
                    trend="-8ms"
                    color="bg-emerald-400"
                />
                <StatCard
                    icon={Activity}
                    label="Uptime Index"
                    value={stats.systemHealth}
                    description="Real-time reliability score for critical infrastructure."
                    trend="Steady"
                    color="bg-indigo-400"
                />
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Node Status Grid */}
                <Card className="lg:col-span-8 border-white/5 bg-white/5 backdrop-blur-md overflow-hidden rounded-[2rem]">
                    <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-black tracking-tight text-white uppercase italic">Infrastructure Map</CardTitle>
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Global Service Distribution</p>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-xl border border-white/10 hover:bg-white/5">
                            <RefreshCw className="h-4 w-4 text-white/50" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {systemNodes.map((node, i) => (
                                <motion.div
                                    key={node.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all flex items-center justify-between group cursor-default"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${node.bg} ${node.color} group-hover:scale-110 transition-transform`}>
                                            <node.icon className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="font-black text-white text-sm uppercase tracking-tight">{node.name}</p>
                                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest group-hover:text-primary transition-colors">Sector Node SC-0{i + 1}</p>
                                        </div>
                                    </div>
                                    <Badge className={`${node.bg} ${node.color} border-none font-black text-[10px] py-1 px-3`}>{node.status}</Badge>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Sub-System Metrics */}
                <Card className="lg:col-span-4 border-none bg-gradient-to-br from-primary/20 via-primary/5 to-transparent rounded-[2rem] overflow-hidden group">
                    <CardHeader className="p-8">
                        <CardTitle className="text-xl font-black text-primary uppercase italic flex items-center gap-3">
                            <Target className="h-6 w-6" /> Efficiency Core
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 space-y-8">
                        {[
                            { label: "Query Optimization", value: "98.4%", icon: Cpu },
                            { label: "Throughput Elasticity", value: "72%", icon: HardDrive },
                        ].map((metric) => (
                            <div key={metric.label} className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <metric.icon className="h-4 w-4 text-primary opacity-50" />
                                        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{metric.label}</span>
                                    </div>
                                    <span className="text-lg font-black text-white">{metric.value}</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: metric.value }}
                                        transition={{ duration: 1.5, ease: "circOut" }}
                                        className="h-full bg-primary"
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="pt-8 border-t border-white/5 space-y-4">
                            <h5 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Neural Priority Queue</h5>
                            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white text-black hover:bg-primary transition-all shadow-xl shadow-black/20 group/btn" onClick={() => navigate('/superadmin/logs')}>
                                <span className="text-xs font-black uppercase tracking-widest">Review 12 Security Anomalies</span>
                                <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                            </button>
                            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 text-white hover:bg-white/10 transition-all border border-white/10" onClick={() => navigate('/superadmin/settings')}>
                                <span className="text-xs font-black uppercase tracking-widest">Protocol Override</span>
                                <Shield className="h-4 w-4 text-white/20" />
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SuperAdminHome;
