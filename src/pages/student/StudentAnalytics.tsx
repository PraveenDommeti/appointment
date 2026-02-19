import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/db";
import {
    AlertCircle,
    Award,
    BookOpen,
    Calendar, CheckCircle2,
    Clock,
    Target,
    TrendingUp,
    XCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis, YAxis
} from 'recharts';

const StatCard = ({ icon: Icon, label, value, description, color }: any) => (
    <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className={`h-1.5 w-full ${color}`} />
        <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ${color}/10`}>
                    <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
                </div>
            </div>
            <h3 className="text-3xl font-black tracking-tight mb-1">{value}</h3>
            <p className="text-sm font-bold text-muted-foreground mb-2">{label}</p>
            <p className="text-xs text-muted-foreground opacity-70">{description}</p>
        </CardContent>
    </Card>
);

const StudentAnalytics = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalSessions: 0,
        attended: 0,
        pending: 0,
        rejected: 0,
        totalHours: 0,
        attendanceRate: 0
    });
    const [weeklyData, setWeeklyData] = useState<any[]>([]);
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [statusData, setStatusData] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = () => {
            if (!user?.id) return;

            const appointments = db.getAppointments(user.id);

            const attended = appointments.filter(a => a.status === "Completed").length;
            const pending = appointments.filter(a => a.status === "Pending").length;
            const rejected = appointments.filter(a => a.status === "Rejected").length;
            const totalHours = appointments
                .filter(a => a.status === "Completed")
                .reduce((sum, a) => sum + (a.duration || 60), 0) / 60;

            const attendanceRate = appointments.length > 0
                ? Math.round((attended / appointments.length) * 100)
                : 0;

            setStats({
                totalSessions: appointments.length,
                attended,
                pending,
                rejected,
                totalHours: Math.round(totalHours * 10) / 10,
                attendanceRate
            });

            // Dynamic Weekly Data (Last 5 weeks)
            const getLast5Weeks = () => {
                const weeks = [];
                for (let i = 4; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - (i * 7));
                    const weekLabel = `Week ${5 - i}`; // Simplifying for display

                    // Filter appointments for this approximate week window
                    // This is a simplified logic. For production, use date-fns or moment
                    const start = new Date(d);
                    start.setDate(d.getDate() - 6);
                    const end = new Date(d);

                    const weekAppts = appointments.filter(a => {
                        const aDate = new Date(a.date);
                        return aDate >= start && aDate <= end;
                    });

                    weeks.push({
                        week: weekLabel,
                        attended: weekAppts.filter(a => a.status === 'Completed').length,
                        missed: weekAppts.filter(a => a.status === 'Rejected' || (a.status === 'Pending' && new Date(a.date) < new Date())).length
                    });
                }
                return weeks;
            };
            setWeeklyData(getLast5Weeks());

            // Dynamic Monthly Data
            const getMonthlyData = () => {
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const currentMonth = new Date().getMonth();
                const last5Months = [];

                for (let i = 4; i >= 0; i--) {
                    const mIndex = (currentMonth - i + 12) % 12;
                    const monthName = months[mIndex];

                    // Filter by month
                    const monthAppts = appointments.filter(a => {
                        const d = new Date(a.date);
                        return d.getMonth() === mIndex;
                    });

                    const hours = monthAppts
                        .filter(a => a.status === 'Completed')
                        .reduce((sum, a) => sum + (a.duration || 60), 0) / 60;

                    last5Months.push({ month: monthName, hours: Math.round(hours * 10) / 10 });
                }
                return last5Months;
            };
            setMonthlyData(getMonthlyData());

            // Status distribution
            setStatusData([
                { name: 'Completed', value: attended, color: '#10b981' },
                { name: 'Pending', value: pending, color: '#f59e0b' },
                { name: 'Rejected', value: rejected, color: '#ef4444' },
            ]);
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [user?.id]);

    const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground">
                        Learning <span className="text-primary">Analytics</span>
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium mt-2">
                        Track your progress and performance metrics
                    </p>
                </div>
                <Badge variant="outline" className="text-xs font-bold">
                    Last updated: {new Date().toLocaleTimeString()}
                </Badge>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={BookOpen}
                    label="Total Sessions"
                    value={stats.totalSessions}
                    description="All time bookings"
                    color="bg-primary"
                />
                <StatCard
                    icon={CheckCircle2}
                    label="Attended"
                    value={stats.attended}
                    description="Completed sessions"
                    color="bg-emerald-500"
                />
                <StatCard
                    icon={Clock}
                    label="Learning Hours"
                    value={stats.totalHours}
                    description="Total study time"
                    color="bg-blue-500"
                />
                <StatCard
                    icon={Target}
                    label="Attendance Rate"
                    value={`${stats.attendanceRate}%`}
                    description="Completion percentage"
                    color="bg-purple-500"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Weekly Attendance */}
                <Card className="border-none shadow-lg">
                    <CardHeader className="border-b bg-muted/5 p-6">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Weekly Attendance
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                            Last 5 weeks performance
                        </p>
                    </CardHeader>
                    <CardContent className="p-6 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000010" />
                                <XAxis dataKey="week" tick={{ fontSize: 12, fontWeight: 600 }} />
                                <YAxis tick={{ fontSize: 12, fontWeight: 600 }} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)'
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="attended" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="missed" fill="#ef4444" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Monthly Learning Hours */}
                <Card className="border-none shadow-lg">
                    <CardHeader className="border-b bg-muted/5 p-6">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            Monthly Learning Hours
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                            Study time progression
                        </p>
                    </CardHeader>
                    <CardContent className="p-6 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000010" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fontWeight: 600 }} />
                                <YAxis tick={{ fontSize: 12, fontWeight: 600 }} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="hours"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={3}
                                    dot={{ fill: 'hsl(var(--primary))', r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Status Distribution */}
            <div className="grid lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-none shadow-xl hover:shadow-2xl transition-all duration-300">
                    <CardHeader className="border-b bg-muted/5 p-8">
                        <CardTitle className="text-2xl font-black italic flex items-center gap-3">
                            <Award className="h-6 w-6 text-primary" />
                            Session Status Distribution
                        </CardTitle>
                        <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-50">Visual breakdown of your learning journey</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={5}
                                    dataKey="value"
                                    cornerRadius={8}
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)' }}
                                    itemStyle={{ fontWeight: 700 }}
                                />
                                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="border-none shadow-lg bg-gradient-to-br from-primary/5 to-purple-500/5">
                    <CardHeader className="p-6">
                        <CardTitle className="text-lg font-bold">Performance Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/80 backdrop-blur-sm border">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-muted-foreground">Completed</p>
                                        <p className="text-2xl font-black">{stats.attended}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/80 backdrop-blur-sm border">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                        <AlertCircle className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-muted-foreground">Pending</p>
                                        <p className="text-2xl font-black">{stats.pending}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/80 backdrop-blur-sm border">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center">
                                        <XCircle className="h-5 w-5 text-rose-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-muted-foreground">Rejected</p>
                                        <p className="text-2xl font-black">{stats.rejected}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default StudentAnalytics;
