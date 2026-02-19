import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/db";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const TrainerStudents = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [students, setStudents] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const refreshData = () => {
        if (!user) return;
        const allCourses = db.getCourses();
        // const myCourses = allCourses.filter(c => c.trainerId === user.id);
        // const studentIds = new Set<string>();
        // myCourses.forEach(c => c.studentsEnrolled.forEach(sId => studentIds.add(sId)));

        const allUsers = db.getUsers();
        // Determine enrolled classes for each student
        const myStudents = allUsers.filter(u => u.role === 'student').map(s => {
            const enrolledIn = allCourses
                .filter(c => c.studentsEnrolled && c.studentsEnrolled.includes(s.id))
                .map(c => c.title);

            return {
                ...s,
                enrolledClasses: enrolledIn,
                attendance: "95%" // Mock attendance or calculate from appointments if needed
            };
        });
        setStudents(myStudents);
    };

    useEffect(() => {
        refreshData();
    }, [user]);

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 container mx-auto max-w-7xl pb-10">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
                <div className="space-y-1">
                    <h1 className="font-display text-4xl font-bold tracking-tight text-foreground flex items-center gap-4">
                        Student <span className="text-primary italic">Intelligence</span> <Users className="h-10 w-10 text-primary" />
                    </h1>
                    <p className="text-muted-foreground font-medium italic opacity-80">Clean data aggregation for your enrolled subjects.</p>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
                    <Input
                        placeholder="Scan student directory..."
                        className="pl-12 h-14 bg-card border-none shadow-sm rounded-2xl"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </motion.div>

            <Card className="border-none shadow-xl bg-card overflow-hidden rounded-[2.5rem]">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/30 border-b border-muted-foreground/5">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Subject Name</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Digital Identity</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Enrolled Classes</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Attendance %</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Linkages</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-muted-foreground/5">
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((student, idx) => (
                                        <motion.tr
                                            key={student.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group hover:bg-muted/20 transition-colors"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black shadow-inner border border-primary/5 group-hover:scale-110 transition-transform">
                                                        {student.name.substring(0, 1)}
                                                    </div>
                                                    <span className="font-black text-lg group-hover:text-primary transition-colors">{student.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                                    <Mail className="h-3.5 w-3.5 opacity-40" /> {student.email}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {student.enrolledClasses.map((c: string, i: number) => (
                                                        <Badge key={i} variant="outline" className="rounded-lg border-primary/10 bg-primary/5 text-primary text-[9px] font-bold uppercase transition-all group-hover:bg-primary/10">
                                                            {c}
                                                        </Badge>
                                                    ))}
                                                    {student.enrolledClasses.length === 0 && <span className="text-xs italic opacity-30">No active classes</span>}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className="text-lg font-black text-emerald-500 bg-emerald-500/10 px-4 py-1.5 rounded-2xl shadow-sm border border-emerald-500/5">
                                                    {student.attendance}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <Button size="icon" variant="ghost" className="rounded-xl hover:bg-primary/10 hover:text-primary transition-all" onClick={() => navigate(`/trainer/messages?studentId=${student.id}`)}>
                                                    <MessageSquare className="h-5 w-5" />
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-24 text-center">
                                            <div className="max-w-xs mx-auto space-y-4 opacity-30 group">
                                                <Users className="h-20 w-20 mx-auto group-hover:scale-110 transition-transform" />
                                                <p className="font-black uppercase tracking-widest text-[10px]">Registry Empty</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TrainerStudents;
