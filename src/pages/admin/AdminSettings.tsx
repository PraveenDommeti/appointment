import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    User, Mail, Shield, Bell,
    Lock, Eye, Save, Trash2,
    Settings as SettingsIcon, AlertCircle,
    Key, EyeOff, Radio, Layout
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/db";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const AdminSettings = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState({
        name: user?.name || "Admin",
        email: user?.email || "admin@example.com",
    });
    const [showPass, setShowPass] = useState(false);

    return (
        <div className="space-y-10 container mx-auto max-w-7xl pb-10">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-12 bg-muted/20 p-8 rounded-3xl border border-dashed"
            >
                <div>
                    <h1 className="font-display text-4xl font-bold tracking-tight text-foreground italic flex items-center gap-3">
                        Profile <span className="text-primary">Security</span> <Shield className="h-8 w-8" />
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">
                        Maintaining administrative integrity across the academy's infrastructure.
                    </p>
                </div>

                <div className="flex gap-2">
                    <Badge variant="outline" className="h-10 px-4 rounded-xl border-amber-500/20 text-amber-600 font-black uppercase text-[10px] bg-amber-500/5 flex items-center gap-2">
                        <Shield className="h-4 w-4" /> Priority Level 1 Access
                    </Badge>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Profile Form */}
                <div className="lg:col-span-8 space-y-8">
                    <Card className="border-none shadow-xl bg-card overflow-hidden">
                        <CardHeader className="p-6 border-b bg-muted/5">
                            <CardTitle className="text-xl font-bold flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                    <User className="h-5 w-5" />
                                </div>
                                Identity Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Authorized Name</Label>
                                    <Input
                                        value={profile.name}
                                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                                        className="h-12 rounded-2xl bg-muted/50 border-muted-foreground/10 focus-visible:ring-primary shadow-inner font-bold"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">System Email Gateway</Label>
                                    <Input
                                        value={profile.email}
                                        onChange={e => setProfile({ ...profile, email: e.target.value })}
                                        className="h-12 rounded-2xl bg-muted/50 border-muted-foreground/10 focus-visible:ring-primary shadow-inner font-bold"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button onClick={() => {
                                    if (user) {
                                        db.updateUser(user.id, { name: profile.name, email: profile.email });
                                        toast.success("Security profile updated across all cluster nodes");
                                    }
                                }} className="bg-primary rounded-2xl h-12 px-10 shadow-lg shadow-primary/20 gap-2 hover:scale-105 transition-transform font-bold">
                                    <Save className="h-4 w-4" /> Save Identification
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-card overflow-hidden">
                        <CardHeader className="p-6 border-b bg-muted/5">
                            <CardTitle className="text-xl font-bold flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                                    <Lock className="h-5 w-5" />
                                </div>
                                Credential Authorization
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                <div className="md:col-span-4 space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Existing Key</Label>
                                    <div className="relative">
                                        <Input type="password" value="********" disabled className="h-12 rounded-2xl bg-muted/10 border-muted-foreground/5 font-mono opacity-50" />
                                        <Shield className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 opacity-50" />
                                    </div>
                                </div>
                                <div className="md:col-span-8 space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">New Master Passcode</Label>
                                    <div className="flex gap-3">
                                        <Input
                                            type={showPass ? "text" : "password"}
                                            placeholder="Complexity: 12+ characters recommended"
                                            className="h-12 rounded-2xl bg-muted/50 border-muted-foreground/10 focus-visible:ring-primary shadow-inner font-bold"
                                        />
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-12 w-12 rounded-2xl border-muted-foreground/10 hover:bg-muted"
                                            onClick={() => setShowPass(!showPass)}
                                        >
                                            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-5 rounded-3xl bg-amber-500/5 border-2 border-dashed border-amber-500/20 flex gap-4">
                                <AlertCircle className="h-6 w-6 text-amber-500 shrink-0 mt-1" />
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-amber-900/80">Security Protocol Warning</p>
                                    <p className="text-[11px] text-amber-900/60 font-medium italic leading-relaxed">
                                        Rotating credentials will trigger an immediate platform-wide logout across all instances. Administrative re-authentication will be required via the new passcode.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Platform Prefs */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="border-none shadow-xl bg-card overflow-hidden">
                        <CardHeader className="p-6 border-b bg-muted/5">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Operational Preferences</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 py-6 space-y-4">
                            {[
                                { label: "Performance Alerts", icon: Bell, color: "text-blue-500", desc: "Critical node alerts" },
                                { label: "Audit Log Streaming", icon: Radio, color: "text-emerald-500", desc: "Real-time activity feed" },
                                { label: "Support Dispatch", icon: Mail, color: "text-primary", desc: "User inquiry notifications" },
                            ].map((p, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-3xl hover:bg-muted/50 transition-all cursor-pointer group border border-transparent hover:border-muted-foreground/5">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("h-10 w-10 rounded-2xl bg-background flex items-center justify-center border shadow-sm group-hover:scale-110 transition-transform", p.color)}>
                                            <p.icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <span className="text-[13px] font-black text-foreground block">{p.label}</span>
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">{p.desc}</span>
                                        </div>
                                    </div>
                                    <div className="h-6 w-11 bg-primary rounded-full relative shadow-[inner_0_2px_4px_rgba(0,0,0,0.2)]">
                                        <div className="absolute right-1.5 top-1.5 h-3 w-3 bg-white rounded-full shadow-sm" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-rose-500/5 border border-rose-500/10 overflow-hidden group hover:bg-rose-500/10 transition-colors">
                        <CardHeader className="p-6 border-b border-rose-500/10 text-rose-600">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 flex items-center gap-2">
                                <Shield className="h-3 w-3" /> Decommission Zone
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 text-center space-y-6">
                            <div className="h-16 w-16 rounded-full bg-rose-500/10 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform border border-rose-500/20">
                                <Trash2 className="h-8 w-8 text-rose-600" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-bold text-rose-900/80">Hazardous Action Required</p>
                                <p className="text-[11px] text-rose-900/50 font-medium italic leading-relaxed">
                                    Halting your account will permanently disconnect your administrative node from the platform mainframe.
                                </p>
                            </div>
                            <Button variant="ghost" className="w-full text-rose-600 hover:bg-rose-600 hover:text-white rounded-2xl h-12 font-black uppercase text-[10px] gap-2 transition-all border border-rose-500/10">
                                <Trash2 className="h-4 w-4" /> Halt Admin Identity
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
