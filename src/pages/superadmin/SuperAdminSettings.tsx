import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useState } from "react";
import {
    Settings, Shield, Zap,
    Bell, Lock, Eye,
    Save, Radio, Layout,
    Globe, Server, Database, Terminal
} from "lucide-react";
import { cn } from "@/lib/utils";

const SuperAdminSettings = () => {
    const [settings, setSettings] = useState({
        maintenance: false,
        registrations: true,
        emailNotifs: true,
        debugMode: false,
        globalSync: true
    });

    const handleSave = () => {
        toast.success("Global platform configuration synchronized");
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
                        Global <span className="text-primary">Config</span> <Settings className="h-8 w-8 text-primary" />
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">
                        Platform-wide parameters and infrastructure state control.
                    </p>
                </div>

                <div className="flex gap-3">
                    <Button onClick={handleSave} className="bg-primary rounded-2xl h-12 px-6 shadow-lg shadow-primary/20 gap-2 hover:scale-105 transition-transform font-bold">
                        <Save className="h-4 w-4" /> Save Global State
                    </Button>
                </div>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="p-6 border-b bg-muted/5 flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                <Server className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Core Infrastructure</CardTitle>
                                <CardDescription>Critical system-wide state controls</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {[
                                {
                                    id: 'maintenance',
                                    label: 'Maintenance Mode',
                                    desc: 'Restrict platform access to Super Admins only.',
                                    icon: Lock,
                                    checked: settings.maintenance
                                },
                                {
                                    id: 'registrations',
                                    label: 'Open Registration',
                                    desc: 'Allow new entities to register on the platform.',
                                    icon: Globe,
                                    checked: settings.registrations
                                }
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-primary/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-background border shadow-sm">
                                            <item.icon className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-bold">{item.label}</Label>
                                            <p className="text-[10px] text-muted-foreground uppercase font-black opacity-60 italic">{item.desc}</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={item.checked}
                                        onCheckedChange={(c) => setSettings(s => ({ ...s, [item.id]: c }))}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="p-6 border-b bg-muted/5 flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                                <Zap className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Performance Nodes</CardTitle>
                                <CardDescription>Real-time optimization parameters</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-primary/10 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-lg bg-background border shadow-sm">
                                        <Database className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-bold">Global Data Sync</Label>
                                        <p className="text-[10px] text-muted-foreground uppercase font-black opacity-60 italic">Real-time replication across edge nodes.</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={settings.globalSync}
                                    onCheckedChange={(c) => setSettings(s => ({ ...s, globalSync: c }))}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden h-fit">
                        <CardHeader className="p-6 border-b bg-muted/5 flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                                <Shield className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Security Hierarchy</CardTitle>
                                <CardDescription>Permission and visibility protocols</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {[
                                {
                                    id: 'debugMode',
                                    label: 'Infrastructure Debug',
                                    desc: 'Expose low-level trace logs in control panel.',
                                    icon: Terminal,
                                    checked: settings.debugMode
                                },
                                {
                                    id: 'emailNotifs',
                                    label: 'System Transmissions',
                                    desc: 'Automated entity reach-out via secure mail.',
                                    icon: Bell,
                                    checked: settings.emailNotifs
                                }
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-primary/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-background border shadow-sm">
                                            <item.icon className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-bold">{item.label}</Label>
                                            <p className="text-[10px] text-muted-foreground uppercase font-black opacity-60 italic">{item.desc}</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={item.checked}
                                        onCheckedChange={(c) => setSettings(s => ({ ...s, [item.id]: c }))}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-gradient-dark text-white overflow-hidden p-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black italic">Platform Authority</h3>
                                <p className="text-sm opacity-70">Changes made here affect all platform entities including Admins, Trainers, and Students globally.</p>
                            </div>
                            <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Authorized By</p>
                                    <p className="text-xs font-bold font-mono">SUPER_ADMIN_SIG_Nexus_01</p>
                                </div>
                                <Shield className="h-8 w-8 opacity-20" />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminSettings;
