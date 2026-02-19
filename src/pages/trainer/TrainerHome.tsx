import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Appointment, db } from "@/lib/db";
import {
    ArrowUpRight,
    BookOpen,
    CheckCircle2,
    Clock,
    Target,
    TrendingUp,
    Users,
    Video
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Bar,
    BarChart,
    CartesianGrid,
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
                    {trend && (
                        <Badge variant="outline" className="text-green-500 bg-green-500/5 border-green-500/20 gap-0.5 text-[9px] font-black uppercase">
                            <ArrowUpRight className="h-3 w-3" /> {trend}
                        </Badge>
                    )}
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

const TrainerHome = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalStudents: 0,
        coursesCreated: 0,
        sessionsConducted: 0,
        sessionsCompleted: 0,
        upcomingSessions: 0,
        teachingHours: 0
    });

    const [upcomingClasses, setUpcomingClasses] = useState<Appointment[]>([]);
    const [performanceData, setPerformanceData] = useState<any[]>([]);

    const refreshStats = () => {
        if (!user) return;
        const schedule = db.getUnifiedSchedule(user.id);
        const courses = db.getCourses().filter(c => c.trainerId === user.id);

        const myAppts = db.getAllAppointments().filter(a => a.trainerId === user.id);
        const completed = myAppts.filter(a => a.status === "Completed");

        // Use unified schedule for upcoming
        const upcoming = schedule.filter(a => a.status === "Approved" || a.status === "Pending");
        const hours = completed.reduce((acc, a) => acc + (a.duration || 60), 0) / 60;

        const studentIds = new Set<string>();
        courses.forEach(c => (c.studentsEnrolled || []).forEach(sId => studentIds.add(sId)));

        setStats({
            totalStudents: studentIds.size,
            coursesCreated: courses.length,
            sessionsConducted: completed.length + upcoming.length,
            sessionsCompleted: completed.length,
            upcomingSessions: upcoming.length,
            teachingHours: Math.round(hours)
        });

        setUpcomingClasses(upcoming.filter(a => ["Approved", "Pending"].includes(a.status)).slice(0, 3));

        // Mock data for charts - Spec requires charts
        setPerformanceData([
            { name: 'Mon', sessions: 4 },
            { name: 'Tue', sessions: 7 },
            { name: 'Wed', sessions: 5 },
            { name: 'Thu', sessions: 8 },
            { name: 'Fri', sessions: 6 },
            { name: 'Sat', sessions: 3 },
            { name: 'Sun', sessions: 2 },
        ]);
    };

    useEffect(() => {
        refreshStats();
        const interval = setInterval(refreshStats, 5000);
        return () => clearInterval(interval);
    }, [user]);

    return (
        <div className="space-y-8 pb-10">
            {/* Spec-compliant Minimal Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-8">
                <div>
                    <Badge className="bg-primary/5 text-primary border-primary/20 rounded-lg px-2 py-0 font-black text-[9px] uppercase tracking-widest mb-2">
                        Instructor Terminal
                    </Badge>
                    <h1 className="font-display text-5xl font-black tracking-tighter text-foreground leading-[0.9]">
                        Formateur <span className="text-primary italic not-italic">Dashboard</span> <span className="text-3xl">☕</span>
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium italic opacity-60 mt-2">
                        "Enseigner, c'est apprendre deux fois."
                    </p>
                </div>

                <div className="flex gap-4 shrink-0">
                    <Button variant="outline" className="h-14 px-8 rounded-2xl shadow-soft border-muted-foreground/10 font-bold hover:bg-white transition-all bg-white" onClick={() => navigate('/trainer/courses')}>
                        <BookOpen className="h-5 w-5 mr-3 text-primary" /> Manage Courses
                    </Button>
                    <Button className="h-14 px-8 rounded-2xl bg-[#0b1120] text-white shadow-xl shadow-[#0b1120]/20 hover:scale-105 transition-all font-black uppercase tracking-widest text-xs" onClick={() => navigate('/trainer/schedule')}>
                        Lancer la Session
                    </Button>
                </div>
            </div>

            {/* Spec: Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard icon={Users} label="Total Students" value={stats.totalStudents} description="Active learners" color="bg-primary" />
                <StatCard icon={BookOpen} label="Courses" value={stats.coursesCreated} description="Modules active" color="bg-blue-500" />
                <StatCard icon={CheckCircle2} label="Conducted" value={stats.sessionsConducted} description="Total workload" color="bg-emerald-500" />
                <StatCard icon={TrendingUp} label="Completed" value={stats.sessionsCompleted} description="Success index" color="bg-indigo-500" />
                <StatCard icon={Video} label="Upcoming" value={stats.upcomingSessions} description="Pending units" color="bg-amber-500" />
                <StatCard icon={Clock} label="Teaching Hours" value={stats.teachingHours} description="Lifetime impact" color="bg-rose-500" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Performance Charts - Spec Requirement */}
                <Card className="lg:col-span-2 border-none shadow-2xl bg-card overflow-hidden rounded-[2.5rem]">
                    <CardHeader className="p-8 pb-0">
                        <CardTitle className="text-2xl font-black tracking-tighter italic">Weekly <span className="text-primary">Engagement</span></CardTitle>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Load distribution across the network</p>
                    </CardHeader>
                    <CardContent className="p-8 pt-6 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000005" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} />
                                <Tooltip cursor={{ fill: '#f8f9fc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[10, 10, 10, 10]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Upcoming Classes - Spec Requirement */}
                <Card className="border-none shadow-2xl bg-card overflow-hidden rounded-[2.5rem]">
                    <CardHeader className="p-8 border-b bg-muted/5">
                        <CardTitle className="text-xl font-black tracking-tighter italic">Upcoming <span className="text-primary">Protocol</span></CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {upcomingClasses.length > 0 ? (
                            <div className="space-y-4">
                                {upcomingClasses.map((cls) => (
                                    <div key={cls.id} className="p-4 rounded-2xl bg-muted/20 hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-black/5 group cursor-pointer">
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                                                {cls.time.split(':')[0]}h
                                            </div>
                                            <div>
                                                <p className="font-black text-sm tracking-tight group-hover:text-primary transition-colors">{cls.topic}</p>
                                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40 italic">{cls.date}</p>
                                            </div>
                                        </div>
                                        {cls.meetingLink ? (
                                            <Button size="sm" className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[9px]" onClick={() => window.open(cls.meetingLink, '_blank')}>
                                                Launch Join Sequence
                                            </Button>
                                        ) : (
                                            <Button variant="outline" size="sm" className="w-full rounded-xl border-dashed opacity-40 font-black uppercase tracking-widest text-[9px]" onClick={() => navigate('/trainer/requests')}>
                                                Link Pending Sync
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center opacity-20 italic font-bold uppercase tracking-widest text-xs">
                                No active sessions in immediate radius.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TrainerHome;
