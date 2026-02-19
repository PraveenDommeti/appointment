import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db, User as DBUser, TimeLog } from "@/lib/db";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Clock, Search, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const AdminStudentTimesheets = () => {
    const [logs, setLogs] = useState<TimeLog[]>([]);
    const [users, setUsers] = useState<DBUser[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const refreshData = () => {
        const studentLogs = db.getTimeLogs().filter(log => {
            const user = db.getUser(log.userId);
            return user?.role === "student";
        });
        setLogs(studentLogs);
        setUsers(db.getUsers());
    };

    useEffect(() => {
        refreshData();
        window.addEventListener('db-update', refreshData);
        return () => window.removeEventListener('db-update', refreshData);
    }, []);

    const handleStatusUpdate = (id: string, status: "Approved" | "Rejected") => {
        const log = logs.find(l => l.id === id);
        if (!log) return;

        db.updateTimeLogStatus(id, status);

        // Create in-app notification for student
        db.createNotification({
            userId: log.userId,
            title: status === "Approved" ? "✅ Timesheet Approved" : "❌ Timesheet Rejected",
            message: `Your timesheet entry for ${log.activity} (${log.hours}h on ${log.date}) has been ${status.toLowerCase()}`,
            type: status === "Approved" ? "success" : "error",
            category: "timesheet"
        });

        toast.success(`Timesheet entry ${status.toLowerCase()}`);
    };

    const getStudentName = (userId: string) => {
        return users.find(u => u.id === userId)?.name || "Unknown Student";
    };

    const filteredLogs = logs.filter(log =>
        getStudentName(log.userId).toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.activity.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 container mx-auto max-w-7xl pb-10">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12"
            >
                <h1 className="font-display text-4xl font-bold tracking-tight text-foreground italic flex items-center gap-3">
                    Student <span className="text-primary">Timesheets</span> <Clock className="h-8 w-8" />
                </h1>
                <p className="text-muted-foreground mt-2 font-medium">Audit and validate independent practice hours logged by students.</p>
            </motion.div>

            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="p-6 border-b bg-muted/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Find student or activity..."
                            className="pl-10 h-11 border-muted-foreground/20 rounded-xl bg-background"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary font-bold">
                            {logs.filter(l => l.status === "Pending").length} Pending Validation
                        </Badge>
                    </div>
                </div>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-b bg-muted/5">
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Student</TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Activity Detail</TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60 text-center">Duration</TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Status</TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60 text-right">Verification</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLogs.length > 0 ? (
                                filteredLogs.map(log => (
                                    <TableRow key={log.id} className="group hover:bg-muted/30 transition-colors border-b last:border-0">
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                    {getStudentName(log.userId).charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm">{getStudentName(log.userId)}</span>
                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                        <Calendar className="h-2.5 w-2.5" /> {log.date}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <p className="text-sm font-medium">{log.activity}</p>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <Badge variant="secondary" className="font-black text-xs px-3">
                                                {log.hours}h
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <Badge
                                                variant={log.status === 'Approved' ? 'default' : log.status === 'Rejected' ? 'destructive' : 'secondary'}
                                                className="text-[10px] font-black uppercase"
                                            >
                                                {log.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-right">
                                            {log.status === "Pending" ? (
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-emerald-500/10 hover:text-emerald-500" onClick={() => handleStatusUpdate(log.id, "Approved")}>
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleStatusUpdate(log.id, "Rejected")}>
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-bold opacity-40 italic uppercase">Validated</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-20 text-center text-muted-foreground italic">
                                        No student timesheets requiring review.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminStudentTimesheets;
