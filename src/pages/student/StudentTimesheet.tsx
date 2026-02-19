import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Clock, Calendar, Activity, Zap, History } from "lucide-react";
import { toast } from "sonner";
import { db, TimeLog } from "@/lib/db";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const StudentTimesheet = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState<TimeLog[]>([]);
    const [newLog, setNewLog] = useState({ date: "", activity: "", hours: "" });

    useEffect(() => {
        if (user) {
            setLogs(db.getTimeLogs(user.id).reverse());
        }
    }, [user]);

    const handleAddLog = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newLog.date || !newLog.activity || !newLog.hours) return;

        const log: TimeLog = {
            id: Date.now().toString(),
            userId: user.id,
            date: newLog.date,
            activity: newLog.activity,
            hours: parseFloat(newLog.hours),
            status: "Pending",
        };

        db.addTimeLog(log);
        setLogs([log, ...logs]);
        setNewLog({ date: "", activity: "", hours: "" });
        toast.success("Time entry submitted to Trainer");
    };

    const handleDelete = (id: string) => {
        db.deleteTimeLog(id);
        setLogs(logs.filter((l) => l.id !== id));
        toast.info("Time entry deleted");
    };

    return (
        <div className="space-y-10 container mx-auto max-w-7xl pb-10">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-muted/20 p-8 rounded-3xl border border-dashed"
            >
                <div className="space-y-1">
                    <h1 className="font-display text-4xl font-bold tracking-tight text-foreground italic flex items-center gap-3">
                        Activity <span className="text-primary not-italic uppercase tracking-tighter">Ledger</span> <Activity className="h-8 w-8" />
                    </h1>
                    <p className="text-muted-foreground font-medium">Document your daily French training nodes for curriculum credit.</p>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase opacity-40">Total Logged</p>
                        <p className="text-2xl font-black">{logs.reduce((acc, curr) => acc + curr.hours, 0)}h</p>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Entry Form */}
                <div className="lg:col-span-4">
                    <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm p-8 sticky top-10 overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Plus className="h-32 w-32" />
                        </div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            Log Entry <Zap className="h-5 w-5 text-amber-500" />
                        </h2>
                        <form onSubmit={handleAddLog} className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Session Date</Label>
                                <Input
                                    type="date"
                                    className="h-12 bg-background border-muted rounded-xl focus:ring-primary/20"
                                    value={newLog.date}
                                    onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Practice Activity</Label>
                                <Input
                                    placeholder="e.g., Phonetics Drill, Podcast"
                                    className="h-12 bg-background border-muted rounded-xl focus:ring-primary/20"
                                    value={newLog.activity}
                                    onChange={(e) => setNewLog({ ...newLog, activity: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Intensity (Hours)</Label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                                    <Input
                                        type="number"
                                        step="0.5"
                                        min="0.5"
                                        placeholder="Duration..."
                                        className="h-12 pl-12 bg-background border-muted rounded-xl focus:ring-primary/20"
                                        value={newLog.hours}
                                        onChange={(e) => setNewLog({ ...newLog, hours: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full h-14 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl font-black uppercase tracking-widest text-[10px]">
                                Submit Activity Node
                            </Button>
                        </form>
                    </Card>
                </div>

                {/* History */}
                <div className="lg:col-span-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            History Cache <History className="h-6 w-6 text-primary" />
                        </h2>
                        <Badge variant="outline" className="rounded-full border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest">
                            {logs.length} Entries Found
                        </Badge>
                    </div>

                    <div className="grid gap-4">
                        <AnimatePresence mode="popLayout">
                            {logs.map((log, idx) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                                >
                                    <Card className="group border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-card overflow-hidden">
                                        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                            <div className="flex items-center gap-6 flex-1">
                                                <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                                                    <Calendar className="h-6 w-6" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="font-bold text-lg">{log.activity}</h3>
                                                    <p className="text-[10px] font-black uppercase opacity-40 flex items-center gap-2">
                                                        <Clock className="h-3 w-3" /> {log.hours} Hours tracked on {log.date}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <Badge className={cn(
                                                    "rounded-full px-4 py-1 font-black uppercase text-[10px] tracking-widest border-none shadow-sm",
                                                    log.status === 'Approved' ? "bg-emerald-500/10 text-emerald-600" :
                                                        log.status === 'Rejected' ? "bg-rose-500/10 text-rose-600" :
                                                            "bg-amber-500/10 text-amber-600"
                                                )}>
                                                    {log.status}
                                                </Badge>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-10 w-10 text-destructive hover:bg-destructive/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleDelete(log.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {logs.length === 0 && (
                            <div className="py-32 text-center bg-muted/20 border-2 border-dashed rounded-[2.5rem]">
                                <History className="h-16 w-16 mx-auto mb-6 opacity-10" />
                                <p className="text-xl font-medium text-muted-foreground italic">No activity nodes discovered in history cache.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentTimesheet;
