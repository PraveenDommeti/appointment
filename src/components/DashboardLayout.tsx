import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Send,
  Settings,
  Shield,
  UserCheck,
  Users,
  Video,
  type LucideIcon
} from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { NotificationBell } from "./NotificationBell";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface DashboardLayoutProps {
  children: ReactNode;
  role: "student" | "trainer" | "admin" | "superadmin";
  userName?: string;
}

const navConfigs: Record<string, NavItem[]> = {
  student: [
    { label: "Dashboard", href: "/student", icon: LayoutDashboard },
    { label: "Request a Session", href: "/student/book", icon: Calendar },
    { label: "Courses", href: "/student/courses", icon: BookOpen },
    { label: "My Sessions", href: "/student/meetings", icon: Video },
    { label: "My Calendar", href: "/student/calendar", icon: Clock },
    { label: "Materials", href: "/student/materials", icon: FileText },
    { label: "Analytics", href: "/student/analytics", icon: BarChart3 },
    { label: "Leave Requests", href: "/student/leave", icon: Send },
    { label: "Messages", href: "/student/messages", icon: MessageSquare },
    { label: "Settings", href: "/student/settings", icon: Settings },
  ],
  trainer: [
    { label: "Dashboard", href: "/trainer", icon: LayoutDashboard },
    { label: "Courses", href: "/trainer/courses", icon: BookOpen },
    { label: "My Calendar", href: "/trainer/schedule", icon: Calendar },
    { label: "Requests", href: "/trainer/requests", icon: Send },
    { label: "Leave Requests", href: "/trainer/leave-requests", icon: FileText },
    { label: "Students", href: "/trainer/students", icon: Users },
    { label: "Materials", href: "/trainer/materials", icon: BookOpen },
    { label: "Analytics", href: "/trainer/analytics", icon: BarChart3 },
    { label: "Timesheets", href: "/trainer/timesheet", icon: FileText },
    { label: "Messages", href: "/trainer/messages", icon: MessageSquare },
    { label: "Settings", href: "/trainer/settings", icon: Settings },
  ],
  admin: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Enrollments", href: "/admin/enrollments", icon: UserCheck },
    { label: "Approved Classes", href: "/admin/approved", icon: CheckCircle },
    { label: "Meetings", href: "/admin/meetings", icon: Video },
    { label: "Leave Requests", href: "/admin/leave-requests", icon: FileText },
    { label: "Trainer Timesheets", href: "/admin/trainer-timesheets", icon: FileText },
    { label: "Student Timesheets", href: "/admin/student-timesheets", icon: Clock },
    { label: "Courses", href: "/admin/courses", icon: BookOpen },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Messages", href: "/admin/messages", icon: MessageSquare },
    { label: "Materials", href: "/admin/materials", icon: BookOpen },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { label: "Slots", href: "/admin/slots", icon: Plus },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
  superadmin: [
    { label: "Dashboard", href: "/superadmin", icon: LayoutDashboard },
    { label: "Admins", href: "/superadmin/admins", icon: Shield },
    { label: "Users", href: "/superadmin/users", icon: Users },
    { label: "Timesheets", href: "/superadmin/timesheets", icon: FileText },
    { label: "Analytics", href: "/superadmin/analytics", icon: BarChart3 },
    { label: "Messages", href: "/superadmin/messages", icon: MessageSquare },
    { label: "Logs", href: "/superadmin/logs", icon: Shield },
    { label: "Settings", href: "/superadmin/settings", icon: Settings },
  ],
};

const roleLabels: Record<string, string> = {
  student: "Student",
  trainer: "Trainer",
  admin: "Admin",
  superadmin: "Super Admin",
};

const SidebarContent = ({
  navItems,
  location,
  userName,
  role,
  handleLogout
}: {
  navItems: NavItem[],
  location: any,
  userName: string,
  role: string,
  handleLogout: () => void
}) => (
  <aside className="flex h-full w-full flex-col bg-[#050505] text-white border-r border-[#1a1a1a] shadow-2xl transition-all duration-300">
    <div className="h-1 w-full bg-[#D4AF37]" />
    <div className="flex items-center gap-3 px-8 py-10">
      <div className="h-10 w-10 rounded-xl bg-[#D4AF37] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 font-black text-black text-2xl transform hover:rotate-12 transition-transform cursor-pointer">
        <span>F</span>
      </div>
      <div className="flex flex-col">
        <span className="font-display text-xl font-black tracking-tighter text-white uppercase italic leading-none">
          École <span className="text-[#D4AF37] tracking-widest text-[10px] block not-italic font-bold opacity-80 mt-1">DE FRANÇAIS</span>
        </span>
      </div>
    </div>
    <div className="px-6 py-4">
      <div className="rounded-2xl bg-[#111111] p-4 border border-[#222222] shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center font-black text-black text-xs shadow-lg shadow-[#D4AF37]/20">
            {userName.charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-[8px] text-white/30 uppercase font-black tracking-[0.2em]">Validated Node</p>
            <p className="font-display font-black text-xs truncate text-white italic">{userName}</p>
          </div>
        </div>
        <Badge className="w-full justify-center bg-[#D4AF37] text-black font-black uppercase tracking-widest text-[8px] hover:bg-[#D4AF37]/90 border-none rounded-lg py-1 shadow-md shadow-[#D4AF37]/10">
          {roleLabels[role]} Portal
        </Badge>
      </div>
    </div>
    <div className="flex-1 relative overflow-hidden">
      <ScrollArea className="h-full px-4 py-6">
        <ul className="space-y-1 pb-12">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-300 relative overflow-hidden",
                    isActive
                      ? "bg-[#D4AF37] text-black shadow-xl shadow-[#D4AF37]/10"
                      : "text-white/50 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive ? "text-black" : "text-[#D4AF37]")} />
                  <span className="tracking-tight uppercase font-black">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavHighlight"
                      className="absolute right-0 top-0 bottom-0 w-1 bg-black/20"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </ScrollArea>
    </div>
    <div className="border-t border-[#1a1a1a] p-4">
      <button
        onClick={handleLogout}
        className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-[#D4AF37] hover:text-black transition-all group"
      >
        <LogOut className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform" />
        Sign Out
      </button>
    </div>
  </aside>
);

const DashboardLayout = ({ children, role, userName = "User" }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const navItems = navConfigs[role];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    db.checkAndCompleteAppointments();
    const interval = setInterval(() => {
      db.checkAndCompleteAppointments();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen dashboard-theme bg-white text-foreground">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 z-40 h-screen w-72">
        <SidebarContent
          navItems={navItems}
          location={location}
          userName={userName}
          role={role}
          handleLogout={handleLogout}
        />
      </div>

      {/* Main content */}
      <main className="lg:ml-72 flex-1 bg-white min-h-screen relative flex flex-col w-full overflow-x-hidden">
        {/* Premium Top Bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-100 bg-white/90 backdrop-blur-md px-4 sm:px-6 lg:px-10 py-4">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Trigger */}
            <div className="lg:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-black">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72 bg-[#050505] border-none">
                  <SidebarContent
                    navItems={navItems}
                    location={location}
                    userName={userName}
                    role={role}
                    handleLogout={handleLogout}
                  />
                </SheetContent>
              </Sheet>
            </div>
            <div className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em] font-display">
              System Identity <span className="text-[#D4AF37]">v4.5</span>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <NotificationBell />
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm group hover:border-[#D4AF37] transition-colors">
              <span className="text-xs font-black text-black group-hover:text-[#D4AF37] transition-colors">{userName.charAt(0)}</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-12 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

