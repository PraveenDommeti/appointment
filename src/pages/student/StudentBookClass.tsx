import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { Appointment, Course, db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AlertCircle, BookOpen, Calendar, Clock, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const StudentBookClass = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [myRequests, setMyRequests] = useState<Appointment[]>([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [formData, setFormData] = useState({
        topic: "",
        date: "",
        time: "",
        notes: ""
    });

    const fetchData = () => {
        // Get all active courses
        const allCourses = db.getCourses().filter(c => c.status === "Active");
        setCourses(allCourses);

        // Get user's requests
        if (user?.id) {
            const requests = db.getAppointments(user.id);
            setMyRequests(requests);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        window.addEventListener('db-update', fetchData);
        return () => { clearInterval(interval); window.removeEventListener('db-update', fetchData); };
    }, [user?.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedCourse || !formData.topic || !formData.date || !formData.time) {
            toast.error("Please fill in all required fields");
            return;
        }

        const course = courses.find(c => c.id === selectedCourse);
        if (!course) return;

        const newRequest: Appointment = {
            id: `req-${Date.now()}`,
            userId: user.id,
            courseId: selectedCourse,
            topic: formData.topic,
            date: formData.date,
            time: formData.time,
            status: "Pending",
            description: formData.notes,
            createdAt: new Date().toISOString(),
            trainerId: course.trainerId,
            duration: course.duration
        };

        try {
            await db.requestAppointment(newRequest);
            toast.success("Session request submitted successfully!");

            // Reset form
            setFormData({ topic: "", date: "", time: "", notes: "" });
            setSelectedCourse("");
            fetchData();
        } catch (err) {
            toast.error("Failed to submit request");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Approved": return "bg-emerald-50 text-emerald-600 border-emerald-200";
            case "Pending": return "bg-amber-50 text-amber-600 border-amber-200";
            case "Rejected": return "bg-rose-50 text-rose-600 border-rose-200";
            default: return "bg-gray-50 text-gray-600 border-gray-200";
        }
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground">
                        Request <span className="text-primary">Session</span>
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium mt-2">
                        Book a personalized learning session with your instructor
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Request Form */}
                <Card className="lg:col-span-2 border-none shadow-lg">
                    <CardHeader className="border-b bg-muted/5 p-6">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            New Session Request
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold">Select Course *</Label>
                                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                    <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none">
                                        <SelectValue placeholder="Choose a course..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                        {courses.map(course => (
                                            <SelectItem key={course.id} value={course.id} className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-xs">{course.level}</Badge>
                                                    {course.title}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-bold">Session Topic *</Label>
                                <Input
                                    className="h-12 rounded-xl bg-muted/30 border-none"
                                    placeholder="e.g., Grammar Review, Conversation Practice"
                                    value={formData.topic}
                                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold">Preferred Date *</Label>
                                    <Input
                                        type="date"
                                        className="h-12 rounded-xl bg-muted/30 border-none"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold">Preferred Time *</Label>
                                    <Input
                                        type="time"
                                        className="h-12 rounded-xl bg-muted/30 border-none"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-bold">Additional Notes</Label>
                                <Textarea
                                    className="rounded-2xl bg-muted/30 border-none min-h-[100px]"
                                    placeholder="Any specific topics or questions you'd like to cover..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                            >
                                <Send className="h-4 w-4 mr-2" />
                                Submit Request
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* My Requests */}
                <Card className="border-none shadow-lg">
                    <CardHeader className="border-b bg-muted/5 p-6">
                        <CardTitle className="text-lg font-bold">My Requests</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="space-y-3 max-h-[600px] overflow-auto">
                            {myRequests.length === 0 ? (
                                <div className="py-12 text-center opacity-40">
                                    <AlertCircle className="h-12 w-12 mx-auto mb-3" />
                                    <p className="text-sm font-medium">No requests yet</p>
                                </div>
                            ) : (
                                myRequests.map((req) => (
                                    <motion.div
                                        key={req.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 rounded-2xl bg-muted/20 border hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-bold text-sm">{req.topic}</h4>
                                            <Badge className={cn("text-xs border", getStatusColor(req.status))}>
                                                {req.status}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(req.date).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3 w-3" />
                                                {req.time}
                                            </div>
                                        </div>
                                        {req.rejectionReason && (
                                            <div className="mt-3 p-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-xs">
                                                <strong>Reason:</strong> {req.rejectionReason}
                                            </div>
                                        )}
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default StudentBookClass;
