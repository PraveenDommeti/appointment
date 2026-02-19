import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Video, Calendar, Clock, GraduationCap,
    ChevronRight, Layers, Layout, Info,
    PlayCircle, ExternalLink, CheckCircle2,
    XCircle, AlertCircle, User
} from "lucide-react";
import { db, Appointment } from "@/lib/db";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const StudentMeetings = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<Appointment[]>([]);
    const [activeTab, setActiveTab] = useState("upcoming");

    const fetchData = () => {
        if (user?.id) {
            const all = db.getAppointments(user.id);
            setSessions(all);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, [user?.id]);

    const filteredSessions = sessions.filter(s => {
        if (activeTab === "upcoming") return s.status === "Approved";
        if (activeTab === "completed") return s.status === "Completed";
        if (activeTab === "pending") return s.status === "Pending";
        if (activeTab === "rejected") return s.status === "Rejected";
        return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const getStatusInfo = (status: string) => {
        switch (status) {
            case "Approved": return { label: "Approved", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-50 border-emerald-100" };
            case "Completed": return { label: "Completed", icon: CheckCircle2, color: "text-blue-500 bg-blue-50 border-blue-100" };
            case "Pending": return { label: "Pending", icon: Clock, color: "text-amber-500 bg-amber-50 border-amber-100" };
            case "Rejected": return { label: "Rejected", icon: XCircle, color: "text-rose-500 bg-rose-50 border-rose-100" };
            default: return { label: status, icon: Info, color: "text-gray-500 bg-gray-50 border-gray-100" };
        }
    };

    return (
        <div className="space-y-6 container mx-auto max-w-7xl">
            {/* Header section - Compact */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase italic leading-none">
                        Mes <span className="text-primary not-italic">Sessions</span>
                    </h1>
                    <p className="text-muted-foreground text-sm font-bold opacity-60 mt-2 uppercase tracking-widest italic">
                        Real-time Synchronized Learning Feed
                    </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                    <TabsList className="bg-white border rounded-2xl h-12 p-1 gap-1 shadow-sm">
                        <TabsTrigger value="upcoming" className="rounded-xl px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Upcoming</TabsTrigger>
                        <TabsTrigger value="completed" className="rounded-xl px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Completed</TabsTrigger>
                        <TabsTrigger value="pending" className="rounded-xl px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Pending</TabsTrigger>
                        <TabsTrigger value="rejected" className="rounded-xl px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Rejected</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Grid display */}
            <div className="grid gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredSessions.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-24 bg-white/50 border-2 border-dashed rounded-[2.5rem]"
                        >
                            <Layout className="h-16 w-16 mx-auto mb-4 opacity-10" />
                            <h3 className="text-xl font-black text-foreground opacity-20 italic">Empty Protocol Data</h3>
                            <p className="text-xs font-bold mt-2 italic opacity-40 uppercase tracking-widest">No sessions found in the current state filter.</p>
                        </motion.div>
                    ) : (
                        filteredSessions.map((session, idx) => {
                            const status = getStatusInfo(session.status);
                            return (
                                <motion.div
                                    key={session.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card className="border-none shadow-soft hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group">
                                        <CardContent className="p-0">
                                            <div className="flex flex-col md:flex-row min-h-[160px]">
                                                {/* Left Indicator */}
                                                <div className={cn("w-2 md:w-3 h-full absolute left-0 top-0 bottom-0",
                                                    session.status === 'Approved' ? 'bg-emerald-500' :
                                                        session.status === 'Completed' ? 'bg-blue-500' :
                                                            session.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'
                                                )} />

                                                <div className="flex-1 p-6 md:p-8 pl-8 md:pl-10 grid md:grid-cols-4 gap-6 items-center">
                                                    {/* Primary Info */}
                                                    <div className="md:col-span-2 space-y-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest", status.color)}>
                                                                <status.icon className="h-3 w-3" /> {status.label}
                                                            </div>
                                                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest opacity-40 rounded-full border-black/10">
                                                                {session.sessionType || 'Session'}
                                                            </Badge>
                                                        </div>
                                                        <h3 className="text-2xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">
                                                            {session.topic}
                                                        </h3>
                                                        <div className="flex flex-wrap items-center gap-6 text-[11px] font-black uppercase tracking-tighter text-muted-foreground opacity-60">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-3.5 w-3.5 text-primary" /> {new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="h-3.5 w-3.5 text-primary" /> {session.time}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <User className="h-3.5 w-3.5 text-primary" /> {session.trainerName || "L'école de Français"}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Description / Secondary Info */}
                                                    <div className="hidden md:block border-l border-black/5 pl-6">
                                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-20 mb-2">Duration / Notes</p>
                                                        <p className="text-xs font-bold leading-relaxed opacity-60 italic">
                                                            {session.description || "No additional synchronization notes provided for this unit."}
                                                        </p>
                                                        {session.rejectionReason && session.status === "Rejected" && (
                                                            <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-bold">
                                                                Reason: {session.rejectionReason}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Action Area */}
                                                    <div className="flex flex-col items-center justify-center p-4">
                                                        {session.status === "Approved" ? (
                                                            session.meetingLink ? (
                                                                <Button
                                                                    className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] gap-3 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                                                                    onClick={() => window.open(session.meetingLink, '_blank')}
                                                                >
                                                                    <PlayCircle className="h-5 w-5" /> Join Session
                                                                </Button>
                                                            ) : (
                                                                <div className="flex flex-col items-center gap-2 text-center opacity-40">
                                                                    <div className="h-10 w-10 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center animate-spin-slow">
                                                                        <Clock className="h-5 w-5 text-primary" />
                                                                    </div>
                                                                    <p className="text-[9px] font-black uppercase tracking-widest">Waiting for Link</p>
                                                                </div>
                                                            )
                                                        ) : session.status === "Completed" ? (
                                                            <div className="flex flex-col items-center gap-1 opacity-40 text-blue-600">
                                                                <CheckCircle2 className="h-8 w-8" />
                                                                <span className="text-[8px] font-black uppercase tracking-widest">Protocol Success</span>
                                                            </div>
                                                        ) : (
                                                            <div className="text-[10px] font-black uppercase tracking-widest opacity-20 italic">
                                                                Status: {session.status}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default StudentMeetings;
