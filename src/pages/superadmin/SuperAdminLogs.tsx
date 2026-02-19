import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
    Activity, Shield, Terminal,
    Search, Filter, Globe,
    Lock, Database, Clock,
    AlertCircle, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const SuperAdminLogs = () => {
    const [searchTerm, setSearchTerm] = useState("");

    // Mock logs with more detail
    const logs = [
        { id: 1, action: "Identity Sync", user: "system@nexus.io", ip: "10.0.4.12", time: "2023-10-25 10:30:12", type: "system" },
        { id: 2, action: "Admin Promotion", user: "superadmin@classbook.com", ip: "192.168.1.5", time: "2023-10-25 09:15:45", type: "security" },
        { id: 3, action: "Auth Refresh", user: "trainer@classbook.com", ip: "172.16.0.44", time: "2023-10-25 03:00:22", type: "auth" },
        { id: 4, action: "Firewall Block", user: "unauthorized_node", ip: "45.12.8.99", time: "2023-10-24 23:12:11", type: "alert" },
        { id: 5, action: "Registry Purge", user: "superadmin@classbook.com", ip: "192.168.1.5", time: "2023-10-24 15:45:33", type: "system" },
    ];

    const filteredLogs = logs.filter(l =>
        l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.user.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'security': return "text-purple-500 bg-purple-500/10";
            case 'auth': return "text-blue-500 bg-blue-500/10";
            case 'alert': return "text-rose-500 bg-rose-500/10";
            default: return "text-emerald-500 bg-emerald-500/10";
        }
    };

    return (
        <div className="space-y-10 container mx-auto max-w-7xl pb-10">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-12 bg-muted/20 p-8 rounded-3xl border border-dashed"
            >
                <div>
                    <h1 className="font-display text-4xl font-bold tracking-tight text-foreground italic flex items-center gap-3">
                        Audit <span className="text-primary">Registry</span> <Terminal className="h-8 w-8 text-primary" />
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">
                        Real-time system event streaming and security state monitoring.
                    </p>
                </div>

                <div className="flex gap-3">
                    <Badge variant="outline" className="h-10 px-4 rounded-xl border-emerald-500/20 text-emerald-500 font-bold uppercase text-[10px] bg-emerald-500/5 flex items-center gap-2">
                        <Activity className="h-3.5 w-3.5" /> Live Stream Active
                    </Badge>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Events", value: "12,482", icon: Database, color: "text-primary" },
                    { label: "Security Triggers", value: "24", icon: Lock, color: "text-purple-500" },
                    { label: "Sync Status", value: "99.9%", icon: Globe, color: "text-emerald-500" }
                ].map((m, i) => (
                    <Card key={i} className="border-none shadow-lg bg-card/50 backdrop-blur-sm group hover:scale-[1.02] transition-transform">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className={cn("p-2.5 rounded-2xl bg-muted group-hover:bg-primary/10 transition-colors shadow-inner", m.color)}>
                                    <m.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">{m.label}</p>
                                    <h3 className="text-xl font-black">{m.value}</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col h-[600px]">
                <CardHeader className="p-6 border-b bg-muted/5 flex flex-row items-center justify-between">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search event registry..."
                            className="pl-10 h-10 border-muted-foreground/20 rounded-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Badge variant="outline" className="rounded-lg h-8 bg-muted/50 border-none px-3 font-bold uppercase text-[9px] tracking-widest">
                            Filter
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="min-w-[800px]">
                            <div className="grid grid-cols-5 gap-4 px-6 py-4 border-b bg-muted/30 font-bold text-[10px] uppercase tracking-widest opacity-60">
                                <div>Event Timestamp</div>
                                <div>Action Authority</div>
                                <div>Identity Node</div>
                                <div>IP Configuration</div>
                                <div className="text-right">Safety Status</div>
                            </div>
                            <AnimatePresence>
                                {filteredLogs.map((log, i) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="grid grid-cols-5 gap-4 px-6 py-4 border-b last:border-0 items-center hover:bg-muted/30 transition-colors group"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="font-mono text-xs text-muted-foreground">{log.time}</span>
                                        </div>
                                        <div className="font-bold flex items-center gap-2">
                                            <div className={cn("w-1.5 h-1.5 rounded-full", log.type === 'alert' ? 'bg-rose-500' : 'bg-primary')} />
                                            {log.action}
                                        </div>
                                        <div className="text-xs font-bold font-mono opacity-80">{log.user}</div>
                                        <div className="font-mono text-[10px] text-muted-foreground bg-muted/50 px-2 py-1 rounded w-fit">{log.ip}</div>
                                        <div className="text-right">
                                            <Badge className={cn("rounded-lg border-none px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter", getTypeColor(log.type))}>
                                                {log.type === 'alert' ? 'Critical' : 'Verified'}
                                            </Badge>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};

export default SuperAdminLogs;
