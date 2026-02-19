import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Users, Search, Filter,
    Plus, MoreVertical, Trash2,
    Shield, User, BookOpen,
    Mail, Calendar as CalendarIcon,
    ChevronRight, CheckCircle2,
    XCircle, AlertCircle
} from "lucide-react";
import { db, User as UserInfo } from "@/lib/db";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { CreateUserDialog } from "@/components/CreateUserDialog";

const SuperAdminUsers = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    const refreshData = () => {
        setUsers(db.getUsers());
    };

    useEffect(() => {
        if (user) {
            refreshData();
        }
    }, [user]);

    const handleDelete = (id: string) => {
        if (id === user?.id) {
            toast.error("Cannot decommission your own administrative node.");
            return;
        }
        db.deleteUser(id);
        toast.success("Identity purged from registry");
        refreshData();
    };

    const toggleStatus = (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        db.updateUser(id, { status: newStatus as any });
        toast.success(`Identity status set to ${newStatus}`);
        refreshData();
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "all" || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'superadmin': return Shield;
            case 'admin': return Shield;
            case 'trainer': return BookOpen;
            default: return User;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'superadmin': return "text-purple-500 bg-purple-500/10 border-purple-500/20";
            case 'admin': return "text-blue-500 bg-blue-500/10 border-blue-500/20";
            case 'trainer': return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
            default: return "text-amber-500 bg-amber-500/10 border-amber-500/20";
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
                        Master <span className="text-primary">Registry</span> <Users className="h-8 w-8" />
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">
                        Comprehensive oversight of all platform identities and role distributions.
                    </p>
                </div>

                <div className="flex gap-2">
                    <CreateUserDialog
                        allowedRoles={["student", "trainer", "admin", "superadmin"]}
                        triggerText="Deploy New Identity"
                        triggerVariant="default"
                    />
                    <Badge variant="outline" className="h-10 px-4 rounded-xl border-primary/20 text-primary font-black uppercase text-[10px] bg-primary/5 flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5" /> High Authority Access
                    </Badge>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Total Identities", value: users.length.toString(), icon: Users, color: "text-primary" },
                    { label: "Admins", value: users.filter(u => u.role === 'admin').length.toString(), icon: Shield, color: "text-blue-500" },
                    { label: "Trainers", value: users.filter(u => u.role === 'trainer').length.toString(), icon: BookOpen, color: "text-emerald-500" },
                    { label: "Students", value: users.filter(u => u.role === 'student').length.toString(), icon: User, color: "text-amber-500" }
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

            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="p-6 border-b bg-muted/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Filter by identity or email..."
                                className="pl-10 h-10 border-muted-foreground/20 rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            {['all', 'admin', 'trainer', 'student'].map((r) => (
                                <Button
                                    key={r}
                                    variant={roleFilter === r ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setRoleFilter(r)}
                                    className="rounded-xl h-10 px-4 font-bold uppercase text-[10px] tracking-widest"
                                >
                                    {r}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-b bg-muted/5">
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Identity</TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Role</TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Status</TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Joined</TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="popLayout">
                                {filteredUsers.map((u, idx) => {
                                    const Icon = getRoleIcon(u.role);
                                    return (
                                        <motion.tr
                                            key={u.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group hover:bg-muted/30 transition-colors border-b last:border-0"
                                        >
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-2xl bg-muted border flex items-center justify-center font-black text-sm text-primary shadow-inner">
                                                        {u.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-foreground">{u.name}</p>
                                                        <p className="text-[10px] text-muted-foreground uppercase font-black opacity-70 italic">{u.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <Badge variant="outline" className={cn("rounded-lg border-none px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 w-fit", getRoleColor(u.role))}>
                                                    <Icon className="h-3 w-3" /> {u.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <button onClick={() => toggleStatus(u.id, u.status)}>
                                                    <Badge className={cn("rounded-lg border-none px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter cursor-pointer", u.status === 'Active' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500")}>
                                                        {u.status}
                                                    </Badge>
                                                </button>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <span className="text-xs font-bold text-muted-foreground">{u.joinedDate}</span>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 transition-colors" onClick={() => handleDelete(u.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default SuperAdminUsers;
