import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Video, Search, Filter,
    Calendar, User, Clock,
    CheckCircle2, XCircle, AlertCircle,
    ChevronRight, ExternalLink, Globe, Plus
} from "lucide-react";
import { db, Appointment, User as UserInfo } from "@/lib/db";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

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

const AdminMeetings = () => {
    const { user } = useAuth();
    const [meetings, setMeetings] = useState<Appointment[]>([]);
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bulkLink, setBulkLink] = useState("");

    const refreshData = () => {
        setMeetings([...db.getAllAppointments()].reverse());
        setUsers(db.getUsers());
        setSelectedIds([]);
    };

    useEffect(() => {
        if (user) {
            refreshData();
        }
    }, [user]);

    const handleAction = (id: string, status: "Approved" | "Rejected") => {
        db.updateAppointmentStatus(id, status);
        toast.success(`Session ${status.toLowerCase()}`);
        refreshData();
    };

    const handleBulkBroadcast = () => {
        if (!bulkLink) {
            toast.error("Please enter a valid Meet link");
            return;
        }
        selectedIds.forEach(id => {
            db.updateAppointmentLink(id, bulkLink);
        });
        toast.success(`Link broadcasted to ${selectedIds.length} entities`);
        setBulkLink("");
        refreshData();
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const getUserName = (id: string) => users.find(u => u.id === id)?.name || "Unknown Identity";

    const filteredMeetings = meetings.filter(m => {
        const matchesSearch = m.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getUserName(m.userId).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || m.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-10 container mx-auto max-w-7xl pb-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    icon={Video}
                    label="Active Sessions"
                    value={meetings.length.toString()}
                    color="text-primary"
                />
                <StatCard
                    icon={AlertCircle}
                    label="Pending Authorization"
                    value={meetings.filter(m => m.status === 'Pending').length.toString()}
                    color="text-amber-500"
                />
                <StatCard
                    icon={CheckCircle2}
                    label="Healthy Interactions"
                    value={meetings.filter(m => m.status === 'Approved').length.toString()}
                    color="text-emerald-500"
                />
                <StatCard
                    icon={Clock}
                    label="Uptime Integrity"
                    value="99.9%"
                    color="text-blue-500"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-12 bg-muted/20 p-8 rounded-3xl border border-dashed"
            >
                <div className="space-y-1">
                    <h1 className="font-display text-4xl font-bold tracking-tight text-foreground italic flex items-center gap-3">
                        Session <span className="text-primary">Oversight</span> <Video className="h-8 w-8" />
                    </h1>
                    <p className="text-muted-foreground font-medium">Monitor and authorize real-time educational interactions.</p>
                </div>

                <div className="flex gap-2">
                    <Badge variant="outline" className="h-10 px-4 rounded-xl border-indigo-500/20 text-indigo-600 font-black uppercase text-[10px] bg-indigo-500/5 flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5" /> Platform-Wide Feed
                    </Badge>
                </div>
            </motion.div>

            {selectedIds.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-primary/5 border border-primary/20 p-6 rounded-3xl flex flex-col md:flex-row items-center gap-4 justify-between"
                >
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <Plus className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Bulk Broadcast Console</h3>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{selectedIds.length} Students Selected</p>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <Button
                            variant="outline"
                            className="bg-background rounded-xl h-12"
                            onClick={() => window.open('https://meet.google.com/new', '_blank')}
                        >
                            Create Link
                        </Button>
                        <Input
                            placeholder="Paste Meet URL here..."
                            className="h-12 border-primary/20 rounded-xl bg-background"
                            value={bulkLink}
                            onChange={(e) => setBulkLink(e.target.value)}
                        />
                        <Button
                            className="bg-primary rounded-xl h-12 px-8 font-bold"
                            onClick={handleBulkBroadcast}
                        >
                            Broadcast Now
                        </Button>
                    </div>
                </motion.div>
            )}

            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="p-6 border-b bg-muted/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Find session or student..."
                            className="pl-10 h-10 border-muted-foreground/20 rounded-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-b bg-muted/5">
                                <TableHead className="px-6 py-4 w-12"></TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Interaction Topic</TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Participants</TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Schedule</TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Protocol Status</TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60 text-right">Clearance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="popLayout">
                                {filteredMeetings.map((m, idx) => (
                                    <motion.tr
                                        key={m.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={cn(
                                            "group hover:bg-muted/30 transition-colors border-b last:border-0",
                                            selectedIds.includes(m.id) && "bg-primary/5"
                                        )}
                                    >
                                        <TableCell className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(m.id)}
                                                onChange={() => toggleSelect(m.id)}
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-inner">
                                                    <Video className="h-5 w-5" />
                                                </div>
                                                <p className="font-bold text-foreground">{m.topic}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold">{getUserName(m.userId)}</span>
                                                <span className="text-[10px] font-black uppercase opacity-60 italic tracking-tighter">Student Entity</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex flex-col text-[10px] font-black uppercase opacity-70">
                                                <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {m.date}</div>
                                                <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {m.time}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <Badge className={cn(
                                                "rounded-lg px-2.5 py-0.5 font-bold uppercase text-[10px] border-none shadow-sm",
                                                m.status === 'Approved' ? "bg-emerald-500/10 text-emerald-600" :
                                                    m.status === 'Rejected' ? "bg-destructive/10 text-destructive" :
                                                        "bg-amber-500/10 text-amber-600"
                                            )}>
                                                {m.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {m.status === 'Pending' ? (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            className="h-8 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-[10px] font-black uppercase"
                                                            onClick={() => handleAction(m.id, 'Approved')}
                                                        >
                                                            Authorize
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 text-destructive hover:bg-destructive/10 rounded-lg text-[10px] font-black uppercase"
                                                            onClick={() => handleAction(m.id, 'Rejected')}
                                                        >
                                                            Halt
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        {!m.meetingLink ? (
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 rounded-lg text-[10px] font-black border-primary/20 hover:bg-primary/5"
                                                                    onClick={() => window.open('https://meet.google.com/new', '_blank')}
                                                                >
                                                                    <Video className="h-3.5 w-3.5 mr-1" /> Meet
                                                                </Button>
                                                                <Input
                                                                    placeholder="Link..."
                                                                    className="h-8 w-24 text-[10px] rounded-lg border-muted-foreground/20"
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            db.updateAppointmentLink(m.id, (e.target as HTMLInputElement).value);
                                                                            toast.success("Linked broadcasted");
                                                                            refreshData();
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 flex items-center gap-2 text-emerald-600 hover:bg-emerald-50"
                                                                onClick={() => window.open(m.meetingLink, '_blank')}
                                                            >
                                                                <ExternalLink className="h-3.5 w-3.5" /> Bio-Link
                                                            </Button>
                                                        )}
                                                    </div>
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

export default AdminMeetings;
