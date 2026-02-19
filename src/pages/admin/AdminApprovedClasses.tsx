import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
    CheckCircle, Video, Search,
    Link as LinkIcon, Send, Calendar,
    Clock, MessageSquare, User, BookOpen
} from "lucide-react";
import { db, EnrollmentRequest, Course, User as UserInfo } from "@/lib/db";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const AdminApprovedClasses = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState<EnrollmentRequest[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Meeting Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<EnrollmentRequest | null>(null);
    const [meetingLink, setMeetingLink] = useState("");
    const [meetingDescription, setMeetingDescription] = useState("");
    const [meetingDate, setMeetingDate] = useState("");
    const [meetingTime, setMeetingTime] = useState("");

    const refreshData = () => {
        const approved = db.getEnrollmentRequests().filter(r => r.status === "Approved");
        setRequests(approved.reverse());
        setCourses(db.getCourses());
        setUsers(db.getUsers());
    };

    useEffect(() => {
        refreshData();
        window.addEventListener('db-update', refreshData);
        return () => window.removeEventListener('db-update', refreshData);
    }, []);

    const openMeetingDialog = (req: EnrollmentRequest) => {
        setSelectedRequest(req);
        setMeetingLink(req.meetingLink || "");
        setMeetingDescription(req.meetingDescription || "Welcome to the class! Here are the details for our upcoming session.");
        setMeetingDate(req.meetingDate || new Date().toISOString().split('T')[0]);
        setMeetingTime(req.meetingTime || "10:00");
        setIsDialogOpen(true);
    };

    const handleBroadcastLink = () => {
        if (!selectedRequest || !meetingLink) {
            toast.error("Please provide a meeting link");
            return;
        }

        db.updateEnrollmentMeeting(
            selectedRequest.id,
            meetingLink,
            meetingDescription,
            meetingDate,
            meetingTime
        );

        toast.success("Meeting link broadcasted to student");
        setIsDialogOpen(false);
        refreshData();
    };

    const getCourseName = (id: string) => courses.find(c => c.id === id)?.title || "Unknown Course";
    const getUserName = (id: string) => users.find(u => u.id === id)?.name || "Unknown Student";

    const filteredRequests = requests.filter(r => {
        return getCourseName(r.courseId).toLowerCase().includes(searchTerm.toLowerCase()) ||
            getUserName(r.studentId).toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-10 container mx-auto max-w-7xl pb-10">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-8 rounded-3xl border shadow-sm"
            >
                <div className="space-y-1">
                    <h1 className="font-display text-4xl font-bold tracking-tight text-foreground italic flex items-center gap-3">
                        My <span className="text-primary">Calendar</span>
                    </h1>
                    <p className="text-muted-foreground font-medium">Create meeting links and broadcast them to authorized students.</p>
                </div>

                <div className="bg-emerald-500/10 px-6 py-3 rounded-2xl border border-emerald-500/20 text-emerald-600 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <Video className="h-4 w-4" /> {requests.length} Active Sessions
                </div>
            </motion.div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
                <Input
                    placeholder="Search by student or curriculum..."
                    className="pl-12 h-14 bg-card border-none shadow-sm rounded-2xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredRequests.map((req, idx) => (
                        <motion.div
                            key={req.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                        >
                            <Card className="group overflow-hidden border-none shadow-md hover:shadow-lg transition-all bg-card">
                                <CardContent className="p-6 flex flex-col lg:flex-row items-center justify-between gap-8">
                                    <div className="flex items-center gap-6 flex-1">
                                        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-black border border-primary/5">
                                            {getUserName(req.studentId).substring(0, 1)}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-xl">{getUserName(req.studentId)}</h3>
                                            <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                                                <BookOpen className="h-3.5 w-3.5 opacity-40" /> {getCourseName(req.courseId)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-8 flex-[2]">
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Meeting Status</span>
                                            <div className="flex items-center gap-2">
                                                {req.meetingLink ? (
                                                    <Badge className="bg-emerald-500/10 text-emerald-600 border-none px-4 py-1 rounded-full uppercase text-[10px] font-black">
                                                        Link Broadcasted
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-amber-500/10 text-amber-600 border-none px-4 py-1 rounded-full uppercase text-[10px] font-black">
                                                        Pending Link
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        {req.meetingLink && (
                                            <div className="space-y-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Schedule</span>
                                                <div className="text-sm font-bold flex items-center gap-2">
                                                    <Calendar className="h-3.5 w-3.5 text-primary" /> {req.meetingDate} at {req.meetingTime}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <Button onClick={() => openMeetingDialog(req)} className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 font-black uppercase text-[10px] tracking-widest h-12 shadow-lg shadow-primary/20">
                                            <Video className="h-4 w-4 mr-2" /> {req.meetingLink ? "Update Link" : "Create Link"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Meeting Broadcast Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg rounded-3xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl font-black">
                            <Video className="h-6 w-6 text-primary" />
                            Broadcast Meeting
                        </DialogTitle>
                        <DialogDescription className="font-medium italic">
                            Create a session link for <strong>{getUserName(selectedRequest?.studentId || "")}</strong>'s <strong>{getCourseName(selectedRequest?.courseId || "")}</strong> enrollment.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Meeting Date</Label>
                                <Input
                                    type="date"
                                    className="rounded-xl bg-muted/50 border-none h-12"
                                    value={meetingDate}
                                    onChange={(e) => setMeetingDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Meeting Time</Label>
                                <Input
                                    type="time"
                                    className="rounded-xl bg-muted/50 border-none h-12"
                                    value={meetingTime}
                                    onChange={(e) => setMeetingTime(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Meeting URL (Meet/Zoom/etc)</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                                    <Input
                                        placeholder="https://meet.google.com/..."
                                        className="pl-12 h-12 rounded-xl bg-muted/50 border-none"
                                        value={meetingLink}
                                        onChange={(e) => setMeetingLink(e.target.value)}
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-12 w-12 p-0 rounded-xl border-dashed border-primary/20 hover:bg-primary/5 group"
                                    onClick={() => window.open('https://meet.new', '_blank')}
                                    title="Create Google Meet"
                                >
                                    <img src="https://www.gstatic.com/meet/google_meet_logo_icon_64.png" alt="Google Meet" className="h-6 w-6 group-hover:scale-110 transition-transform" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Session Instructions</Label>
                            <Textarea
                                placeholder="Enter meeting description or preparation steps..."
                                className="min-h-[100px] rounded-xl bg-muted/50 border-none p-4"
                                value={meetingDescription}
                                onChange={(e) => setMeetingDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl font-bold uppercase text-[10px]">
                            Cancel
                        </Button>
                        <Button onClick={handleBroadcastLink} className="bg-primary hover:bg-primary/90 text-white rounded-xl px-10 font-black uppercase text-[10px] tracking-widest h-12 shadow-lg shadow-primary/20">
                            <Send className="h-4 w-4 mr-2" /> Broadcast Now
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminApprovedClasses;
