import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/db";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
    Activity,
    BookOpen,
    Calendar,
    CheckCircle2,
    Clock,
    Shield,
    Target,
    Users,
    XCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis, YAxis
} from 'recharts';

const StatCard = ({ icon: Icon, label, value, description, trend, color }: any) => (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 group bg-card">
        <CardContent className="p-0">
            <div className={`h-1 w-full ${color}`} />
            <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                    <div className={`p-2.5 rounded-xl ${color.replace('bg-', 'bg-')}/10 shadow-inner group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-5 w-5 ${color.replace('bg-', 'text-')}`} />
                    </div>
                </div>
                <div className="space-y-0.5">
                    <h3 className="text-3xl font-black tracking-tighter italic font-display">{value}</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">{label}</p>
                </div>
                <p className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground mt-4 flex items-center gap-1 opacity-30 italic">
                    <Target className="h-3 w-3" /> {description}
                </p>
            </div>
        </CardContent>
    </Card>
);

// ... (keep StatCard component as is) ...

const AdminHome = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTrainers: 0,
        totalCourses: 0,
        totalSessions: 0,
        completedSessions: 0,
        pendingRequests: 0,
        rejectedRequests: 0
    });
    const [chartData, setChartData] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        const refreshData = () => {
            const users = db.getUsers();
            const courses = db.getCourses();
            const appointments = db.getAllAppointments();

            setStats({
                totalStudents: users.filter(u => u.role === 'student').length,
                totalTrainers: users.filter(u => u.role === 'trainer').length,
                totalCourses: courses.length,
                totalSessions: appointments.length,
                completedSessions: appointments.filter(a => a.status === 'Completed').length,
                pendingRequests: appointments.filter(a => a.status === 'Pending').length,
                rejectedRequests: appointments.filter(a => a.status === 'Rejected').length
            });

            // 1. Chart Data: Top 5 Courses by Enrollment
            const topCourses = courses
                .map(c => ({
                    name: c.title.length > 15 ? c.title.substring(0, 15) + '...' : c.title,
                    enrollments: c.studentsEnrolled?.length || 0,
                    revenue: (c.studentsEnrolled?.length || 0) * (c.price || 0)
                }))
                .sort((a, b) => b.enrollments - a.enrollments)
                .slice(0, 5);

            setChartData(topCourses.length > 0 ? topCourses : [
                { name: 'No Active Courses', enrollments: 0, revenue: 0 }
            ]);

            // 2. Activity Feed: Combine Users (joined) and Appts (created)
            const activities = [
                ...users.map(u => ({
                    id: u.id,
                    type: 'user',
                    text: `New Identity: ${u.name} (${u.role})`,
                    time: u.joinedDate ? new Date(u.joinedDate) : new Date(),
                    icon: Users,
                    color: 'text-blue-500'
                })),
                ...appointments.map(a => ({
                    id: a.id,
                    type: 'appt',
                    text: `Session Request: ${a.topic}`,
                    time: a.createdAt ? new Date(a.createdAt) : new Date(),
                    icon: Calendar,
                    color: 'text-primary'
                }))
            ].sort((a, b) => b.time.getTime() - a.time.getTime())
                .slice(0, 10); // Last 10 events

            setRecentActivity(activities);
        };

        refreshData();
        const interval = setInterval(refreshData, 5000);
        return () => clearInterval(interval);
    }, [user]);

    return (
        <div className="space-y-8 pb-10">
            {/* ... (Header sections unchanged) ... */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-8">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                >
                    <Badge className="bg-primary/5 text-primary border-primary/20 rounded-lg px-2 py-0 font-black text-[9px] uppercase tracking-widest">
                        Administrative Authority
                    </Badge>
                    <h1 className="font-display text-5xl font-black tracking-tighter text-foreground leading-[0.9]">
                        Système <span className="text-primary italic not-italic">Central</span> <span className="text-3xl">🛡</span>
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium italic opacity-60 mt-2">
                        "Overseeing the synchronization of global learning protocols."
                    </p>
                </motion.div>

                <div className="flex gap-4 shrink-0">
                    <Button variant="outline" className="h-14 px-8 rounded-2xl shadow-soft border-muted-foreground/10 font-bold hover:bg-white transition-all bg-white" onClick={() => navigate('/admin/users')}>
                        <Users className="h-5 w-5 mr-3 text-primary" /> Manage Nodes
                    </Button>
                    <Button className="h-14 px-8 rounded-2xl bg-[#0b1120] text-white shadow-xl shadow-[#0b1120]/20 hover:scale-105 transition-all font-black uppercase tracking-widest text-xs" onClick={() => navigate('/admin/analytics')}>
                        Intelligence Hub
                    </Button>
                </div>
            </div>

            {/* Spec: Full Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                <StatCard icon={Users} label="Total Students" value={stats.totalStudents} description="Active learners" color="bg-primary" />
                <StatCard icon={Shield} label="Total Trainers" value={stats.totalTrainers} description="Assigned instructors" color="bg-blue-500" />
                <StatCard icon={BookOpen} label="Total Courses" value={stats.totalCourses} description="Curriculum modules" color="bg-indigo-500" />
                <StatCard icon={Activity} label="Total Sessions" value={stats.totalSessions} description="Global traffic" color="bg-amber-500" />
                <StatCard icon={CheckCircle2} label="Completed" value={stats.completedSessions} description="Success packets" color="bg-emerald-500" />
                <StatCard icon={Clock} label="Pending" value={stats.pendingRequests} description="Awaiting authorization" color="bg-orange-500" />
                <StatCard icon={XCircle} label="Rejected" value={stats.rejectedRequests} description="Protocol failures" color="bg-rose-500" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Course Metrics Chart */}
                <Card className="lg:col-span-2 border-none shadow-2xl bg-card overflow-hidden rounded-[2.5rem]">
                    <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-black tracking-tighter italic text-foreground">Course <span className="text-primary">Success Metrics</span></CardTitle>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Top performing curriculum modules</p>
                        </div>
                        <Badge variant="secondary" className="font-bold">By Enrollment</Badge>
                    </CardHeader>
                    <CardContent className="p-8 pt-6 h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#00000005" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="enrollments" fill="hsl(var(--primary))" radius={[0, 10, 10, 0]} barSize={30}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'][index % 5]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Live Activity Log */}
                <Card className="border-none shadow-2xl bg-[#0b1120] text-white overflow-hidden rounded-[2.5rem] relative h-[500px]">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Activity className="h-32 w-32" />
                    </div>
                    <CardHeader className="p-8 shrink-0 relative z-10 bg-[#0b1120]">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black tracking-tighter italic uppercase">Admin <span className="text-primary">Log</span></CardTitle>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Live System Events & Activity Feeds</p>
                            </div>
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-y-auto h-[380px] scrollbar-hide relative z-10">
                        <div className="space-y-0 px-6 pb-6">
                            {recentActivity.length > 0 ? (
                                recentActivity.map((activity, i) => (
                                    <div key={i} className="flex gap-4 p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                                        <div className={`mt-1 p-2 rounded-full bg-white/10 ${activity.color}`}>
                                            <activity.icon className="h-3 w-3" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white/90">{activity.text}</p>
                                            <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest mt-1">
                                                {formatDistanceToNow(activity.time, { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-white/30 italic">No recent activity detected.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminHome;
