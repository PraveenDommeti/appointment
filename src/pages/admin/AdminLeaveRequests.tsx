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
    Search,
    XCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const AdminLeaveRequests = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
    const [reviewComments, setReviewComments] = useState("");

    const refreshData = () => {
        setRequests(db.getLeaveRequests().reverse());
        setUsers(db.getUsers());
    };

    useEffect(() => {
        refreshData();
        const interval = setInterval(refreshData, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleAction = (status: "Approved" | "Rejected") => {
        if (!selectedRequest || !user) return;

        db.updateLeaveRequestStatus(selectedRequest.id, status, user.id, reviewComments);

        // Create in-app notification for student
        db.createNotification({
            userId: selectedRequest.userId,
            title: status === "Approved" ? "✅ Leave Request Approved" : "❌ Leave Request Rejected",
            message: `Your leave request from ${selectedRequest.startDate} to ${selectedRequest.endDate} has been ${status.toLowerCase()}${reviewComments ? `. Comments: ${reviewComments}` : ''}`,
            type: status === "Approved" ? "success" : "error",
            category: "leave"
        });

        toast.success(`Leave request ${status.toLowerCase()}`);
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
        <div className="space-y-10 container mx-auto max-w-7xl pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-12 bg-muted/20 p-8 rounded-3xl border border-dashed">
                <div>
                    <h1 className="font-display text-4xl font-bold tracking-tight text-foreground italic flex items-center gap-3">
                        Leave <span className="text-primary">Requests</span> <Calendar className="h-8 w-8" />
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">Review and authorize student leave applications.</p>
                </div>
                <Badge className="bg-amber-500/10 text-amber-600 border-none px-4 py-2 rounded-xl font-black uppercase text-[10px]">
                    {requests.filter(r => r.status === 'Pending').length} Pending Review
                </Badge>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
                <Input
                    placeholder="Search by student or reason..."
                    className="pl-12 h-14 bg-card border-none shadow-sm rounded-2xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-b bg-muted/5">
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Student</TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Duration</TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Reason</TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Status</TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60 text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="popLayout">
                                {filteredRequests.map((r, idx) => (
                                    <motion.tr
                                        key={r.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group hover:bg-muted/30 transition-colors border-b last:border-0"
                                    >
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                                                    {getUserName(r.userId).charAt(0)}
                                                </div>
                                                <span className="font-bold">{getUserName(r.userId)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex flex-col text-[10px] font-black uppercase opacity-70">
                                                <span>From: {r.startDate}</span>
                                                <span>To: {r.endDate}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <p className="text-sm font-medium italic opacity-70 truncate max-w-[200px]">{r.reason}</p>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <Badge className={cn(
                                                "rounded-lg px-2.5 py-0.5 font-bold uppercase text-[10px] border-none shadow-sm",
                                                r.status === 'Approved' ? "bg-emerald-500/10 text-emerald-600" :
                                                    r.status === 'Rejected' ? "bg-rose-500/10 text-rose-600" :
                                                        "bg-amber-500/10 text-amber-600"
                                            )}>
                                                {r.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-right">
                                            {r.status === 'Pending' ? (
                                                <Button
                                                    size="sm"
                                                    className="bg-primary rounded-lg text-[10px] font-black uppercase h-8 px-4"
                                                    onClick={() => setSelectedRequest(r)}
                                                >
                                                    Review
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-[10px] font-black uppercase"
                                                    onClick={() => {
                                                        setSelectedRequest(r);
                                                        setReviewComments(r.comments || "");
                                                    }}
                                                >
                                                    View Details
                                                </Button>
                                            )}
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={!!selectedRequest} onOpenChange={(val) => !val && setSelectedRequest(null)}>
                <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic">Review Request</DialogTitle>
                    </DialogHeader>
                    {selectedRequest && (
                        <div className="space-y-6 pt-4">
                            <div className="p-4 rounded-2xl bg-muted/30 space-y-3">
                                <div className="flex justify-between text-xs font-black uppercase tracking-widest opacity-50">
                                    <span>Applicant</span>
                                    <span>Status</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-lg">{getUserName(selectedRequest.userId)}</span>
                                    <Badge className="bg-amber-500/10 text-amber-600 border-none">{selectedRequest.status}</Badge>
                                </div>
                                <div className="pt-2 border-t border-black/5">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Reason</p>
                                    <p className="text-sm italic font-medium">{selectedRequest.reason}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Review Comments</Label>
                                <Textarea
                                    className="rounded-2xl bg-muted/30 border-none min-h-[100px]"
                                    placeholder="Enter decision rationale..."
                                    value={reviewComments}
                                    onChange={(e) => setReviewComments(e.target.value)}
                                    readOnly={selectedRequest.status !== 'Pending'}
                                />
                            </div>

                            {selectedRequest.status === 'Pending' && (
                                <DialogFooter className="flex gap-3 pt-4">
                                    <Button
                                        variant="ghost"
                                        className="flex-1 rounded-xl font-bold text-rose-500 hover:bg-rose-50"
                                        onClick={() => handleAction("Rejected")}
                                    >
                                        <XCircle className="h-4 w-4 mr-2" /> Decline
                                    </Button>
                                    <Button
                                        className="flex-1 rounded-xl bg-primary text-white font-bold"
                                        onClick={() => handleAction("Approved")}
                                    >
                                        <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
                                    </Button>
                                </DialogFooter>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminLeaveRequests;
