import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { Course, db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Clock, Edit2, Globe, Plus, Power, PowerOff, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const TrainerCourses = () => {
    const { user } = useAuth();
    const [myCourses, setMyCourses] = useState<Course[]>([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        level: "A1",
        duration: 60,
        schedule: "Mon, Wed 10:00 AM",
        image: ""
    });

    const refresh = () => {
        if (user) {
            setMyCourses(db.getCourses().filter(c => c.trainerId === user.id));
        }
    };

    useEffect(() => {
        refresh();
        const interval = setInterval(refresh, 5000);
        return () => clearInterval(interval);
    }, [user]);

    const handleSave = () => {
        if (!user) return;
        if (!formData.title || !formData.description) {
            toast.error("Please fill in all mandatory fields.");
            return;
        }

        if (editingCourse) {
            const updated: Course = {
                ...editingCourse,
                ...formData
            };
            const all = db.getCourses();
            const idx = all.findIndex(c => c.id === editingCourse.id);
            if (idx !== -1) {
                all[idx] = updated;
                db.set("courses", all);
                toast.success("Module updated in the global curriculum registry.");
            }
        } else {
            const newCourse: Course = {
                id: `c-${Date.now()}`,
                ...formData,
                trainerId: user.id,
                studentsEnrolled: [],
                status: "Active"
            };
            const all = db.getCourses();
            db.set("courses", [...all, newCourse]);
            toast.success("New French module synchronized to platform.");
        }

        setIsAddOpen(false);
        setEditingCourse(null);
        setFormData({
            title: "",
            description: "",
            level: "A1",
            duration: 60,
            schedule: "Mon, Wed 10:00 AM",
            image: ""
        });
        refresh();
    };

    const toggleStatus = (course: Course) => {
        const all = db.getCourses();
        const idx = all.findIndex(c => c.id === course.id);
        if (idx !== -1) {
            all[idx].status = all[idx].status === "Active" ? "Inactive" : "Active";
            db.set("courses", all);
            toast.info(`Course ${all[idx].status === "Active" ? "Activated" : "Deactivated"} in the student feed.`);
            refresh();
        }
    };

    const openEdit = (course: Course) => {
        setEditingCourse(course);
        setFormData({
            title: course.title,
            description: course.description,
            level: course.level,
            duration: course.duration,
            schedule: course.schedule,
            image: course.image || ""
        });
        setIsAddOpen(true);
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header section - Compact per specs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-8">
                <div>
                    <h1 className="font-display text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none">
                        Catalogue <span className="text-secondary not-italic">Des Cours</span>
                    </h1>
                    <p className="text-muted-foreground text-sm font-bold opacity-60 mt-2 uppercase tracking-widest italic">
                        Curriculum Node Management System
                    </p>
                </div>

                <Dialog open={isAddOpen} onOpenChange={(val) => {
                    setIsAddOpen(val);
                    if (!val) {
                        setEditingCourse(null);
                        setFormData({ title: "", description: "", level: "A1", duration: 60, schedule: "Mon, Wed 10:00 AM", image: "" });
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="h-14 px-8 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 transition-all font-black uppercase tracking-widest text-xs">
                            <Plus className="h-5 w-5 mr-3" /> Add New Course
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] border-none shadow-2xl overflow-hidden p-0">
                        <div className="bg-primary p-8 text-white relative">
                            <DialogTitle className="text-2xl font-black tracking-tighter italic uppercase text-white">
                                {editingCourse ? "Edit Protocol" : "New Curriculum Node"}
                            </DialogTitle>
                            <DialogDescription className="text-xs font-bold opacity-60 uppercase tracking-widest mt-1 text-white/80">
                                Define learning parameters for the entity.
                            </DialogDescription>
                            <BookOpen className="absolute right-8 top-8 h-12 w-12 opacity-10" />
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Course Title</Label>
                                    <Input
                                        className="rounded-xl h-12 bg-muted/30 border-none font-bold italic"
                                        placeholder="e.g., French A1: Business Professional"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Difficulty Level</Label>
                                        <Select value={formData.level} onValueChange={(val) => setFormData({ ...formData, level: val })}>
                                            <SelectTrigger className="rounded-xl h-12 bg-muted/30 border-none font-black text-[10px] uppercase">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-none shadow-2xl">
                                                <SelectItem value="A1" className="font-bold">A1: Initiation</SelectItem>
                                                <SelectItem value="A2" className="font-bold">A2: Élémentaire</SelectItem>
                                                <SelectItem value="B1" className="font-bold">B1: Intermédiaire</SelectItem>
                                                <SelectItem value="B2" className="font-bold">B2: Avancé</SelectItem>
                                                <SelectItem value="C1+" className="font-bold">C1: Expert</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Duration (Mins)</Label>
                                        <Input
                                            type="number"
                                            className="rounded-xl h-12 bg-muted/30 border-none font-bold"
                                            value={formData.duration}
                                            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Description</Label>
                                    <Textarea
                                        className="rounded-[1.5rem] h-24 bg-muted/30 border-none font-medium text-sm leading-relaxed"
                                        placeholder="Outline the learning objectives..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-8 pt-0 flex gap-3">
                            <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]" onClick={() => setIsAddOpen(false)}>Abort</Button>
                            <Button className="flex-1 h-14 rounded-2xl bg-secondary text-[#0b1120] font-black uppercase tracking-widest text-[10px] shadow-lg shadow-secondary/20 hover:scale-105 transition-all" onClick={handleSave}>Initialize Link</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {myCourses.map((course, idx) => (
                        <motion.div
                            key={course.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="overflow-hidden border-none shadow-soft hover:shadow-2xl transition-all duration-500 bg-white group rounded-[2.5rem]">
                                <div className="h-56 overflow-hidden relative">
                                    <img
                                        src={course.image || `https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=1000&auto=format&fit=crop`}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        alt={course.title}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-transparent to-transparent opacity-60" />
                                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                                        <Badge className="bg-secondary text-[#0b1120] border-none font-black uppercase text-[9px] tracking-widest px-3 py-1 rounded-full shadow-lg shadow-secondary/20">
                                            {course.level}
                                        </Badge>
                                        <Badge className={cn("border-none font-black uppercase text-[9px] tracking-widest px-3 py-1 rounded-full shadow-lg",
                                            course.status === 'Active' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-rose-500/20'
                                        )}>
                                            {course.status}
                                        </Badge>
                                    </div>
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <h3 className="text-xl font-black text-white tracking-tighter italic leading-none">{course.title}</h3>
                                    </div>
                                </div>
                                <CardContent className="p-8 space-y-6">
                                    <p className="text-xs font-bold text-muted-foreground leading-relaxed italic opacity-80 line-clamp-2">
                                        {course.description}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase tracking-widest opacity-30">Mesh Population</p>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-primary" />
                                                <span className="font-black text-sm italic">{course.studentsEnrolled.length} Entities</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase tracking-widest opacity-30">Sync Duration</p>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-primary" />
                                                <span className="font-black text-sm italic">{course.duration} Mins</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button variant="outline" className="flex-1 h-12 rounded-2xl border-none bg-muted/30 hover:bg-primary hover:text-white font-black uppercase tracking-widest text-[9px] transition-all" onClick={() => openEdit(course)}>
                                            <Edit2 className="h-3 w-3 mr-2" /> Parameters
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className={cn("h-12 w-12 rounded-2xl border-none transition-all shadow-lg",
                                                course.status === 'Active' ? 'bg-rose-50 text-rose-500 shadow-rose-500/10' : 'bg-emerald-50 text-emerald-500 shadow-emerald-500/10'
                                            )}
                                            onClick={() => toggleStatus(course)}
                                        >
                                            {course.status === 'Active' ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {myCourses.length === 0 && (
                    <div className="col-span-full py-32 bg-white/50 border-4 border-dashed rounded-[3rem] flex flex-col items-center justify-center text-center px-12">
                        <Globe className="h-20 w-20 mb-8 text-primary opacity-10 animate-pulse" />
                        <h3 className="text-3xl font-black text-foreground opacity-10 italic uppercase tracking-tighter">No Active Nodes</h3>
                        <p className="text-xs font-black mt-6 opacity-30 uppercase tracking-[0.3em] leading-loose max-w-sm italic">
                            The curriculum registry is currently disconnected. Create a new module to initialize global propagation.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrainerCourses;
