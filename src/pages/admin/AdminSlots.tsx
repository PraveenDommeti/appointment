import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { Course, db, User } from "@/lib/db";
import { notificationService } from "@/lib/notifications";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Clock, ExternalLink, Plus, Trash2, Users, Video, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface AdminSlot {
    id: string;
    courseId: string;
    courseName: string;
    trainerId: string;
    trainerName: string;
    date: string;
    time: string;
    duration: number;
    meetingLink?: string;
    description: string;
    createdAt: string;
}

const AdminSlots = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [trainers, setTrainers] = useState<User[]>([]);
    const [slots, setSlots] = useState<AdminSlot[]>([]);
    const [showDialog, setShowDialog] = useState(false);
    const [formData, setFormData] = useState({
        courseId: "",
        trainerId: "",
        date: "",
        time: "",
        duration: 60,
        meetingLink: "",
        description: ""
    });

    const fetchData = () => {
        const allCourses = db.getCourses().filter(c => c.status === "Active");
        setCourses(allCourses);

        const allTrainers = db.getUsers().filter(u => u.role === "trainer");
        setTrainers(allTrainers);

        // Get admin-created slots from DB
        const allSlots = db.getAdminSlots();
        setSlots(allSlots);
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleCreateSlot = async () => {
        if (!formData.courseId || !formData.trainerId || !formData.date || !formData.time) {
            toast.error("Please fill in all required fields");
            return;
        }

        const course = courses.find(c => c.id === formData.courseId);
        const trainer = trainers.find(t => t.id === formData.trainerId);

        if (!course || !trainer) return;

        const newSlot: any = {
            id: `admin-slot-${Date.now()}`,
            courseId: formData.courseId,
            courseName: course.title,
            trainerId: formData.trainerId,
            trainerName: trainer.name,
            date: formData.date,
            time: formData.time,
            duration: formData.duration,
            meetingLink: formData.meetingLink,
            description: formData.description,
            createdAt: new Date().toISOString()
        };

        // Save to DB
        db.addAdminSlot(newSlot);
        setSlots(db.getAdminSlots());

        // Create log
        db.addSystemLog({
            userId: user?.id || "unknown",
            action: "Create Admin Slot",
            category: "system",
            details: `Created immediate slot for ${course.title}`
        });

        // Create notification for trainer
        db.createNotification({
            userId: formData.trainerId,
            title: "🎯 Admin Scheduled Session",
            message: `New immediate session: ${course.title} on ${formData.date} at ${formData.time}`,
            type: "info",
            category: "appointment"
        });

        // Send email to trainer
        if (trainer.email) {
            try {
                await notificationService.sendEmail({
                    to: trainer.email,
                    subject: "New Session Scheduled by Admin",
                    body: `A new session has been scheduled:\n\nCourse: ${course.title}\nDate: ${formData.date}\nTime: ${formData.time}\n${formData.meetingLink ? `Meeting Link: ${formData.meetingLink}` : ''}`,
                    html: `<div style="font-family: Arial, sans-serif;">
                        <h2>New Session Scheduled</h2>
                        <p>An admin has scheduled a new session for you:</p>
                        <ul>
                            <li><strong>Course:</strong> ${course.title}</li>
                            <li><strong>Date:</strong> ${formData.date}</li>
                            <li><strong>Time:</strong> ${formData.time}</li>
                            ${formData.meetingLink ? `<li><strong>Meeting Link:</strong> <a href="${formData.meetingLink}">${formData.meetingLink}</a></li>` : ''}
                        </ul>
                    </div>`
                });
            } catch (error) {
                console.error(`Failed to send email to trainer ${trainer.email}:`, error);
            }
        }

        // Get all students enrolled in this course
        for (const studentId of course.studentsEnrolled) {
            db.createNotification({
                userId: studentId,
                title: "🚀 Surprise Class Alert!",
                message: `Immediate session scheduled: ${course.title} on ${formData.date} at ${formData.time}`,
                type: "success",
                category: "appointment"
            });

            // Send email to each student
            const student = db.getUser(studentId);
            if (student && student.email) {
                const emailContent = notificationService.templates.appointmentApproved(
                    student.name,
                    course.title,
                    formData.date,
                    formData.time,
                    formData.meetingLink
                );

                try {
                    await notificationService.sendEmail({
                        to: student.email,
                        ...emailContent
                    });
                } catch (error) {
                    console.error(`Failed to send email to student ${student.email}:`, error);
                }
            }
        }

        toast.success("Admin slot created successfully! Notifications sent to trainer and students.");
        setShowDialog(false);
        setFormData({
            courseId: "",
            trainerId: "",
            date: "",
            time: "",
            duration: 60,
            meetingLink: "",
            description: ""
        });
    };

    const handleDeleteSlot = (id: string) => {
        db.deleteAdminSlot(id);
        setSlots(db.getAdminSlots());
        toast.info("Slot deleted successfully");
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground">
                        Admin <span className="text-primary">Slots</span>
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium mt-2">
                        Create immediate or surprise class sessions
                    </p>
                </div>
                <Button
                    onClick={() => setShowDialog(true)}
                    className="h-14 px-8 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Immediate Slot
                </Button>
            </div>

            {/* Slots Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {slots.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full py-20 text-center bg-muted/20 rounded-3xl border-2 border-dashed"
                        >
                            <Zap className="h-16 w-16 mx-auto mb-4 opacity-20" />
                            <h3 className="text-xl font-bold text-foreground opacity-30">No admin slots created</h3>
                            <p className="text-sm text-muted-foreground mt-2 opacity-50">
                                Create immediate sessions for students and trainers
                            </p>
                        </motion.div>
                    ) : (
                        slots.map((slot, idx) => (
                            <motion.div
                                key={slot.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                                    <div className="h-2 bg-gradient-to-r from-primary to-purple-500" />
                                    <CardContent className="p-6 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <Badge className="bg-purple-50 text-purple-600 border-purple-200 text-xs font-bold mb-2">
                                                    Admin Scheduled
                                                </Badge>
                                                <h3 className="text-lg font-black tracking-tight">{slot.courseName}</h3>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg hover:bg-rose-50 hover:text-rose-600"
                                                onClick={() => handleDeleteSlot(slot.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Users className="h-4 w-4 text-primary" />
                                                <span className="font-medium">{slot.trainerName}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Calendar className="h-4 w-4 text-primary" />
                                                <span className="font-medium">{new Date(slot.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Clock className="h-4 w-4 text-primary" />
                                                <span className="font-medium">{slot.time} ({slot.duration} mins)</span>
                                            </div>
                                        </div>

                                        {slot.description && (
                                            <p className="text-xs text-muted-foreground italic border-l-2 border-primary pl-3">
                                                {slot.description}
                                            </p>
                                        )}

                                        {slot.meetingLink && (
                                            <Button
                                                variant="outline"
                                                className="w-full h-10 rounded-xl border-primary/20 hover:bg-primary/5"
                                                onClick={() => window.open(slot.meetingLink, '_blank')}
                                            >
                                                <Video className="h-4 w-4 mr-2 text-primary" />
                                                Join Meeting
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Create Slot Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="sm:max-w-lg rounded-3xl border-none shadow-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="text-2xl font-black tracking-tight">
                            Create Admin Slot
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground mt-2">
                            Schedule an immediate or surprise class session
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-bold">Course *</Label>
                            <Select value={formData.courseId} onValueChange={(val) => setFormData({ ...formData, courseId: val })}>
                                <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none">
                                    <SelectValue placeholder="Select course..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl">
                                    {courses.map(course => (
                                        <SelectItem key={course.id} value={course.id} className="font-medium">
                                            {course.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-bold">Trainer *</Label>
                            <Select value={formData.trainerId} onValueChange={(val) => setFormData({ ...formData, trainerId: val })}>
                                <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none">
                                    <SelectValue placeholder="Select trainer..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl">
                                    {trainers.map(trainer => (
                                        <SelectItem key={trainer.id} value={trainer.id} className="font-medium">
                                            {trainer.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold">Date *</Label>
                                <Input
                                    type="date"
                                    className="h-12 rounded-xl bg-muted/30 border-none"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-bold">Time *</Label>
                                <Input
                                    type="time"
                                    className="h-12 rounded-xl bg-muted/30 border-none"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-bold">Duration (minutes)</Label>
                            <Input
                                type="number"
                                className="h-12 rounded-xl bg-muted/30 border-none"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-bold">Meeting Link</Label>
                            <div className="flex gap-2">
                                <Input
                                    className="h-12 rounded-xl bg-muted/30 border-none flex-1"
                                    placeholder="https://meet.google.com/..."
                                    value={formData.meetingLink}
                                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                                />
                                <Button
                                    variant="outline"
                                    className="h-12 w-12 rounded-xl"
                                    onClick={() => window.open('https://meet.google.com/new', '_blank')}
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-bold">Description</Label>
                            <Textarea
                                className="rounded-2xl bg-muted/30 border-none min-h-[80px]"
                                placeholder="Additional notes or instructions..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter className="p-6 pt-0 flex gap-3">
                        <Button
                            variant="ghost"
                            className="flex-1 h-12 rounded-xl font-bold"
                            onClick={() => setShowDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 h-12 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20"
                            onClick={handleCreateSlot}
                        >
                            <Zap className="h-4 w-4 mr-2" />
                            Create Slot
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminSlots;
