import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/db";
import {
    BarChart3,
    BookOpen,
    Calendar,
    CheckCircle2,
    Clock,
    Target,
    TrendingUp,
    Users
} from "lucide-react";
import { useEffect, useState } from "react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
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

const TrainerAnalytics = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalCourses: 0,
        sessionsCompleted: 0,
        upcomingSessions: 0,
        teachingHours: 0,
        attendanceRate: 0
    });
    const [weeklyData, setWeeklyData] = useState<any[]>([]);
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [courseData, setCourseData] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = () => {
            if (!user?.id) return;

            const courses = db.getCourses().filter(c => c.trainerId === user.id);
            const allAppointments = db.getAllAppointments();
            const trainerAppointments = allAppointments.filter(a => a.trainerId === user.id);

            const completed = trainerAppointments.filter(a => a.status === "Completed").length;
            const upcoming = trainerAppointments.filter(a => a.status === "Approved").length;

            const teachingHours = trainerAppointments
                .filter(a => a.status === "Completed")
                .reduce((sum, a) => sum + (a.duration || 60), 0) / 60;

            // Get unique students
            const uniqueStudents = new Set(
                courses.flatMap(c => c.studentsEnrolled)
            );

            const attendanceRate = trainerAppointments.length > 0
                ? Math.round((completed / trainerAppointments.length) * 100)
                : 0;

            setStats({
                totalStudents: uniqueStudents.size,
                totalCourses: courses.length,
                sessionsCompleted: completed,
                upcomingSessions: upcoming,
                teachingHours: Math.round(teachingHours * 10) / 10,
                attendanceRate
            });

            // Dynamic Weekly Sessions Data
            const getLast5Weeks = () => {
                const weeks = [];
                for (let i = 4; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - (i * 7));
                    const weekLabel = `Week ${5 - i}`;

                    const start = new Date(d);
                    start.setDate(d.getDate() - 6);
                    const end = new Date(d);

                    const weekAppts = trainerAppointments.filter(a => {
                        const aDate = new Date(a.date);
                        return aDate >= start && aDate <= end;
                    });

                    const uniqueStudentsInWeek = new Set(weekAppts.map(a => a.userId));

                    weeks.push({
                        week: weekLabel,
                        sessions: weekAppts.filter(a => a.status === 'Completed').length,
                        students: uniqueStudentsInWeek.size
                    });
                }
                return weeks;
            };
            setWeeklyData(getLast5Weeks());

            // Dynamic Monthly Teaching Hours
            const getMonthlyData = () => {
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const currentMonth = new Date().getMonth();
                const last5Months = [];

                for (let i = 4; i >= 0; i--) {
                    const mIndex = (currentMonth - i + 12) % 12;
                    const monthName = months[mIndex];

                    const monthAppts = trainerAppointments.filter(a => {
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

            // Course performance dynamic
            const courseStats = courses.map(course => {
                const courseAppts = allAppointments.filter(a => a.courseId === course.id && a.status === 'Completed');
                return {
                    name: course.title.length > 15 ? course.title.substring(0, 15) + '...' : course.title,
                    students: course.studentsEnrolled?.length || 0,
                    sessions: courseAppts.length
                };
            }).sort((a, b) => b.sessions - a.sessions).slice(0, 5);
            setCourseData(courseStats);
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [user?.id]);

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground">
                        Teaching <span className="text-primary">Analytics</span>
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium mt-2">
                        Monitor your teaching performance and student engagement
                    </p>
                </div>
                <Badge variant="outline" className="text-xs font-bold">
                    Last updated: {new Date().toLocaleTimeString()}
                </Badge>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Users}
                    label="Total Students"
                    value={stats.totalStudents}
                    description="Unique learners taught"
                    color="bg-primary"
                />
                <StatCard
                    icon={BookOpen}
                    label="Courses Created"
                    value={stats.totalCourses}
                    description="Active curriculum"
                    color="bg-blue-500"
                />
                <StatCard
                    icon={CheckCircle2}
                    label="Sessions Completed"
                    value={stats.sessionsCompleted}
                    description="Total classes taught"
                    color="bg-emerald-500"
                />
                <StatCard
                    icon={Clock}
                    label="Teaching Hours"
                    value={stats.teachingHours}
                    description="Total instruction time"
                    color="bg-purple-500"
                />
            </div>

            {/* Additional Stats */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-none shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-muted-foreground mb-1">Upcoming Sessions</p>
                                <p className="text-4xl font-black">{stats.upcomingSessions}</p>
                            </div>
                            <div className="h-16 w-16 rounded-2xl bg-amber-100 flex items-center justify-center">
                                <Calendar className="h-8 w-8 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-muted-foreground mb-1">Student Attendance</p>
                                <p className="text-4xl font-black">{stats.attendanceRate}%</p>
                            </div>
                            <div className="h-16 w-16 rounded-2xl bg-green-100 flex items-center justify-center">
                                <Target className="h-8 w-8 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Weekly Performance */}
                <Card className="border-none shadow-lg">
                    <CardHeader className="border-b bg-muted/5 p-6">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Weekly Performance
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                            Sessions and student engagement
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
                                <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="students" fill="#10b981" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Monthly Teaching Hours */}
                <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-300">
                    <CardHeader className="border-b bg-muted/5 p-8">
                        <CardTitle className="text-2xl font-black italic flex items-center gap-3">
                            <Clock className="h-6 w-6 text-primary" />
                            Monthly Instruction
                        </CardTitle>
                        <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-50">Teaching hours progression</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData}>
                                <defs>
                                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.1} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        borderRadius: '12px',
                                        border: '1px solid hsl(var(--border))',
                                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)'
                                    }}
                                    itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 700 }}
                                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '5 5' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="hours"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorHours)"
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Course Performance */}
            <Card className="border-none shadow-lg">
                <CardHeader className="border-b bg-muted/5 p-6">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Course Performance
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                        Student enrollment and session completion by course
                    </p>
                </CardHeader>
                <CardContent className="p-6 h-[350px]">
                    {courseData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={courseData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#00000010" />
                                <XAxis type="number" tick={{ fontSize: 12, fontWeight: 600 }} />
                                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fontWeight: 600 }} width={150} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)'
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="students" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
                                <Bar dataKey="sessions" fill="#10b981" radius={[0, 8, 8, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p className="text-sm font-medium opacity-50">No course data available</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default TrainerAnalytics;
