import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { Course, db, User } from "@/lib/db";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
    BookOpen,
    Edit,
    Globe, Layout,
    Plus, Search,
    Star,
    Trash2,
    Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm group hover:scale-[1.02] transition-transform">
        <CardContent className="p-4">
            <div className="flex items-center gap-3">
                <div className={cn("p-2.5 rounded-2xl bg-muted group-hover:bg-primary/10 transition-colors shadow-inner", color)}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">{label}</p>
                    <h3 className="text-xl font-black">{value}</h3>
                </div>
            </div>
        </CardContent>
    </Card>
);

const AdminCourses = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [trainers, setTrainers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        schedule: "",
        trainerId: "",
        level: "Beginner" as string,
        image: ""
    });

    const refreshData = () => {
        setCourses(db.getCourses());
        setTrainers(db.getUsers().filter(u => u.role === 'trainer'));
    };

    useEffect(() => {
        if (user) {
            refreshData();
            // Listen for db-update events from cache sync
            const handler = () => refreshData();
            window.addEventListener('db-update', handler);
            return () => window.removeEventListener('db-update', handler);
        }
    }, [user]);

    const handleSaveCourse = async () => {
        if (!formData.title || !formData.trainerId) {
            toast.error("Title and Trainer are required");
            return;
        }

        try {
            if (isEditOpen && selectedCourse) {
                await db.updateCourse(selectedCourse.id, {
                    title: formData.title,
                    description: formData.description,
                    schedule: formData.schedule,
                    trainerId: formData.trainerId,
                    level: formData.level,
                    image: formData.image
                });
                toast.success("Course configuration updated");
            } else {
                const courseToAdd: Course = {
                    id: Date.now().toString(),
                    title: formData.title,
                    description: formData.description,
                    schedule: formData.schedule,
                    trainerId: formData.trainerId,
                    studentsEnrolled: [],
                    level: formData.level,
                    duration: 60,
                    status: "Active",
                    image: formData.image || "https://images.unsplash.com/photo-1523050335392-995cd0065798?q=80&w=2070&auto=format&fit=crop"
                };
                await db.addCourse(courseToAdd);
                toast.success("New program inaugurated");
            }
        } catch (e) {
            toast.error("Failed to save course");
        }

        refreshData();
        setIsAddOpen(false);
        setIsEditOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({ title: "", description: "", schedule: "", trainerId: "", level: "Beginner", image: "" });
        setSelectedCourse(null);
    };

    const handleEdit = (course: Course) => {
        setSelectedCourse(course);
        setFormData({
            title: course.title,
            description: course.description,
            schedule: course.schedule,
            trainerId: course.trainerId,
            level: course.level || "Beginner",
            image: course.image || ""
        });
        setIsEditOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Decommission this program? All enrollments will be terminated.")) {
            await db.deleteCourse(id);
            refreshData();
            toast.success("Program decommissioned");
        }
    };

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getTrainerName = (id: string) => trainers.find(t => t.id === id)?.name || "Unassigned";

    return (
        <div className="space-y-10 container mx-auto max-w-7xl pb-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    icon={BookOpen}
                    label="Active Curricula"
                    value={courses.length.toString()}
                    color="text-primary"
                />
                <StatCard
                    icon={Users}
                    label="Global Capacity"
                    value={courses.reduce((acc, c) => acc + c.studentsEnrolled.length, 0).toString()}
                    color="text-blue-500"
                />
                <StatCard
                    icon={Star}
                    label="Tier 1 Mastery"
                    value={courses.filter(c => c.level === 'Advanced').length.toString()}
                    color="text-amber-500"
                />
                <StatCard
                    icon={Globe}
                    label="Language Nodes"
                    value="12"
                    color="text-emerald-500"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-12 bg-muted/20 p-8 rounded-3xl border border-dashed"
            >
                <div className="space-y-1">
                    <h1 className="font-display text-4xl font-bold tracking-tight text-foreground italic flex items-center gap-3">
                        Program <span className="text-primary">Catalog</span> <Layout className="h-8 w-8" />
                    </h1>
                    <p className="text-muted-foreground font-medium">Standardize language curricula and instructor assignments.</p>
                </div>
                <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => { if (!open) { setIsAddOpen(false); setIsEditOpen(false); resetForm(); } }}>
                    <Button onClick={() => setIsAddOpen(true)} className="bg-primary shadow-lg shadow-primary/20 hover:scale-105 transition-transform gap-2">
                        <Plus className="h-4 w-4" /> New Program
                    </Button>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader><DialogTitle className="text-2xl font-bold">{isEditOpen ? "Configure Program" : "Inaugurate Program"}</DialogTitle></DialogHeader>
                        <div className="space-y-5 py-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Course Name</Label>
                                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. French Mastery B2" className="h-11 rounded-xl" />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Instructor Assignment</Label>
                                    <Select value={formData.trainerId} onValueChange={(val) => setFormData({ ...formData, trainerId: val })}>
                                        <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select Trainer" /></SelectTrigger>
                                        <SelectContent>{trainers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="w-1/3 space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Difficulty Level</Label>
                                    <Select value={formData.level} onValueChange={(val: any) => setFormData({ ...formData, level: val })}>
                                        <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                                        <SelectContent><SelectItem value="Beginner">Beginner</SelectItem><SelectItem value="Intermediate">Intermediate</SelectItem><SelectItem value="Advanced">Advanced</SelectItem></SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Course Timings</Label>
                                <Input value={formData.schedule} onChange={(e) => setFormData({ ...formData, schedule: e.target.value })} placeholder="e.g. Mon, Wed 10:00 AM" className="h-11 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Visual ID (URL)</Label>
                                <Input value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." className="h-11 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Curriculum Syllabus</Label>
                                <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief overview of course goals..." className="h-11 rounded-xl" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }} className="rounded-xl">Cancel</Button>
                            <Button onClick={handleSaveCourse} className="bg-primary rounded-xl px-8 shadow-lg shadow-primary/20">Commit Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </motion.div>
            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="p-6 border-b bg-muted/5">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search catalog..." className="pl-10 h-10 border-muted-foreground/20 rounded-xl" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader><TableRow className="hover:bg-transparent border-b bg-muted/5">
                            <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Program Details</TableHead>
                            <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Instructor</TableHead>
                            <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Class Size</TableHead>
                            <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Level</TableHead>
                            <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60 text-right">Actions</TableHead>
                        </TableRow></TableHeader>
                        <TableBody><AnimatePresence mode="popLayout">
                            {filteredCourses.map((c, idx) => (
                                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }} className="group hover:bg-muted/30 transition-colors border-b last:border-0">
                                    <TableCell className="px-6 py-4"><div className="flex items-center gap-4"><div className="h-12 w-20 rounded-xl overflow-hidden bg-muted group-hover:scale-105 transition-transform"><img src={c.image || "https://images.unsplash.com/photo-1523050335392-995cd0065798?q=80&w=2070&auto=format&fit=crop"} alt={c.title} className="w-full h-full object-cover" /></div><div><p className="font-bold text-foreground">{c.title}</p><p className="text-[10px] text-muted-foreground uppercase font-black opacity-70 italic line-clamp-1 max-w-[200px]">{c.description}</p></div></div></TableCell>
                                    <TableCell className="px-6 py-4 font-medium text-sm flex items-center gap-2 mt-4"><Users className="h-3.5 w-3.5 text-primary opacity-60" /> {getTrainerName(c.trainerId)}</TableCell>
                                    <TableCell className="px-6 py-4"><Badge variant="outline" className="text-[10px] font-black py-0.5">{c.studentsEnrolled.length} enrolled</Badge></TableCell>
                                    <TableCell className="px-6 py-4"><Badge className={cn("rounded-lg px-2.5 py-0.5 font-bold uppercase text-[10px] border-none shadow-sm", c.level === 'Advanced' ? "bg-rose-500/10 text-rose-600" : c.level === 'Intermediate' ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600")}>{c.level || 'Beginner'}</Badge></TableCell>
                                    <TableCell className="px-6 py-4 text-right"><div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => handleEdit(c)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4" /></Button></div></TableCell>
                                </motion.tr>
                            ))}
                        </AnimatePresence></TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminCourses;
