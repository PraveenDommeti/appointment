import { motion } from "framer-motion";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Activity, Trophy, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const StudentAttendance = () => {
    const data = [
        { name: "Mon", present: 0, full: 8 },
        { name: "Tue", present: 0, full: 8 },
        { name: "Wed", present: 0, full: 8 },
        { name: "Thu", present: 0, full: 8 },
        { name: "Fri", present: 0, full: 8 },
    ];

    const StatCard = ({ icon: Icon, label, value, subtext, color }: any) => (
        <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm group hover:scale-[1.02] transition-transform overflow-hidden">
            <CardContent className="p-0">
                <div className={cn("h-1 w-full", color.replace('text-', 'bg-'))} />
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className={cn("p-3 rounded-2xl bg-muted group-hover:bg-primary/10 transition-colors", color)}>
                            <Icon className="h-6 w-6" />
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em] mb-1">{label}</p>
                        <h3 className="text-3xl font-black">{value}</h3>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">{subtext}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-10 container mx-auto max-w-7xl pb-10">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-muted/20 p-8 rounded-3xl border border-dashed"
            >
                <div className="space-y-1">
                    <h1 className="font-display text-4xl font-bold tracking-tight text-foreground italic flex items-center gap-3">
                        Presence <span className="text-primary not-italic uppercase tracking-tighter">Analytics</span> <Activity className="h-8 w-8" />
                    </h1>
                    <p className="text-muted-foreground font-medium">Monitoring your educational engagement and active learning nodes.</p>
                </div>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-4">
                <StatCard icon={Target} label="Engagement Rate" value="0%" subtext="0h tracked this week" color="text-primary" />
                <StatCard icon={CheckCircle2} label="Validated Units" value="0" subtext="No missed sessions" color="text-emerald-500" />
                <StatCard icon={Zap} label="Current Streak" value="0 Days" subtext="Start learning today" color="text-amber-500" />
                <StatCard icon={Trophy} label="Global Rank" value="--" subtext="Join a class to rank" color="text-blue-500" />
            </div>

            <div className="grid gap-6 lg:grid-cols-7">
                <Card className="lg:col-span-4 border-none shadow-xl bg-card/50 backdrop-blur-sm p-6 overflow-hidden">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-bold">Activity Pulse</h3>
                            <p className="text-sm text-muted-foreground">Hourly distribution of your learning sessions.</p>
                        </div>
                    </div>
                    <div className="h-[350px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tick={{ fontWeight: 800, fill: 'currentColor', opacity: 0.4 }} />
                                <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}h`} tick={{ fontWeight: 800, fill: 'currentColor', opacity: 0.4 }} />
                                <Tooltip cursor={{ fill: 'rgba(var(--primary), 0.05)' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', background: 'hsl(var(--card))' }} />
                                <Bar dataKey="present" radius={[8, 8, 8, 8]} barSize={40}>
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.present > 4 ? "hsl(var(--primary))" : "rgba(var(--primary), 0.2)"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="lg:col-span-3 border-none shadow-xl bg-card/50 backdrop-blur-sm p-6">
                    <h3 className="text-xl font-bold mb-6">Interaction Log</h3>
                    <div className="space-y-4">
                        <div className="py-20 text-center text-muted-foreground italic text-sm">
                            No recent history detected.
                        </div>
                    </div>
                    <Button variant="ghost" className="w-full mt-6 rounded-xl text-xs font-black uppercase tracking-widest text-muted-foreground">
                        Export Full History
                    </Button>
                </Card>
            </div>
        </div>
    );
};

export default StudentAttendance;
