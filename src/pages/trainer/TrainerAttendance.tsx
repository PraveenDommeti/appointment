import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    CheckCircle2, XCircle, Calendar, Clock,
    Search, Filter, Save, Users, BookOpen, ChevronRight
} from "lucide-react";
import { db, User as UserInfo, Course, AttendanceRecord } from "@/lib/db";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const TrainerAttendance = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState<UserInfo[]>([]);
    const [attendanceRecord, setAttendanceRecord] = useState<Record<string, "Present" | "Absent">>({});
    const [isSaving, setIsSaving] = useState(false);

    const refreshData = () => {
        if (!user) return;
        const myCourses = db.getCourses().filter(c => c.trainerId === user.id);
        setCourses(myCourses);
        if (myCourses.length > 0 && !selectedCourseId) {
            setSelectedCourseId(myCourses[0].id);
        }
    };

    useEffect(() => {
        refreshData();
    }, [user?.id]);

    useEffect(() => {
        if (selectedCourseId) {
            const course = courses.find(c => c.id === selectedCourseId);
            if (course) {
                const allUsers = db.getUsers();
                const enrolled = allUsers.filter(u => course.studentsEnrolled.includes(u.id));
                setStudents(enrolled);

                // Fetch existing record if any
                const existing = db.getAttendanceRecords().filter(a => a.courseId === selectedCourseId && a.date === selectedDate);
                const recordMap: Record<string, "Present" | "Absent"> = {};
                enrolled.forEach(s => {
                    const found = existing.find(a => a.studentId === s.id);
                    recordMap[s.id] = found ? (found.status as any) : "Present"; // Default to Present
                });
                setAttendanceRecord(recordMap);
            }
        }
    }, [selectedCourseId, selectedDate, courses]);

    const toggleStatus = (studentId: string) => {
        setAttendanceRecord(prev => ({
            ...prev,
            [studentId]: prev[studentId] === "Present" ? "Absent" : "Present"
        }));
    };

    const handleSave = async () => {
        if (!selectedCourseId || !user) return;
        setIsSaving(true);
        try {
            const records: AttendanceRecord[] = Object.entries(attendanceRecord).map(([sId, status]) => ({
                id: `att-${Date.now()}-${sId}`,
                courseId: selectedCourseId,
                studentId: sId,
                date: selectedDate,
                status: status as any,
                markedBy: user.id,
                appointmentId: "", // Not specific to one appointment
                createdAt: new Date().toISOString()
            }));

            db.saveAttendance(records);
            toast.success("Attendance matrix synchronized to central database.");
        } catch (error) {
            toast.error("Process error during synchronization.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-8">
                <div>
                    <h1 className="font-display text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none">
                        Personnel <span className="text-primary not-italic">Audit</span>
                    </h1>
                    <p className="text-muted-foreground text-sm font-bold opacity-60 mt-2 uppercase tracking-widest italic">
                        Daily student presence verification and logging
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Target Date</Label>
                        <Input
                            type="date"
                            className="h-12 rounded-xl bg-white border-none shadow-soft font-black italic"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1 min-w-[200px]">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Curriculum Node</Label>
                        <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                            <SelectTrigger className="h-12 rounded-xl bg-white border-none shadow-soft font-black italic">
                                <SelectValue placeholder="Select Course" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-none shadow-2xl">
                                {courses.map(c => (
                                    <SelectItem key={c.id} value={c.id} className="font-bold italic">{c.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[2.5rem]">
                <CardHeader className="p-8 border-b bg-muted/5 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-black italic">Participant Manifest</CardTitle>
                            <p className="text-xs font-bold opacity-40 uppercase tracking-widest">{students.length} Total Entities</p>
                        </div>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || students.length === 0}
                        className="h-14 px-10 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                    >
                        {isSaving ? "Syncing..." : "Finalize Record"} <Save className="ml-2 h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-b bg-muted/5">
                                <TableHead className="px-8 py-6 font-black uppercase text-[10px] tracking-widest opacity-40">Identity</TableHead>
                                <TableHead className="px-8 py-6 font-black uppercase text-[10px] tracking-widest opacity-40">Verification Status</TableHead>
                                <TableHead className="px-8 py-6 font-black uppercase text-[10px] tracking-widest opacity-40 text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="popLayout">
                                {students.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="py-20 text-center">
                                            <div className="opacity-10 mb-4 flex justify-center"><Users className="h-16 w-16" /></div>
                                            <p className="font-black uppercase tracking-widest text-[10px] opacity-30 italic">No student entities detected for this curriculum node.</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    students.map((s, idx) => (
                                        <motion.tr
                                            key={s.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group hover:bg-muted/30 transition-colors border-b last:border-0"
                                        >
                                            <TableCell className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-2xl bg-muted border flex items-center justify-center font-black text-sm text-primary shadow-inner">
                                                        {s.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-sm tracking-tight italic">{s.name}</p>
                                                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40">{s.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-8 py-6">
                                                <Badge className={cn(
                                                    "rounded-lg px-4 py-1.5 font-black uppercase text-[9px] tracking-widest border-none transition-all",
                                                    attendanceRecord[s.id] === 'Present'
                                                        ? "bg-emerald-500/10 text-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                                                        : "bg-rose-500/10 text-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
                                                )}>
                                                    {attendanceRecord[s.id]}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-8 py-6 text-right">
                                                <Button
                                                    variant="ghost"
                                                    className={cn(
                                                        "rounded-xl h-10 px-4 font-black uppercase text-[10px] tracking-widest transition-all",
                                                        attendanceRecord[s.id] === 'Present'
                                                            ? "hover:bg-rose-50 hover:text-rose-600"
                                                            : "hover:bg-emerald-50 hover:text-emerald-600"
                                                    )}
                                                    onClick={() => toggleStatus(s.id)}
                                                >
                                                    Mark as {attendanceRecord[s.id] === 'Present' ? 'Absent' : 'Present'}
                                                </Button>
                                            </TableCell>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default TrainerAttendance;
