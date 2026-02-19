import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Filter, AlertCircle, Clock, Check, X } from "lucide-react";
import { db, TimeLog, User } from "@/lib/db";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SuperAdminTimesheets = () => {
    const [logs, setLogs] = useState<(TimeLog & { user?: User })[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    const refreshData = () => {
        const allLogs = db.getTimeLogs();
        const allUsers = db.getUsers();

        const enhancedLogs = allLogs.map(l => ({
            ...l,
            user: allUsers.find(u => u.id === l.userId)
        }));

        setLogs(enhancedLogs.reverse());
    };

    useEffect(() => {
        refreshData();
    }, []);

    const handleAction = (id: string, status: "Approved" | "Rejected") => {
        db.updateTimeLogStatus(id, status);
        toast.success(`Timesheet entry ${status.toLowerCase()}`);
        refreshData();
    };

    const filteredLogs = logs.filter(l => {
        const matchesSearch = l.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.activity.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "all" || l.user?.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-12 pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10 p-10 lg:p-14"
            >
                <div className="relative z-10">
                    <h1 className="text-5xl lg:text-6xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40 italic">
                        Node Audit <span className="text-primary not-italic">Engine</span> 📊
                    </h1>
                    <p className="text-xl text-white/50 max-w-2xl font-medium">
                        Comprehensive monitoring and authorization of work hours across all instructional and administrative nodes.
                    </p>
                </div>

                {/* Visual Flair */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -mr-20 -mt-20 animate-pulse" />
            </motion.div>

            <Card className="bg-white/5 border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-xl">
                <CardHeader className="p-8 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6 flex-1 w-full md:w-auto">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                            <Input
                                placeholder="Audit activity or node identifier..."
                                className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:ring-primary/50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-1 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                            {["all", "trainer", "student"].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRoleFilter(r)}
                                    className={cn(
                                        "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        roleFilter === r
                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                            : "text-white/40 hover:text-white"
                                    )}
                                >
                                    {r}s
                                </button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-white/5 bg-white/5">
                                    <TableHead className="px-8 py-5 text-white/40 font-black uppercase text-[10px] tracking-[0.2em]">Node Identity</TableHead>
                                    <TableHead className="px-8 py-5 text-white/40 font-black uppercase text-[10px] tracking-[0.2em]">Timestamp</TableHead>
                                    <TableHead className="px-8 py-5 text-white/40 font-black uppercase text-[10px] tracking-[0.2em]">Operation Description</TableHead>
                                    <TableHead className="px-8 py-5 text-white/40 font-black uppercase text-[10px] tracking-[0.2em]">Quantum (Hours)</TableHead>
                                    <TableHead className="px-8 py-5 text-white/40 font-black uppercase text-[10px] tracking-[0.2em]">Integrity Status</TableHead>
                                    <TableHead className="px-8 py-5 text-white/40 font-black uppercase text-[10px] tracking-[0.2em] text-right">Directives</TableHead>
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
                                            className="group hover:bg-white/5 transition-colors border-white/5"
                                        >
                                            <TableCell className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary-foreground flex items-center justify-center text-white font-black text-xs shadow-lg">
                                                        {l.user?.name.substring(0, 1)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-white font-bold">{l.user?.name}</span>
                                                        <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">{l.user?.role}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-8 py-6 text-xs font-semibold text-white/40">{l.date}</TableCell>
                                            <TableCell className="px-8 py-6 text-white font-medium italic">{l.activity}</TableCell>
                                            <TableCell className="px-8 py-6"><Badge variant="outline" className="border-white/10 text-white font-black px-3 py-1 bg-white/5">{l.hours}h</Badge></TableCell>
                                            <TableCell className="px-8 py-6">
                                                <Badge className={cn(
                                                    "rounded-full px-4 py-1.5 font-black uppercase text-[10px] tracking-widest border-none",
                                                    l.status === 'Approved' ? "bg-emerald-500/20 text-emerald-400" :
                                                        l.status === 'Rejected' ? "bg-rose-500/20 text-rose-400" :
                                                            "bg-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                                                )}>
                                                    {l.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {l.status === 'Pending' && (
                                                        <>
                                                            <Button size="sm" className="bg-emerald-500/80 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase px-4 h-9 shadow-lg shadow-emerald-500/20" onClick={() => handleAction(l.id, 'Approved')}>Verify</Button>
                                                            <Button size="sm" variant="ghost" className="text-rose-400 hover:bg-rose-500/10 rounded-xl text-[10px] font-black uppercase px-4 h-9" onClick={() => handleAction(l.id, 'Rejected')}>Invalidate</Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    </div>
                    {filteredLogs.length === 0 && (
                        <div className="py-32 flex flex-col items-center justify-center text-white/20">
                            <Clock className="h-16 w-16 mb-6 opacity-10 animate-pulse" />
                            <p className="text-xl font-medium tracking-tight">No audit trails detected for current parameters.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SuperAdminTimesheets;
