import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { Appointment, db } from "@/lib/db";
import { notificationService } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
    Calendar,
    Clock,
    ExternalLink,
    Layers,
    Send,
    ShieldAlert,
    X,
    XCircle,
    Zap
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface RequestCluster {
    id: string; // key: courseId-date-time
    courseId: string;
    courseTitle: string;
    date: string;
    time: string;
    requests: Appointment[];
}

const TrainerRequests = () => {
    const { user } = useAuth();
    const [allPending, setAllPending] = useState<Appointment[]>([]);
    const [selectedCluster, setSelectedCluster] = useState<RequestCluster | null>(null);
    const [actionType, setActionType] = useState<"ApproveGroup" | "ApproveSolo" | "Reject" | null>(null);
    const [selectedSingleAppt, setSelectedSingleAppt] = useState<Appointment | null>(null);

    // Dialog Input States
    const [meetingLink, setMeetingLink] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [notes, setNotes] = useState("");

    const fetchData = () => {
        if (user?.id) {
            const pending = db.getAllAppointments().filter(a => a.status === "Pending");
            setAllPending(pending);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        window.addEventListener('db-update', fetchData);
        return () => { clearInterval(interval); window.removeEventListener('db-update', fetchData); };
    }, [user?.id]);

    const clusters = useMemo(() => {
        const map = new Map<string, RequestCluster>();
        const courses = db.getCourses();

        allPending.forEach(a => {
            const key = `${a.courseId}-${a.date}-${a.time}`;
            if (!map.has(key)) {
                const c = courses.find(c => c.id === a.courseId);
                map.set(key, {
                    id: key,
                    courseId: a.courseId,
                    courseTitle: c?.title || "Unknown Course",
                    date: a.date,
                    time: a.time,
                    requests: []
                });
            }
            map.get(key)!.requests.push(a);
        });

        return Array.from(map.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [allPending]);

    const handleAction = async () => {
        if (actionType === "ApproveGroup" && selectedCluster) {
            await db.approveGroupSession(selectedCluster.requests.map(r => r.id), meetingLink);

            // Send email to each student in the group
            for (const request of selectedCluster.requests) {
                const student = db.getUser(request.userId);
                if (student && student.email) {
                    const course = db.getCourse(request.courseId);
                    const emailContent = notificationService.templates.appointmentApproved(
                        student.name,
                        course?.title || request.topic,
                        request.date,
                        request.time,
                        meetingLink
                    );

                    try {
                        await notificationService.sendEmail({
                            to: student.email,
                            ...emailContent
                        });
                    } catch (error) {
                        console.error(`Failed to send email to ${student.email}:`, error);
                    }
                }
            }

            toast.success(`${selectedCluster.requests.length} students synchronized to Group Unit.`);
        } else if (actionType === "ApproveSolo" && selectedSingleAppt) {
            await db.approveAppointment(selectedSingleAppt.id, meetingLink);

            // Send email to the student
            const student = db.getUser(selectedSingleAppt.userId);
            if (student && student.email) {
                const course = db.getCourse(selectedSingleAppt.courseId);
                const emailContent = notificationService.templates.appointmentApproved(
                    student.name,
                    course?.title || selectedSingleAppt.topic,
                    selectedSingleAppt.date,
                    selectedSingleAppt.time,
                    meetingLink
                );

                try {
                    await notificationService.sendEmail({
                        to: student.email,
                        ...emailContent
                    });
                } catch (error) {
                    console.error(`Failed to send email to ${student.email}:`, error);
                }
            }

            toast.success("Solo session protocol initialized.");
        } else if (actionType === "Reject" && (selectedSingleAppt || selectedCluster)) {
            if (!rejectionReason.trim()) {
                toast.error("Mandatory rejection reason required.");
                return;
            }
            const targets = selectedSingleAppt ? [selectedSingleAppt.id] : selectedCluster!.requests.map(r => r.id);

            // Send rejection emails
            const appointmentsToReject = selectedSingleAppt ? [selectedSingleAppt] : selectedCluster!.requests;
            for (const appt of appointmentsToReject) {
                await db.rejectAppointment(appt.id, rejectionReason);

                const student = db.getUser(appt.userId);
                if (student && student.email) {
                    const course = db.getCourse(appt.courseId);
                    const emailContent = notificationService.templates.appointmentRejected(
                        student.name,
                        course?.title || appt.topic,
                        rejectionReason
                    );

                    try {
                        await notificationService.sendEmail({
                            to: student.email,
                            ...emailContent
                        });
                    } catch (error) {
                        console.error(`Failed to send email to ${student.email}:`, error);
                    }
                }
            }

            toast.info("Requests decommissioned.");
        }

        // Reset
        setActionType(null);
        setSelectedCluster(null);
        setSelectedSingleAppt(null);
        setMeetingLink("");
        setRejectionReason("");
        setNotes("");
        fetchData();
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header section - Compact */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-8">
                <div>
                    <h1 className="font-display text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none">
                        Registry <span className="text-primary not-italic">Synchronizer</span>
                    </h1>
                    <p className="text-muted-foreground text-sm font-bold opacity-60 mt-2 uppercase tracking-widest italic">
                        Pending Curricula Authorization Feed
                    </p>
                </div>
                <div className="flex gap-3">
                    <Badge className="bg-amber-500/10 text-amber-600 border-none font-black uppercase text-[10px] tracking-widest px-4 py-2 rounded-xl">
                        {allPending.length} Urgent Inquiries
                    </Badge>
                </div>
            </div>

            <div className="grid gap-6">
                <AnimatePresence mode="popLayout">
                    {clusters.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-32 text-center bg-white/50 border-4 border-dashed rounded-[3rem]"
                        >
                            <Zap className="h-20 w-20 mx-auto mb-6 text-primary opacity-10" />
                            <h3 className="text-2xl font-black text-foreground opacity-20 italic uppercase tracking-tighter">Transmission Clear</h3>
                            <p className="text-xs font-black mt-4 opacity-40 uppercase tracking-[0.2em] italic">All booking packets have been processed.</p>
                        </motion.div>
                    ) : (
                        clusters.map((cluster, idx) => (
                            <motion.div
                                key={cluster.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="border-none shadow-soft hover:shadow-2xl transition-all duration-500 bg-white overflow-hidden rounded-[2.5rem] group">
                                    <div className="flex flex-col md:flex-row">
                                        {/* Status Sidebar */}
                                        <div className="w-1.5 bg-amber-500 group-hover:w-3 transition-all h-auto" />

                                        <div className="flex-1 p-8 grid md:grid-cols-12 gap-8 items-center">
                                            {/* Cluster Core Identity */}
                                            <div className="md:col-span-4 space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-primary text-white border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full">
                                                        Cluster Detected
                                                    </Badge>
                                                    <Badge variant="outline" className="font-black text-[9px] uppercase tracking-widest border-black/10 opacity-40">
                                                        {cluster.requests.length} Requesters
                                                    </Badge>
                                                </div>
                                                <h3 className="text-2xl font-black tracking-tighter italic leading-tight group-hover:text-primary transition-colors">
                                                    {cluster.courseTitle}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-tighter opacity-50">
                                                    <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {cluster.date}</span>
                                                    <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {cluster.time}</span>
                                                </div>
                                            </div>

                                            {/* Entity List */}
                                            <div className="md:col-span-4 border-l border-r border-black/5 px-8">
                                                <p className="text-[9px] font-black uppercase tracking-widest opacity-20 mb-4 italic">Synchronizing Nodes</p>
                                                <div className="space-y-3 max-h-[120px] overflow-auto pr-4 scrollbar-hide">
                                                    {cluster.requests.map((req) => (
                                                        <div key={req.id} className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 group-hover:bg-muted/50 transition-colors">
                                                            <div className="flex items-center gap-3 overflow-hidden">
                                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-black text-[10px] text-primary">
                                                                    {req.id.charAt(0)}
                                                                </div>
                                                                <span className="font-bold text-sm truncate opacity-70 italic">Student ID: {req.userId}</span>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 rounded-lg hover:bg-rose-500 hover:text-white"
                                                                onClick={() => { setSelectedSingleAppt(req); setActionType("Reject"); }}
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Protocol Actions */}
                                            <div className="md:col-span-4 flex flex-col gap-3">
                                                <Button
                                                    className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] gap-3 shadow-xl shadow-primary/20 hover:scale-[1.03] transition-all"
                                                    onClick={() => { setSelectedCluster(cluster); setActionType("ApproveGroup"); setMeetingLink('https://meet.google.com/new'); }}
                                                >
                                                    <Layers className="h-4 w-4" /> Convert to Group Session
                                                </Button>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <Button
                                                        variant="outline"
                                                        className="h-12 rounded-2xl border-none bg-muted/30 font-black uppercase tracking-widest text-[9px] hover:bg-white hover:shadow-lg transition-all"
                                                        onClick={() => { setSelectedCluster(cluster); setActionType("Reject"); }}
                                                    >
                                                        <ShieldAlert className="h-3.5 w-3.5 mr-2 text-rose-500" /> Mass Reject
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="h-12 rounded-2xl border-none bg-muted/30 font-black uppercase tracking-widest text-[9px] hover:bg-white hover:shadow-lg transition-all"
                                                        onClick={() => fetchData()}
                                                    >
                                                        <Clock className="h-3.5 w-3.5 mr-2 text-indigo-500" /> Recalibrate
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Action Dialog */}
            <Dialog open={!!actionType} onOpenChange={(val) => !val && setActionType(null)}>
                <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
                    <DialogHeader className="p-0">
                        <div className={cn("p-8 text-white relative",
                            actionType === 'Reject' ? 'bg-rose-500' : 'bg-[#0b1120]'
                        )}>
                            <DialogTitle className="text-2xl font-black tracking-tighter italic uppercase text-white">
                                {actionType === 'Reject' ? 'Decommission Protocol' : 'Finalize Broadcast'}
                            </DialogTitle>
                            <DialogDescription className="text-xs font-bold opacity-60 uppercase tracking-widest mt-1 italic text-white/80">
                                {actionType === 'Reject' ? 'Mandatory reason required for logs.' : 'Inject meeting assets into the learning mesh.'}
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <div className="p-8 space-y-6">
                        {actionType !== 'Reject' ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Meeting Asset (URL)</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            className="h-12 rounded-xl bg-muted/30 border-none font-bold"
                                            placeholder="Paste Google Meet/Zoom link..."
                                            value={meetingLink}
                                            onChange={(e) => setMeetingLink(e.target.value)}
                                        />
                                        <Button variant="outline" className="h-12 w-12 rounded-xl" onClick={() => window.open('https://meet.google.com/new', '_blank')}>
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Synchronization Notes</Label>
                                    <Textarea
                                        className="rounded-2xl h-24 bg-muted/30 border-none font-medium italic text-sm"
                                        placeholder="Add prep material or instructions..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Decline Rationale (Mandatory)</Label>
                                <Textarea
                                    className="rounded-2xl h-32 bg-rose-50 border-rose-100 text-rose-900 font-bold italic text-sm focus:ring-rose-500"
                                    placeholder="Explain why this inquiry cannot be satisfied..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <div className="p-8 pt-0 flex gap-3">
                        <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]" onClick={() => setActionType(null)}>Abort</Button>
                        <Button
                            className={cn("flex-1 h-14 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] shadow-xl transition-all",
                                actionType === 'Reject' ? 'bg-rose-600 shadow-rose-600/20' : 'bg-primary shadow-primary/20 hover:scale-105'
                            )}
                            onClick={handleAction}
                        >
                            {actionType === 'Reject' ? <XCircle className="h-4 w-4 mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                            {actionType === 'Reject' ? 'Confirm Deletion' : 'Propagate Status'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TrainerRequests;
