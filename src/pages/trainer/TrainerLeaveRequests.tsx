import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { db, LeaveRequest, User as UserInfo } from "@/lib/db";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
    Calendar,
    CheckCircle2,
    MessageSquare,
    Search,
    XCircle,
    Zap
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const TrainerLeaveRequests = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
    const [reviewComments, setReviewComments] = useState("");

    const refreshData = () => {
        // Show ALL leave requests from students, similar to the student directory
        // Filter out any non-student requests if necessary, but typically only students submit these
        const allRequests = db.getLeaveRequests().reverse();
        setRequests(allRequests);
        setUsers(db.getUsers());
    };

    useEffect(() => {
        refreshData();
        const interval = setInterval(refreshData, 3000);
        return () => clearInterval(interval);
    }, [user?.id]);

    const handleAction = (status: "Approved" | "Rejected") => {
        if (!selectedRequest || !user) return;

        db.updateLeaveRequestStatus(selectedRequest.id, status, user.id, reviewComments);

        // Create in-app notification for student
        db.createNotification({
            userId: selectedRequest.userId,
            title: status === "Approved" ? "✅ Leave Request Authorized" : "❌ Leave Request Declined",
            message: `Your leave request for ${selectedRequest.startDate} has been ${status.toLowerCase()} by Instructor ${user.name}.${reviewComments ? ` Comments: ${reviewComments}` : ''}`,
            type: status === "Approved" ? "success" : "error",
            category: "leave"
        });

        toast.success(`Request ${status.toLowerCase()} successfully.`);
        setSelectedRequest(null);
        setReviewComments("");
        refreshData();
    };

    const getUserName = (id: string) => users.find(u => u.id === id)?.name || "Unknown";

    const filteredRequests = requests.filter(r =>
        getUserName(r.userId).toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.reason.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-8">
                <div>
                    <h1 className="font-display text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none">
                        Student <span className="text-primary not-italic">Absence</span> Registry
                    </h1>
                    <p className="text-muted-foreground text-sm font-bold opacity-60 mt-2 uppercase tracking-widest italic">
                        Monitor and adjudicate student leave requests
                    </p>
                </div>
                <Badge className="bg-primary/5 text-primary border-primary/20 rounded-xl px-4 py-2 font-black text-[10px] uppercase tracking-widest">
                    {requests.filter(r => r.status === 'Pending').length} Pending Review
                </Badge>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30" />
                <Input
                    placeholder="Search by student node..."
                    className="pl-12 h-14 bg-white border-none shadow-soft rounded-2xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2.5rem]">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-b bg-muted/5">
                                <TableHead className="px-8 py-6 font-black uppercase text-[10px] tracking-widest opacity-40">Identity</TableHead>
                                <TableHead className="px-8 py-6 font-black uppercase text-[10px] tracking-widest opacity-40">Period</TableHead>
                                <TableHead className="px-8 py-6 font-black uppercase text-[10px] tracking-widest opacity-40">Rationale</TableHead>
                                <TableHead className="px-8 py-6 font-black uppercase text-[10px] tracking-widest opacity-40">Status</TableHead>
                                <TableHead className="px-8 py-6 font-black uppercase text-[10px] tracking-widest opacity-40 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="popLayout">
                                {filteredRequests.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-20 text-center">
                                            <Zap className="h-12 w-12 mx-auto mb-4 text-primary opacity-10" />
                                            <p className="font-black uppercase tracking-widest text-[10px] opacity-30 italic">No absence packets detected.</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRequests.map((r, idx) => (
                                        <motion.tr
                                            key={r.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group hover:bg-muted/30 transition-colors border-b last:border-0"
                                        >
                                            <TableCell className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black shadow-inner">
                                                        {getUserName(r.userId).charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-sm tracking-tight italic">{getUserName(r.userId)}</p>
                                                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Student Node</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-8 py-6">
                                                <div className="flex flex-col text-[10px] font-black uppercase tracking-tighter opacity-70">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-3 w-3 opacity-50" />
                                                        <span>{r.startDate && r.startDate.includes('T') ? r.startDate.split('T')[0] : r.startDate}</span>
                                                    </div>
                                                    {r.endDate !== r.startDate && (
                                                        <span className="pl-5 opacity-40">to {r.endDate && r.endDate.includes('T') ? r.endDate.split('T')[0] : r.endDate}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-8 py-6">
                                                <p className="text-xs font-bold italic opacity-60 truncate max-w-[200px]">{r.reason}</p>
                                            </TableCell>
                                            <TableCell className="px-8 py-6">
                                                <Badge className={cn(
                                                    "rounded-lg px-3 py-1 font-black uppercase text-[9px] tracking-widest border-none",
                                                    r.status === 'Approved' ? "bg-emerald-500/10 text-emerald-600" :
                                                        r.status === 'Rejected' ? "bg-rose-500/10 text-rose-600" :
                                                            "bg-amber-500/10 text-amber-600 shadow-sm"
                                                )}>
                                                    {r.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-8 py-6 text-right">
                                                {r.status === 'Pending' ? (
                                                    <Button
                                                        size="sm"
                                                        className="rounded-xl px-4 font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                                                        onClick={() => setSelectedRequest(r)}
                                                    >
                                                        Review
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="opacity-50 hover:opacity-100"
                                                        onClick={() => {
                                                            setSelectedRequest(r);
                                                            setReviewComments(r.comments || "");
                                                        }}
                                                    >
                                                        Details
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Review Dialog */}
            <Dialog open={!!selectedRequest} onOpenChange={(val) => !val && setSelectedRequest(null)}>
                <DialogContent className="sm:max-w-md rounded-[2rem] border-none shadow-2xl bg-white/95 backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic flex items-center gap-2">
                            <span className="text-primary">#</span> Review Request
                        </DialogTitle>
                    </DialogHeader>
                    {selectedRequest && (
                        <div className="space-y-6 pt-2">
                            <div className="p-6 rounded-3xl bg-muted/30 space-y-4 border border-dashed border-black/5">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Applicant</p>
                                        <p className="font-bold text-lg">{getUserName(selectedRequest.userId)}</p>
                                    </div>
                                    <Badge className={cn(
                                        "px-2 py-0.5 text-[10px] uppercase font-black tracking-widest border-none",
                                        selectedRequest.status === 'Pending' ? "bg-amber-500/10 text-amber-600" :
                                            selectedRequest.status === 'Approved' ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                                    )}>
                                        {selectedRequest.status}
                                    </Badge>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Rationale</p>
                                    <div className="flex gap-3 items-start">
                                        <MessageSquare className="h-4 w-4 text-primary opacity-50 mt-0.5" />
                                        <p className="text-sm italic font-medium leading-tight">{selectedRequest.reason}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-2">
                                    <div className="flex-1 bg-white p-2 rounded-xl text-center">
                                        <p className="text-[9px] font-black uppercase opacity-30">Start</p>
                                        <p className="font-bold text-xs">{selectedRequest.startDate.split('T')[0]}</p>
                                    </div>
                                    <div className="flex-1 bg-white p-2 rounded-xl text-center">
                                        <p className="text-[9px] font-black uppercase opacity-30">End</p>
                                        <p className="font-bold text-xs">{selectedRequest.endDate.split('T')[0]}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-2">Instructor Decision Notes</Label>
                                <Textarea
                                    className="rounded-2xl bg-muted/20 border-none min-h-[100px] resize-none focus:ring-2 ring-primary/20"
                                    placeholder="Enter your rationale for approval or rejection..."
                                    value={reviewComments}
                                    onChange={(e) => setReviewComments(e.target.value)}
                                />
                            </div>

                            <DialogFooter className="flex gap-3 pt-2">
                                {selectedRequest.status !== 'Rejected' && (
                                    <Button
                                        variant="ghost"
                                        className="flex-1 rounded-2xl font-bold text-rose-500 hover:bg-rose-50 hover:text-rose-600 h-12"
                                        onClick={() => handleAction("Rejected")}
                                    >
                                        <XCircle className="h-5 w-5 mr-2" /> {selectedRequest.status === 'Approved' ? 'Revoke (Reject)' : 'Decline'}
                                    </Button>
                                )}
                                {selectedRequest.status !== 'Approved' && (
                                    <Button
                                        className="flex-1 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold h-12 shadow-xl shadow-primary/20"
                                        onClick={() => handleAction("Approved")}
                                    >
                                        <CheckCircle2 className="h-5 w-5 mr-2" /> {selectedRequest.status === 'Rejected' ? 'Override (Approve)' : 'Authorize'}
                                    </Button>
                                )}
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TrainerLeaveRequests;
