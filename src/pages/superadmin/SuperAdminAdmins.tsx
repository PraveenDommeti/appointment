import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Users, Search, Shield, Trash2,
    UserPlus, Mail, ShieldCheck,
    ChevronRight, Zap
} from "lucide-react";
import { db, User as UserInfo } from "@/lib/db";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { CreateUserDialog } from "@/components/CreateUserDialog";
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";

const SuperAdminAdmins = () => {
    const { user } = useAuth();
    const [admins, setAdmins] = useState<UserInfo[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const refreshData = () => {
        setAdmins(db.getUsers().filter(u => u.role === 'admin' || u.role === 'superadmin'));
    };

    useEffect(() => {
        if (user) {
            refreshData();
        }
    }, [user]);

    // Real-time updates
    useRealTimeUpdates(refreshData, 3000);

    const handleDelete = (id: string) => {
        if (id === user?.id) {
            toast.error("Cannot decommission your own administrative node.");
            return;
        }
        db.deleteUser(id);
        toast.success("Admin node purged");
        refreshData();
    };

    const toggleStatus = (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        db.updateUser(id, { status: newStatus as any });
        refreshData();
    };

    const filteredAdmins = admins.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 container mx-auto max-w-7xl pb-10">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-12 bg-muted/20 p-8 rounded-3xl border border-dashed"
            >
                <div>
                    <h1 className="font-display text-4xl font-bold tracking-tight text-foreground italic flex items-center gap-3">
                        Admin <span className="text-primary">Nodes</span> <Shield className="h-8 w-8" />
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">
                        Management and oversight of clinical administrative identities.
                    </p>
                </div>

                <div className="flex gap-3">
                    <CreateUserDialog
                        allowedRoles={["admin"]}
                        triggerText="Deploy New Admin"
                    />
                </div>
            </motion.div>

            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="p-6 border-b bg-muted/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Find admin by name or email..."
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
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Administrator</TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Identity Level</TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Status</TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="popLayout">
                                {filteredAdmins.map((a, idx) => (
                                    <motion.tr
                                        key={a.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group hover:bg-muted/30 transition-colors border-b last:border-0"
                                    >
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-2xl bg-muted border flex items-center justify-center font-black text-sm text-primary shadow-inner">
                                                    {a.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground">{a.name}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-black opacity-70 italic">{a.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <Badge variant="outline" className={cn("rounded-lg border-none px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter", a.role === 'superadmin' ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500")}>
                                                {a.role === 'superadmin' ? "Super Admin" : "Platform Admin"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <button onClick={() => toggleStatus(a.id, a.status)}>
                                                <Badge className={cn("rounded-lg border-none px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter cursor-pointer", a.status === 'Active' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500")}>
                                                    {a.status}
                                                </Badge>
                                            </button>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 transition-colors" onClick={() => handleDelete(a.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
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

export default SuperAdminAdmins;
