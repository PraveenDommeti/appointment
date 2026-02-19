import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/db";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  GraduationCap,
  MessageSquare,
  Plus,
  Shield,
  Target,
  TrendingUp
} from "lucide-react";
import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import StudentAnalytics from "./student/StudentAnalytics";
import StudentAttendance from "./student/StudentAttendance";
import StudentBookClass from "./student/StudentBookClass";
import StudentCalendar from "./student/StudentCalendar";
import StudentCourses from "./student/StudentCourses";
import StudentLeave from "./student/StudentLeave";
import StudentMaterials from "./student/StudentMaterials";
import StudentMeetings from "./student/StudentMeetings";
import StudentMessages from "./student/StudentMessages";
import StudentSettings from "./student/StudentSettings";
import StudentTimesheet from "./student/StudentTimesheet";

const StatCard = ({ icon: Icon, label, value, description, trend, color }: any) => (
  <Card className="overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 group bg-card">
    <CardContent className="p-0">
      <div className={`h-1.5 w-full ${color}`} />
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-2xl ${color.replace('bg-', 'bg-')}/10 shadow-inner group-hover:scale-110 transition-transform`}>
            <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
          </div>
          {trend && (
            <Badge variant="outline" className="text-green-500 bg-green-500/5 border-green-500/20 gap-1">
              <ArrowUpRight className="h-3 w-3" /> {trend}
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1 opacity-70">
          <Target className="h-3 w-3" /> {description}
        </p>
      </div>
    </CardContent>
  </Card>
);

const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    upcomingClasses: 0,
    hoursThisWeek: 0,
    materialsCount: 0,
    attendanceRate: "0%"
  });
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);

  useEffect(() => {
    const refreshStats = () => {
      if (!user) return;
      const schedule = db.getUnifiedSchedule(user.id);
      const materials = db.getMaterials();
      const timeLogs = db.getTimeLogs(user.id);

      const activeAp = schedule.filter(a => ['Approved', 'Pending'].includes(a.status));
      const upcoming = activeAp.filter(a => new Date(a.date) >= new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const totalHours = timeLogs.reduce((acc: any, log: any) => acc + log.hours, 0);
      const attendanceRate = upcoming.length > 0 ? "100%" : "0%";

      setStats({
        upcomingClasses: upcoming.length,
        hoursThisWeek: totalHours,
        materialsCount: materials.length,
        attendanceRate
      });

      setUpcomingClasses(upcoming.slice(0, 3));
    };

    refreshStats();
    window.addEventListener('db-update', refreshStats);
    window.addEventListener('storage', refreshStats);
    return () => {
      window.removeEventListener('db-update', refreshStats);
      window.removeEventListener('storage', refreshStats);
    };
  }, [user]);

  return (
    <div className="space-y-10 container mx-auto max-w-7xl pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
            Student <span className="text-primary italic">Journey</span> 🚀
          </h1>
          <p className="text-muted-foreground text-lg mt-1 font-medium italic opacity-80">
            "Every lesson is a step towards mastering the world."
          </p>
        </motion.div>

        <div className="flex gap-3">
          <Button variant="outline" className="shadow-sm border-muted-foreground/20" onClick={() => navigate('/student/book')}>
            <Plus className="h-4 w-4 mr-2" /> Book Class
          </Button>
          <Button className="bg-primary shadow-lg shadow-primary/20 hover:scale-105 transition-transform" onClick={() => navigate('/student/calendar')}>
            View My Calendar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Calendar}
          label="Sessions Booked"
          value={stats.upcomingClasses.toString()}
          description="Total active sessions"
          trend="+2"
          color="bg-primary"
        />
        <StatCard
          icon={CheckCircle2}
          label="Attended"
          value="0"
          description="Units completed"
          color="bg-emerald-500"
        />
        <StatCard
          icon={Clock}
          label="Learning Hours"
          value={stats.hoursThisWeek.toString()}
          description="Lifetime effort"
          color="bg-blue-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Attendance"
          value={stats.attendanceRate}
          description="Mesh sync score"
          color="bg-amber-500"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-xl bg-card overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/5 p-6">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold">Upcoming Schedule</CardTitle>
              <p className="text-sm text-muted-foreground">Your confirmed language sessions</p>
            </div>
            <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5" onClick={() => navigate('/student/calendar')}>
              Full Calendar <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {upcomingClasses.length > 0 ? (
              <div className="space-y-4">
                {upcomingClasses.map((cls, i) => (
                  <div key={i} className="group flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all border border-transparent hover:border-primary/20">
                    <div className="flex items-center gap-5">
                      <div className="h-12 w-12 rounded-2xl bg-background shadow-sm flex flex-col items-center justify-center border group-hover:border-primary/50 transition-colors">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{cls.topic}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
                          <Clock className="h-3.5 w-3.5" /> {cls.date} • {cls.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {cls.meetingLink ? (
                        <Button
                          size="sm"
                          className="bg-primary shadow-lg shadow-primary/20 hover:scale-105 transition-transform rounded-xl text-[10px] font-black uppercase h-8 px-4"
                          onClick={() => window.open(cls.meetingLink, '_blank')}
                        >
                          Join Now
                        </Button>
                      ) : (
                        <Badge className={`${cls.status === 'Pending' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'} border-none shadow-sm rounded-lg px-3 py-1`}>
                          {cls.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 border-2 border-dashed rounded-3xl">
                <Calendar className="h-10 w-10 mb-2 opacity-10" />
                <h3 className="text-xl font-semibold">No Classes Found</h3>
                <p className="text-sm mt-1">Book your first session to begin.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Insights Placeholder */}
        <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
          <CardHeader className="p-6">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Shield className="h-5 w-5" /> Learning Status
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-6">
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-2">Progress Velocity</p>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-black">0%</span>
                  <span className="text-xs bg-green-500/30 px-2 py-0.5 rounded-full">New</span>
                </div>
                <div className="h-1.5 w-full bg-white/20 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-white w-[0%]" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <h5 className="font-bold mb-4">Quick Tasks</h5>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 rounded-xl bg-white text-indigo-600 hover:bg-white/90 transition-colors shadow-lg shadow-black/10" onClick={() => navigate('/student/materials')}>
                  <span className="text-sm font-bold">Review Materials</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/20" onClick={() => navigate('/student/messages')}>
                  <span className="text-sm font-bold">Platform Messages</span>
                  <MessageSquare className="h-4 w-4" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  const { user } = useAuth();
  return (
    <DashboardLayout role="student" userName={user?.name || "Student"}>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/book" element={<StudentBookClass />} />
        <Route path="/courses" element={<StudentCourses />} />
        <Route path="/meetings" element={<StudentMeetings />} />
        <Route path="/calendar" element={<StudentCalendar />} />
        <Route path="/materials" element={<StudentMaterials />} />
        <Route path="/timesheet" element={<StudentTimesheet />} />
        <Route path="/attendance" element={<StudentAttendance />} />
        <Route path="/messages" element={<StudentMessages />} />
        <Route path="/leave" element={<StudentLeave />} />
        <Route path="/analytics" element={<StudentAnalytics />} />
        <Route path="/settings" element={<StudentSettings />} />
      </Routes>
    </DashboardLayout>
  );
};

export default StudentDashboard;
