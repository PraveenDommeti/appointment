import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Users, Search, Filter,
    TrendingUp, User, Activity,
    CheckCircle2, XCircle, Trophy,
    ChevronRight, Target, BarChart
} from "lucide-react";
import { db, User as UserInfo } from "@/lib/db";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminPerformance = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [students, setStudents] = useState<UserInfo[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (user) {
            setStudents(db.getUsers().filter(u => u.role === 'student'));
        }
    }, [user]);

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getPerformanceColor = (score: number) => {
        if (score >= 90) return "text-emerald-500";
        if (score >= 75) return "text-blue-500";
        if (score >= 60) return "text-amber-500";
        return "text-destructive";
    };

    return (
        <div className="space-y-10 container mx-auto max-w-7xl pb-10">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-12 bg-muted/20 p-8 rounded-3xl border border-dashed"
            >
                <div className="space-y-1">
                    <h1 className="font-display text-4xl font-bold tracking-tight text-foreground italic flex items-center gap-3">
                        Student <span className="text-primary">Performance</span> <Trophy className="h-8 w-8" />
                    </h1>
                    <p className="text-muted-foreground font-medium">Monitor academic progress and engagement across the entire platform.</p>
                </div>

                <div className="flex gap-2">
                    <Badge variant="outline" className="h-10 px-4 rounded-xl border-primary/20 text-primary font-black uppercase text-[10px] bg-primary/5 flex items-center gap-2">
                        <Trophy className="h-3.5 w-3.5" /> High Achievement Mode
                    </Badge>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Avg Platform Score", value: "82.4", icon: Target, color: "text-primary" },
                    { label: "Completion Rate", value: "91%", icon: CheckCircle2, color: "text-emerald-500" },
                    { label: "Active Engagement", value: "88%", icon: Activity, color: "text-blue-500" }
                ].map((m, i) => (
                    <Card key={i} className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className={cn("p-3 rounded-2xl bg-muted/50 shadow-inner", m.color)}>
                                    <m.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">{m.label}</p>
                                    <h3 className="text-2xl font-black">{m.value}</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="p-6 border-b bg-muted/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Find student by name..."
                            className="pl-10 h-10 border-muted-foreground/20 rounded-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Badge variant="outline" className="px-3 py-1 rounded-lg border-muted-foreground/20 uppercase text-[10px] font-black">
                        {filteredStudents.length} monitored students
                    </Badge>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-b bg-muted/5">
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Student Identity</TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Avg Score</TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Engagement</TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Trend</TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60 text-right">Settings</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="popLayout">
                                {filteredStudents.map((s, idx) => (
                                    <motion.tr
                                        key={s.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group hover:bg-muted/30 transition-colors border-b last:border-0"
                                    >
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-2xl bg-muted border flex items-center justify-center font-black text-sm text-primary shadow-inner">
                                                    {s.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground">{s.name}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-black opacity-70">{s.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className={cn("h-full rounded-full", s.performanceScore ? s.performanceScore >= 80 ? "bg-emerald-500" : "bg-primary" : "bg-muted")}
                                                        style={{ width: `${s.performanceScore || 0}%` }}
                                                    />
                                                </div>
                                                <span className={cn("text-sm font-black", getPerformanceColor(s.performanceScore || 0))}>
                                                    {s.performanceScore || 0}%
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <Badge variant="outline" className="text-[10px] font-black uppercase border-muted-foreground/10 bg-muted/5">
                                                Active
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs">
                                                <TrendingUp className="h-3 w-3" /> +2.4%
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                                                <BarChart className="h-4 w-4" />
                                            </Button>
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

export default AdminPerformance;
