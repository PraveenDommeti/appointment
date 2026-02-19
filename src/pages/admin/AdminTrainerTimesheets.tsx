import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db, TimeLog, User as UserInfo } from "@/lib/db";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, FileText, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const AdminTrainerTimesheets = () => {
    const [logs, setLogs] = useState<(TimeLog & { trainer?: UserInfo })[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const refreshData = () => {
        const allLogs = db.getTimeLogs();
        const allUsers = db.getUsers();

        const trainerLogs = allLogs.filter(l => {
            const logger = allUsers.find(u => u.id === l.userId);
            return logger?.role === "trainer";
        }).map(l => ({
            ...l,
            trainer: allUsers.find(u => u.id === l.userId)
        }));

        setLogs(trainerLogs.reverse());
    };

    useEffect(() => {
        refreshData();
    }, []);

    const handleAction = (id: string, status: "Approved" | "Rejected") => {
        const log = logs.find(l => l.id === id);
        if (!log || !log.trainer) return;

        db.updateTimeLogStatus(id, status);

        // Create in-app notification for trainer
        db.createNotification({
            userId: log.userId,
            title: status === "Approved" ? "✅ Timesheet Approved" : "❌ Timesheet Rejected",
            message: `Your timesheet entry for ${log.activity} (${log.hours}h on ${log.date}) has been ${status.toLowerCase()}`,
            type: status === "Approved" ? "success" : "error",
            category: "timesheet"
        });

        toast.success(`Trainer timesheet entry ${status.toLowerCase()}`);
        refreshData();
    };

    const filteredLogs = logs.filter(l => {
        const matchesSearch = l.trainer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.activity.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || l.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-10 container mx-auto max-w-7xl pb-10">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-12 bg-muted/20 p-8 rounded-3xl border border-dashed"
            >
                <div className="space-y-1">
                    <h1 className="font-display text-4xl font-bold tracking-tight text-foreground italic flex items-center gap-3">
                        Trainer <span className="text-primary">Timesheets</span> <FileText className="h-8 w-8" />
                    </h1>
                    <p className="text-muted-foreground font-medium">Audit and authorize instructional work hours for all faculty nodes.</p>
                </div>

                <div className="flex gap-2">
                    <Badge variant="outline" className="h-10 px-4 rounded-xl border-amber-500/20 text-amber-600 font-black uppercase text-[10px] bg-amber-500/5 flex items-center gap-2">
                        <AlertCircle className="h-3.5 w-3.5" /> {logs.filter(l => l.status === 'Pending').length} Pending Audit
                    </Badge>
                </div>
            </motion.div>

            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="p-6 border-b bg-muted/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search trainer or activity..."
                                className="pl-10 h-10 border-muted-foreground/20 rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-1 bg-muted p-1 rounded-xl border border-muted-foreground/10">
                            {["all", "Pending", "Approved", "Rejected"].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
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
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-b bg-muted/5">
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Trainer</TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Date</TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Activity</TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Hours</TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Status</TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="popLayout">
                                {filteredLogs.map((l, idx) => (
                                    <motion.tr
                                        key={l.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group hover:bg-muted/30 transition-colors border-b last:border-0"
                                    >
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                                                    {l.trainer?.name.substring(0, 1)}
                                                </div>
                                                <span className="font-bold">{l.trainer?.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-xs font-semibold text-muted-foreground">{l.date}</TableCell>
                                        <TableCell className="px-6 py-4 font-bold text-sm">{l.activity}</TableCell>
                                        <TableCell className="px-6 py-4"><Badge variant="outline" className="font-black">{l.hours}h</Badge></TableCell>
                                        <TableCell className="px-6 py-4">
                                            <Badge className={cn(
                                                "rounded-lg px-2.5 py-0.5 font-bold uppercase text-[10px] border-none shadow-sm",
                                                l.status === 'Approved' ? "bg-emerald-500/10 text-emerald-600" :
                                                    l.status === 'Rejected' ? "bg-rose-500/10 text-rose-600" :
                                                        "bg-amber-500/10 text-amber-600"
                                            )}>
                                                {l.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {l.status === 'Pending' && (
                                                    <>
                                                        <Button size="sm" className="h-8 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-[10px] font-black uppercase" onClick={() => handleAction(l.id, 'Approved')}>Approve</Button>
                                                        <Button size="sm" variant="ghost" className="h-8 text-rose-500 hover:bg-rose-500/10 rounded-lg text-[10px] font-black uppercase" onClick={() => handleAction(l.id, 'Rejected')}>Reject</Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminTrainerTimesheets;
