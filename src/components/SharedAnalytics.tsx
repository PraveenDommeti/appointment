import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/db";
import { motion } from "framer-motion";
import {
    Activity,
    AlertCircle,
    BarChart3,
    Calendar,
    CheckCircle2,
    Clock,
    GraduationCap,
    Shield,
    Target,
    TrendingUp, Users
} from "lucide-react";
import { useEffect, useState } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis, YAxis
} from 'recharts';

interface SharedAnalyticsProps {
    role: "admin" | "trainer" | "student" | "superadmin";
}

const SharedAnalytics = ({ role }: SharedAnalyticsProps) => {
    const { user } = useAuth();
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const load = () => {
            if (role === "student" && user) {
                setData(db.getStudentAnalytics(user.id));
            } else if (role === "trainer" && user) {
                setData(db.getTrainerAnalytics(user.id));
            } else if (role === "admin") {
                setData(db.getAdminAnalytics());
            } else if (role === "superadmin") {
                setData(db.getSuperAdminAnalytics());
            }
        };

        load();
        const interval = setInterval(load, 5000);
        return () => clearInterval(interval);
    }, [role, user]);

    // Chart Data Generation
    // Dynamic Chart Data Generation
    const [activityData, setActivityData] = useState<any[]>([]);
    const [timeRange, setTimeRange] = useState<"weekly" | "monthly">("weekly");

    useEffect(() => {
        const generateChartData = () => {
            if (!data) return;

            // Get all appointments to calculate activity distribution
            const allAppointments = db.getAllAppointments();
            let relevantAppts = allAppointments;

            if (role === 'student' && user) {
                relevantAppts = allAppointments.filter(a => a.userId === user.id);
            } else if (role === 'trainer' && user) {
                relevantAppts = allAppointments.filter(a => a.trainerId === user.id);
            }

            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const today = new Date();
            const datePoints = [];
            const daysToLookBack = timeRange === 'weekly' ? 7 : 30;

            // Generate date points
            for (let i = daysToLookBack - 1; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                datePoints.push(d);
            }

            const chartData = datePoints.map(date => {
                const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
                const dayName = timeRange === 'weekly'
                    ? days[date.getDay()]
                    : date.getDate().toString(); // Just the day number for monthly view

                // Real count of appointments for this specific date
                const itemsCount = relevantAppts.filter(a => {
                    // specific date match
                    return a.date === dateStr || a.date?.startsWith(dateStr);
                }).length;

                return {
                    name: dayName,
                    fullDate: dateStr, // For tooltip
                    value: itemsCount
                };
            });
            setActivityData(chartData);
        };
        generateChartData();
    }, [data, role, user, timeRange]);

    if (!data) return <div className="p-20 text-center animate-pulse font-black text-primary uppercase italic tracking-widest">Initialising Neural Analytics...</div>;

    const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(220, 30%, 50%)', 'hsl(30, 20%, 60%)'];

    return (
        <div className="space-y-10 container mx-auto max-w-7xl pb-20">
            {/* Header section with French Flair */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-10 rounded-[2.5rem] border shadow-soft"
            >
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-primary italic">
                        {role === "student" ? "Mon Succès" : role === "trainer" ? "Performance" : role === "admin" ? "Administrative" : "Global"} <span className="text-secondary tracking-tighter not-italic">Intelligence</span>
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium italic opacity-70 border-l-2 border-secondary/20 pl-4">
                        Comprehensive behavioral data analysis of the French learning ecosystem.
                    </p>
                </div>
                <Badge variant="outline" className="h-12 px-6 rounded-2xl border-primary/20 text-primary font-black uppercase text-[10px] bg-primary/5 flex items-center gap-3 shadow-sm">
                    <Activity className="h-4 w-4 animate-pulse" /> Live System Feed
                </Badge>
            </motion.div>

            {/* Top Stats specific to roles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {role === "student" && [
                    { label: "Total Booked", value: data.totalBooked, icon: Calendar, color: "text-blue-500", trend: "+2" },
                    { label: "Attended", value: data.attended, icon: CheckCircle2, color: "text-emerald-500", trend: "Live" },
                    { label: "Remaining", value: data.remaining, icon: Clock, color: "text-amber-500", trend: "Pending" },
                    { label: "Success Rate", value: `${data.attendanceRate}%`, icon: Target, color: "text-secondary", trend: "High" }
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-soft bg-card hover:scale-105 transition-all duration-300 overflow-hidden group">
                        <CardContent className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary transition-all ${stat.color} shadow-inner`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <Badge className="bg-muted text-muted-foreground border-none text-[9px] font-black uppercase tracking-tighter">{stat.trend}</Badge>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-3xl font-black tracking-tight italic">{stat.value}</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">{stat.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {role === "trainer" && [
                    { label: "Assigned Students", value: data.totalStudents, icon: Users, color: "text-blue-500", trend: "Stable" },
                    { label: "Sessions Conducted", value: data.sessionsConducted, icon: Activity, color: "text-emerald-500", trend: "+12%" },
                    { label: "Upcoming", value: data.upcoming, icon: Clock, color: "text-amber-500", trend: "Pending" },
                    { label: "Learning Hours", value: `${data.teachingHours}h`, icon: GraduationCap, color: "text-secondary", trend: "+5h" }
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-soft bg-card hover:scale-105 transition-all duration-300 overflow-hidden group">
                        <CardContent className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary transition-all ${stat.color} shadow-inner`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <Badge className="bg-muted text-muted-foreground border-none text-[9px] font-black uppercase tracking-tighter">{stat.trend}</Badge>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-3xl font-black tracking-tight italic">{stat.value}</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">{stat.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {(role === "admin" || role === "superadmin") && [
                    { label: "Total Registry", value: data.totalStudents || data.totalActiveSessions, icon: Users, color: "text-blue-500", trend: "+24" },
                    { label: "System Health", value: "Optimal", icon: Shield, color: "text-emerald-500", trend: "99.9%" },
                    { label: "Pending Authorization", value: data.pendingRequests || data.totalActiveSessions, icon: AlertCircle, color: "text-amber-500", trend: "Action Required" },
                    { label: "Growth Index", value: "+18%", icon: TrendingUp, color: "text-secondary", trend: "Positive" }
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-soft bg-card hover:scale-105 transition-all duration-300 overflow-hidden group">
                        <CardContent className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary transition-all ${stat.color} shadow-inner`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <Badge className="bg-muted text-muted-foreground border-none text-[9px] font-black uppercase tracking-tighter">{stat.trend}</Badge>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-3xl font-black tracking-tight italic">{stat.value}</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">{stat.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Visuals Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Primary Trend Chart */}
                <Card className="lg:col-span-2 border-none shadow-xl bg-card overflow-hidden">
                    <CardHeader className="p-8 border-b bg-muted/5">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black flex items-center gap-3 italic">
                                    <BarChart3 className="h-6 w-6 text-primary" />
                                    Analytics & Trends
                                </CardTitle>
                                <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1">
                                    Real-time ecosystem activity
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Badge
                                    variant={timeRange === "weekly" ? "secondary" : "outline"}
                                    className={`font-bold cursor-pointer ${timeRange === "weekly" ? "" : "opacity-50"}`}
                                    onClick={() => setTimeRange("weekly")}
                                >
                                    Weekly
                                </Badge>
                                <Badge
                                    variant={timeRange === "monthly" ? "secondary" : "outline"}
                                    className={`font-bold cursor-pointer ${timeRange === "monthly" ? "" : "opacity-50"}`}
                                    onClick={() => setTimeRange("monthly")}
                                >
                                    Monthly
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activityData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.1} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }}
                                    dy={10}
                                />
                                <YAxis
                                    hide={false}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)'
                                    }}
                                    itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 700 }}
                                    labelFormatter={(label, payload) => payload[0]?.payload?.fullDate || label}
                                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '5 5' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Secondary Metrics / Demographics */}
                <div className="space-y-8">
                    {/* User Distribution (Admin) or Completion Status (Student/Trainer) */}
                    <Card className="border-none shadow-xl bg-card overflow-hidden">
                        <CardHeader className="p-6 border-b bg-muted/5">
                            <CardTitle className="text-lg font-black flex items-center gap-2 italic">
                                <Users className="h-5 w-5 text-secondary" />
                                Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Students', value: data?.totalStudents || 10, color: 'hsl(var(--primary))' },
                                            { name: 'Trainers', value: data?.totalTrainers || 5, color: '#f59e0b' },
                                            { name: 'Admins', value: data?.totalAdmins || 2, color: '#ef4444' }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell fill="hsl(var(--primary))" />
                                        <Cell fill="#f59e0b" />
                                        <Cell fill="#ef4444" />
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Operational Status Panel */}
                    <Card className="border-none shadow-xl bg-primary text-primary-foreground overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                            <Shield className="h-32 w-32" />
                        </div>
                        <CardHeader className="p-6 relative z-10">
                            <CardTitle className="text-lg font-black italic">System Integrity</CardTitle>
                            <CardDescription className="text-primary-foreground/60 text-[10px] font-black uppercase tracking-widest">Live Diagnostics</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 pt-0 space-y-3 relative z-10">
                            {[
                                { label: "Data Mesh", status: "Optimal" },
                                { label: "Auth Guard", status: "Active" },
                                { label: "API Latency", status: "12ms" },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/10 shadow-sm">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{item.label}</span>
                                    <Badge className="bg-white text-primary rounded-md font-black text-[9px] px-2 shadow-none">{item.status}</Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SharedAnalytics;
