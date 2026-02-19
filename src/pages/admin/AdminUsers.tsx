import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { db, User } from "@/lib/db";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
    CheckCircle2,
    Edit,
    Mail,
    MessageSquare,
    Search,
    Send,
    Shield,
    Target,
    Trash2,
    UserPlus,
    Users as UsersIcon,
    XCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

const AdminUsers = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isMessageOpen, setIsMessageOpen] = useState(false);
    const [messageText, setMessageText] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "student" as "student" | "trainer" | "admin" | "superadmin",
        password: "",
        status: "Active" as "Active" | "Inactive"
    });

    const refreshUsers = () => {
        setUsers(db.getUsers());
    };

    useEffect(() => {
        if (user) {
            refreshUsers();
            window.addEventListener('db-update', refreshUsers);
            return () => window.removeEventListener('db-update', refreshUsers);
        }
    }, [user]);

    const handleAddUser = async () => {
        if (!formData.name || !formData.email || (!isEditOpen && !formData.password)) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            if (isAddOpen) {
                // Check local cache for duplicates first
                const existingUser = db.getUsers().find(u => u.email.toLowerCase() === formData.email.trim().toLowerCase());
                if (existingUser) {
                    toast.error("Identity already registered in system.");
                    return;
                }

                const userToAdd: User = {
                    id: Date.now().toString(),
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    role: formData.role,
                    status: "Active",
                    joinedDate: new Date().toISOString().split('T')[0],
                    password: formData.password.trim() || "default123" // Send password to API
                };
                await db.addUser(userToAdd);

                // Also store locally for fallback/demo purposes if needed
                const localUsers = JSON.parse(localStorage.getItem("classbook_local_users") || "[]");
                if (!localUsers.find((u: any) => u.email === formData.email.trim())) {
                    localUsers.push({ ...userToAdd, password: formData.password.trim() });
                    localStorage.setItem("classbook_local_users", JSON.stringify(localUsers));
                }
                toast.success("Credential pair generated");
            } else if (isEditOpen && selectedUser) {
                // Update existing user
                const updateData: any = {
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    role: formData.role,
                    status: formData.status as any
                };

                // Only update password if provided
                if (formData.password && formData.password.trim().length > 0) {
                    updateData.password = formData.password.trim();
                }

                await db.updateUser(selectedUser.id, updateData);
                toast.success("Identity updated");
            }
        } catch (e) {
            toast.error("Failed to save user");
        }

        refreshUsers();
        setIsAddOpen(false);
        setIsEditOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({ name: "", email: "", role: "student", password: "", status: "Active" });
        setSelectedUser(null);
    };

    const handleSendMessage = async () => {
        if (!selectedUser || !messageText.trim()) return;

        const msg: any = {
            id: Date.now().toString(),
            senderId: user?.id || "admin",
            receiverId: selectedUser.id,
            text: messageText,
            timestamp: new Date().toISOString(),
            status: 'sent'
        };

        await db.sendMessage(msg);

        toast.success(`Message transmitted to ${selectedUser.name}`);
        setIsMessageOpen(false);
        setMessageText("");
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            password: "",
            status: user.status
        });
        setIsEditOpen(true);
    };

    const handleDeleteUser = async (id: string) => {
        if (confirm("Permanently purge this identity?")) {
            await db.deleteUser(id);
            refreshUsers();
            toast.success("Identity purged");
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 container mx-auto max-w-7xl pb-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    icon={UsersIcon}
                    label="Total Identities"
                    value={users.length.toString()}
                    color="text-primary"
                />
                <StatCard
                    icon={Shield}
                    label="Admin Class"
                    value={users.filter(u => u.role === 'admin').length.toString()}
                    color="text-amber-500"
                />
                <StatCard
                    icon={Target}
                    label="Active Subjects"
                    value={users.filter(u => u.status === 'Active').length.toString()}
                    color="text-emerald-500"
                />
                <StatCard
                    icon={Mail}
                    label="Verified Gateways"
                    value={users.length.toString()}
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
                        User <span className="text-primary">Intelligence</span> <Shield className="h-8 w-8" />
                    </h1>
                    <p className="text-muted-foreground font-medium">Platform identities and platform-wide access clearance.</p>
                </div>
                <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => { if (!open) { setIsAddOpen(false); setIsEditOpen(false); resetForm(); } }}>
                    <Button onClick={() => setIsAddOpen(true)} className="bg-primary shadow-lg shadow-primary/20 hover:scale-105 transition-transform gap-2">
                        <UserPlus className="h-4 w-4" /> Add Identity
                    </Button>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader><DialogTitle className="text-2xl font-bold">{isEditOpen ? "Update Identity" : "Generate Local ID"}</DialogTitle></DialogHeader>
                        <div className="space-y-5 py-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Full Name</Label>
                                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-11 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Email Protocol</Label>
                                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="h-11 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                    {isEditOpen ? "New Key (Optional)" : "Initial Key"}
                                </Label>
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder={isEditOpen ? "Leave blank to keep current" : "Create access key"}
                                    className="h-11 rounded-xl"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">System Role</Label>
                                    <Select value={formData.role} onValueChange={(val: any) => setFormData({ ...formData, role: val })}>
                                        <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                                        <SelectContent><SelectItem value="student">Student</SelectItem><SelectItem value="trainer">Trainer</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent>
                                    </Select>
                                </div>
                                {isEditOpen && (
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</Label>
                                        <Select value={formData.status} onValueChange={(val: any) => setFormData({ ...formData, status: val })}>
                                            <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                                            <SelectContent><SelectItem value="Active">Operational</SelectItem><SelectItem value="Inactive">Halted</SelectItem></SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }} className="rounded-xl">Cancel</Button>
                            <Button onClick={handleAddUser} className="bg-primary rounded-xl px-8 shadow-lg shadow-primary/20">Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </motion.div >
            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="p-6 border-b bg-muted/5 flex flex-row items-center justify-between gap-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search identity..." className="pl-10 h-10 border-muted-foreground/20 rounded-xl" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader><TableRow className="hover:bg-transparent border-b bg-muted/5">
                            <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Identity</TableHead>
                            <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Role</TableHead>
                            <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Status</TableHead>
                            <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60 text-right">Actions</TableHead>
                        </TableRow></TableHeader>
                        <TableBody><AnimatePresence mode="popLayout">
                            {filteredUsers.map((u, idx) => (
                                <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }} className="group hover:bg-muted/30 transition-colors border-b last:border-0">
                                    <TableCell className="px-6 py-4"><div className="flex items-center gap-4"><div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black shadow-inner">{u.name.charAt(0)}</div><div><p className="font-bold text-foreground">{u.name}</p><p className="text-[10px] text-muted-foreground uppercase font-black opacity-70 italic">{u.email}</p></div></div></TableCell>
                                    <TableCell className="px-6 py-4"><Badge className={cn("rounded-lg px-2.5 py-0.5 font-bold uppercase text-[10px] border-none shadow-sm", u.role === 'admin' ? "bg-amber-500/10 text-amber-600" : u.role === 'trainer' ? "bg-blue-500/10 text-blue-600" : "bg-primary/10 text-primary")}>{u.role}</Badge></TableCell>
                                    <TableCell className="px-6 py-4"><div className="flex items-center gap-2">{u.status === 'Active' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}<span className={cn("text-[10px] font-black uppercase", u.status === 'Active' ? "text-emerald-600" : "text-muted-foreground")}>{u.status}</span></div></TableCell>
                                    <TableCell className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => { setSelectedUser(u); setIsMessageOpen(true); }}>
                                                <MessageSquare className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => handleEdit(u)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDeleteUser(u.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </motion.tr>
                            ))}
                        </AnimatePresence></TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
                <DialogContent className="sm:max-w-md border-none shadow-2xl rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <Send className="h-6 w-6 text-primary" /> Direct Protocol
                        </DialogTitle>
                        <p className="text-muted-foreground text-sm font-medium italic">Communicate with {selectedUser?.name}</p>
                    </DialogHeader>
                    <div className="py-6 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Message Content</Label>
                            <Input
                                placeholder="Type your directive here..."
                                className="h-11 rounded-xl"
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsMessageOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button onClick={handleSendMessage} className="bg-primary rounded-xl px-8 shadow-lg shadow-primary/20 gap-2">
                            Transmit <Send className="h-3.5 w-3.5" />
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
};

export default AdminUsers;
