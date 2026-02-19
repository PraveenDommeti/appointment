import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { db, LeaveRequest } from "@/lib/db";
import { cn, generateUUID } from "@/lib/utils";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { AlertCircle, Calendar as CalendarIcon, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const StudentLeave = () => {
    const { user } = useAuth();
    const [date, setDate] = useState<Date>();
    const [reason, setReason] = useState("");
    const [type, setType] = useState("");
    const [history, setHistory] = useState<LeaveRequest[]>([]);

    const fetchHistory = () => {
        if (user) {
            const requests = db.getLeaveRequests(user.id);
            setHistory(requests.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
    };

    useEffect(() => {
        fetchHistory();
        const interval = setInterval(fetchHistory, 5000); // Polling for updates
        return () => clearInterval(interval);
    }, [user]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !date || !reason || !type) {
            toast.error("Please fill in all fields");
            return;
        }

        const newRequest: LeaveRequest = {
            id: generateUUID(),
            userId: user.id,
            startDate: date.toISOString(),
            endDate: date.toISOString(), // Single day for now
            reason: `[${type}] ${reason}`,
            status: "Pending",
            createdAt: new Date().toISOString()
        };

        db.addLeaveRequest(newRequest);
        toast.success("Leave request submitted successfully!");

        // Reset form
        setReason("");
        setType("");
        setDate(undefined);
        fetchHistory();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Approved": return "bg-emerald-100 text-emerald-700";
            case "Rejected": return "bg-rose-100 text-rose-700";
            default: return "bg-amber-100 text-amber-700";
        }
    };

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="font-display text-3xl font-bold text-foreground">Leave Requests</h1>
                <p className="text-muted-foreground mt-2">Submit and track your leave applications.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Request Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>New Request</CardTitle>
                        <CardDescription>Please submit your request at least 24 hours in advance.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label>Leave Type</Label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sick">Sick Leave</SelectItem>
                                        <SelectItem value="personal">Personal Leave</SelectItem>
                                        <SelectItem value="vacation">Vacation</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label>Reason</Label>
                                <Textarea
                                    placeholder="Please provide a brief reason..."
                                    className="min-h-[100px]"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />
                            </div>

                            <Button type="submit" className="w-full">Submit Request</Button>
                        </form>
                    </CardContent>
                </Card>

                {/* History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Request History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[500px] overflow-auto pr-2">
                            {history.length === 0 ? (
                                <div className="text-center py-10 opacity-50">
                                    <AlertCircle className="h-10 w-10 mx-auto mb-2" />
                                    <p>No requests found</p>
                                </div>
                            ) : (
                                history.map((item) => (
                                    <div key={item.id} className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-4 items-start">
                                                <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border shrink-0">
                                                    <Clock className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">{item.reason}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {format(new Date(item.startDate), "PPP")}
                                                        {item.startDate !== item.endDate && ` - ${format(new Date(item.endDate), "PPP")}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </div>

                                        {/* Feedback Section */}
                                        {(item.comments || item.status !== 'Pending') && (
                                            <div className="ml-14 bg-white/50 rounded-lg p-3 text-sm border border-black/5 relative">
                                                <div className="absolute top-0 left-4 -translate-y-1/2 w-3 h-3 bg-white border-t border-l border-black/5 rotate-45 transform"></div>

                                                {item.comments ? (
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                                                            Supervisor Feedback
                                                        </p>
                                                        <p className="text-foreground italic">"{item.comments}"</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-muted-foreground italic">
                                                        Request has been {item.status.toLowerCase()}.
                                                    </p>
                                                )}

                                                {item.status !== 'Pending' && (
                                                    <div className="mt-2 text-[10px] text-muted-foreground text-right uppercase font-bold tracking-wider opacity-60">
                                                        - Decision Logged
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default StudentLeave;
