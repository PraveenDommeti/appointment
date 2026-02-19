import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, Plus, Send, History, UserCheck } from "lucide-react";
import { db, TimeLog, User } from "@/lib/db";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const TrainerTimesheet = () => {
    const { user } = useAuth();
    const [pendingLogs, setPendingLogs] = useState<(TimeLog & { student?: User })[]>([]);
    const [myLogs, setMyLogs] = useState<TimeLog[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        activity: "",
        hours: ""
    });

    const refreshData = () => {
        if (!user) return;

        // Logs for students that this trainer needs to approve
        // Simplified: trainer approves all student logs for now, or we filter by course if we had that mapping
        const allLogs = db.getTimeLogs();
        const allUsers = db.getUsers();

        const studentLogs = allLogs.filter(l => {
            const logger = allUsers.find(u => u.id === l.userId);
            return logger?.role === "student" && l.status === "Pending";
        }).map(l => ({
            ...l,
            student: allUsers.find(u => u.id === l.userId)
        }));

        setPendingLogs(studentLogs);

        // Trainer's own logs
        setMyLogs(db.getTimeLogs(user.id));
    };

    useEffect(() => {
        refreshData();
    }, [user]);

    const handleAction = (id: string, status: "Approved" | "Rejected") => {
        db.updateTimeLogStatus(id, status);
        toast.success(`Student timesheet entry ${status.toLowerCase()}`);
        refreshData();
    };

    const handleLogHours = () => {
        if (!formData.activity || !formData.hours) {
            toast.error("Please fill in all fields");
            return;
        }

        const newLog: TimeLog = {
            id: Date.now().toString(),
            userId: user!.id,
            date: formData.date,
            activity: formData.activity,
            hours: parseFloat(formData.hours),
            status: "Pending"
        };

        db.addTimeLog(newLog);
        toast.success("Work hours submitted for audit");
        setFormData({ ...formData, activity: "", hours: "" });
        refreshData();
    };

    return (
        <div className="space-y-12 container mx-auto max-w-7xl pb-10">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-12 bg-muted/20 p-8 rounded-3xl border border-dashed"
            >
                <div>
                    <h1 className="font-display text-4xl font-bold tracking-tight text-foreground italic flex items-center gap-3">
                        Professional <span className="text-primary">Timesheet</span> <Clock className="h-8 w-8" />
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">Log your instructional hours and authorize student activity.</p>
                </div>
            </motion.div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Submit Hours */}
                <Card className="lg:col-span-4 border-none shadow-xl bg-card h-fit">
                    <CardHeader className="p-6 border-b bg-muted/5">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Plus className="h-5 w-5 text-primary" /> Log Work Hours
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-5">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Date of Service</Label>
                            <Input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="h-11 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Session Description</Label>
                            <Input
                                placeholder="e.g. French A1 Morning Lecture"
                                value={formData.activity}
                                onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                                className="h-11 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Duration (Hours)</Label>
                            <Input
                                type="number"
                                step="0.5"
                                placeholder="2.5"
                                value={formData.hours}
                                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                                className="h-11 rounded-xl"
                            />
                        </div>
                        <Button onClick={handleLogHours} className="w-full bg-primary font-bold rounded-xl h-11 shadow-lg shadow-primary/20">
                            <Send className="h-4 w-4 mr-2" /> Submit for Audit
                        </Button>
                    </CardContent>
                </Card>

                <div className="lg:col-span-8 space-y-8">
                    {/* Student Approvals */}
                    <Card className="border-none shadow-xl bg-card overflow-hidden">
                        <CardHeader className="p-6 border-b bg-muted/5">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <UserCheck className="h-5 w-5 text-primary" /> Student Authorization
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/5">
                                        <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Student</TableHead>
                                        <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Activity</TableHead>
                                        <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Hours</TableHead>
                                        <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence mode="popLayout">
                                        {pendingLogs.map((log) => (
                                            <motion.tr key={log.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                <TableCell className="px-6 py-4 font-bold">{log.student?.name || "Student"}</TableCell>
                                                <TableCell className="px-6 py-4 text-sm font-medium">{log.activity}</TableCell>
                                                <TableCell className="px-6 py-4"><Badge variant="outline" className="font-black">{log.hours}h</Badge></TableCell>
                                                <TableCell className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-500 hover:bg-emerald-500/10" onClick={() => handleAction(log.id, "Approved")}>
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500 hover:bg-rose-500/10" onClick={() => handleAction(log.id, "Rejected")}>
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                            {pendingLogs.length === 0 && (
                                <div className="py-12 text-center text-muted-foreground italic font-medium">No pending student logs for review.</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* My History */}
                    <Card className="border-none shadow-xl bg-card overflow-hidden">
                        <CardHeader className="p-6 border-b bg-muted/5">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <History className="h-5 w-5 text-primary" /> My Performance History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/5">
                                        <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Date</TableHead>
                                        <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Activity</TableHead>
                                        <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Hours</TableHead>
                                        <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60 text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {myLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="px-6 py-4 font-medium text-xs">{log.date}</TableCell>
                                            <TableCell className="px-6 py-4 font-bold">{log.activity}</TableCell>
                                            <TableCell className="px-6 py-4 font-black">{log.hours}h</TableCell>
                                            <TableCell className="px-6 py-4 text-right">
                                                <Badge className={cn(
                                                    "rounded-lg px-2.5 py-0.5 font-bold uppercase text-[10px] border-none shadow-sm",
                                                    log.status === 'Approved' ? "bg-emerald-500/10 text-emerald-600" :
                                                        log.status === 'Rejected' ? "bg-rose-500/10 text-rose-600" :
                                                            "bg-amber-500/10 text-amber-600"
                                                )}>
                                                    {log.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default TrainerTimesheet;
