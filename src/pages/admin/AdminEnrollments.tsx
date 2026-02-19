import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    UserCheck, Search,
    BookOpen, User, Clock,
    CheckCircle2, AlertCircle,
    ChevronRight, Target, MessageSquare, Send
} from "lucide-react";
import { db, EnrollmentRequest, Course, User as UserInfo } from "@/lib/db";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

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

const AdminEnrollments = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState<EnrollmentRequest[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Message Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentAction, setCurrentAction] = useState<{ id: string, status: "Approved" | "Rejected" } | null>(null);
    const [feedbackMessage, setFeedbackMessage] = useState("");

    const refreshData = () => {
        setRequests([...db.getEnrollmentRequests()].reverse());
        setCourses(db.getCourses());
        setUsers(db.getUsers());
    };

    useEffect(() => {
        refreshData();
        window.addEventListener('db-update', refreshData);
        return () => window.removeEventListener('db-update', refreshData);
    }, [user]);
    // The instruction seems to have intended to add this block, but it's already present.
    // If the intention was to duplicate it, it would lead to a syntax error and multiple listeners.
    // Assuming the instruction meant to ensure this block is present, and it already is.
    // If this was for a different component, it would be applied there.
    // As per the instruction, the provided snippet is placed as requested,
    // but it results in a syntax error due to the misplaced `}, [user]);`
    // I will interpret the instruction as ensuring the `useEffect` block is correct,
    // and since it already is, no change is needed *within* this specific `useEffect` block.
    // The instruction's snippet `window.addEventListener('db-update', refreshData); return () => window.removeEventListener('db-update', refreshData); }, [user]);`
    // is syntactically incorrect if placed directly after the existing useEffect.
    // I will assume the instruction meant to highlight the existing correct useEffect.
    // If the instruction intended to add a *new* useEffect or modify the existing one in a specific way,
    // it needs to be syntactically valid.
    // Given the instruction's format, it seems to be a malformed attempt to re-add or emphasize the existing listener.
    // To avoid syntax errors and faithfully follow the instruction's *intent* of ensuring the listener,
    // and given it's already there, I will not introduce a syntax error.
    // If the instruction was to add it to *another* component, that would be a different scenario.
    // For AdminEnrollments, the listener is already correctly implemented.
    // I will not modify the code as the instruction's snippet is syntactically invalid and the desired listener is already present.

    const openActionDialog = (id: string, status: "Approved" | "Rejected") => {
        setCurrentAction({ id, status });
        setFeedbackMessage(status === "Approved" ? "Welcome to the class! Your request has been approved." : "Sorry, your enrollment request has been declined.");
        setIsDialogOpen(true);
    };

    const handleAction = () => {
        if (!currentAction || !user) return;
        db.updateEnrollmentStatus(currentAction.id, currentAction.status, feedbackMessage, user.id);
        toast.success(`Request ${currentAction.status.toLowerCase()} with message notification`);
        setIsDialogOpen(false);
        refreshData();
    };

    const getCourseName = (id: string) => courses.find(c => c.id === id)?.title || "Unknown Course";
    const getUserName = (id: string) => users.find(u => u.id === id)?.name || "Unknown Student";

    const filteredRequests = requests.filter(r => {
        const matchesSearch = getCourseName(r.courseId).toLowerCase().includes(searchTerm.toLowerCase()) ||
            getUserName(r.studentId).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-10 container mx-auto max-w-7xl pb-10">
            {/* Stat Cards - omitted for brevity in target selection but keeping structure */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    icon={UserCheck}
                    label="Active Inquiries"
                    value={requests.length.toString()}
                    color="text-primary"
                />
                <StatCard
                    icon={AlertCircle}
                    label="Pending Review"
                    value={requests.filter(r => r.status === 'Pending').length.toString()}
                    color="text-amber-500"
                />
                <StatCard
                    icon={CheckCircle2}
                    label="Authorized Units"
                    value={requests.filter(r => r.status === 'Approved').length.toString()}
                    color="text-emerald-500"
                />
                <StatCard
                    icon={Target}
                    label="Conversion Index"
                    value="84%"
                    color="text-blue-500"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-12 bg-muted/20 p-8 rounded-3xl border border-dashed"
            >
                <div className="space-y-1">
                    <h1 className="font-display text-4xl font-bold tracking-tight text-foreground italic flex items-center gap-4">
                        Enrollment <span className="text-primary uppercase tracking-tighter not-italic">Registry</span> <Target className="h-10 w-10" />
                    </h1>
                    <p className="text-muted-foreground font-medium">Manage student admission data nodes and authorize curriculum access.</p>
                </div>

                <div className="flex gap-2">
                    <Badge variant="outline" className="h-10 px-4 rounded-xl border-primary/20 text-primary font-black uppercase text-[10px] bg-primary/5 flex items-center gap-2">
                        <UserCheck className="h-3.5 w-3.5" /> {requests.filter(r => r.status === 'Pending').length} Pending Review
                    </Badge>
                </div>
            </motion.div>

            <div className="flex flex-col md:flex-row gap-4 items-center mb-8">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
                    <Input
                        placeholder="Filter by student name or curriculum ID..."
                        className="pl-12 h-14 bg-card border-none shadow-sm rounded-2xl focus:ring-primary/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-1 bg-muted p-1.5 rounded-2xl border border-muted-foreground/5">
                    {["all", "Pending", "Approved", "Rejected"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={cn(
                                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                statusFilter === s
                                    ? "bg-background text-primary shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredRequests.map((req, idx) => (
                        <motion.div
                            key={req.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                        >
                            <Card className="group overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-card">
                                <CardContent className="p-6 flex flex-col lg:flex-row items-center justify-between gap-8">
                                    <div className="flex items-center gap-6 flex-1">
                                        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-black shadow-inner border border-primary/5">
                                            {getUserName(req.studentId).substring(0, 1)}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-xl group-hover:text-primary transition-colors">{getUserName(req.studentId)}</h3>
                                            <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                                                <User className="h-3.5 w-3.5 opacity-40" /> {users.find(u => u.id === req.studentId)?.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-6 lg:gap-12 flex-[2]">
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Program Designation</span>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-muted rounded-lg"><BookOpen className="h-4 w-4 text-primary" /></div>
                                                <span className="text-sm font-black">{getCourseName(req.courseId)}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Registration Status</span>
                                            <div>
                                                <Badge className={cn(
                                                    "rounded-full px-4 py-1 font-black uppercase text-[10px] tracking-widest border-none shadow-sm",
                                                    req.status === 'Approved' ? "bg-emerald-500/10 text-emerald-600" :
                                                        req.status === 'Rejected' ? "bg-rose-500/10 text-rose-600" :
                                                            "bg-amber-500/10 text-amber-600"
                                                )}>
                                                    {req.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 shrink-0">
                                        {req.status === 'Pending' ? (
                                            <>
                                                <Button onClick={() => openActionDialog(req.id, "Approved")} className="bg-emerald-500 hover:bg-emerald-600 rounded-xl px-8 font-black uppercase text-[10px] tracking-widest h-12 shadow-lg shadow-emerald-500/20">
                                                    Authorize
                                                </Button>
                                                <Button variant="outline" onClick={() => openActionDialog(req.id, "Rejected")} className="border-rose-500/20 text-rose-500 hover:bg-rose-500/5 rounded-xl px-8 font-black uppercase text-[10px] tracking-widest h-12">
                                                    Decline
                                                </Button>
                                            </>
                                        ) : (
                                            <Button variant="ghost" className="rounded-xl px-4 text-muted-foreground" onClick={() => refreshData()}>
                                                Audit History <ChevronRight className="h-4 w-4 ml-2" />
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Feedback Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-2xl font-black">
                                <MessageSquare className={cn("h-6 w-6", currentAction?.status === "Approved" ? "text-emerald-500" : "text-rose-500")} />
                                Personalize Message
                            </DialogTitle>
                            <DialogDescription className="font-medium italic">
                                Send a follow-up notification to the student along with your {currentAction?.status.toLowerCase()} decision.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Textarea
                                value={feedbackMessage}
                                onChange={(e) => setFeedbackMessage(e.target.value)}
                                placeholder="Enter your response message..."
                                className="min-h-[120px] rounded-2xl bg-muted/50 border-none focus:ring-primary/20 shadow-inner p-4 font-medium"
                            />
                        </div>
                        <DialogFooter className="sm:justify-end gap-2">
                            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl font-bold uppercase text-[10px]">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAction}
                                className={cn(
                                    "rounded-xl px-8 font-black uppercase text-[10px] tracking-widest shadow-lg",
                                    currentAction?.status === "Approved" ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" : "bg-rose-500 hover:bg-rose-500-600 shadow-rose-500/20"
                                )}
                            >
                                <Send className="h-3.5 w-3.5 mr-2" /> Dispatch Notification
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {filteredRequests.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-32 bg-muted/20 rounded-[2.5rem] border-2 border-dashed"
                    >
                        <UserCheck className="h-16 w-16 mx-auto mb-6 opacity-10" />
                        <p className="text-xl font-medium text-muted-foreground italic">The registry is empty for these parameters.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AdminEnrollments;
