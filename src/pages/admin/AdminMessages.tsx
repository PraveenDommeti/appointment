import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { db, Message, User as UserInfo } from "@/lib/db";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CheckCheck, MessageSquare, MoreHorizontal, Radio, Search, Send, Shield, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const AdminMessages = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [contacts, setContacts] = useState<UserInfo[]>([]);
    const [selectedContact, setSelectedContact] = useState<UserInfo | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showBroadcast, setShowBroadcast] = useState(false);
    const [broadcastMessage, setBroadcastMessage] = useState("");
    const [broadcastFilter, setBroadcastFilter] = useState("all");

    useEffect(() => {
        const load = async () => {
            const allUsers = db.getUsers();
            // Admins can message everyone
            setContacts(allUsers.filter(u => u.id !== user?.id));

            if (user && selectedContact) {
                const thread = await db.getMessages(user.id, selectedContact.id);
                setMessages(thread);
            }
        };

        load();
        const interval = setInterval(load, 2000);
        return () => clearInterval(interval);
    }, [user, selectedContact]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedContact || !newMessage.trim()) return;

        const msg: Message = {
            id: `msg-${Date.now()}`,
            senderId: user.id,
            receiverId: selectedContact.id,
            text: newMessage,
            timestamp: new Date().toISOString(),
            status: 'sent'
        };

        setNewMessage("");
        setMessages([...messages, msg]);
        await db.sendMessage(msg);
    };

    const handleBroadcast = async () => {
        if (!user || !broadcastMessage.trim()) return;

        let recipients = contacts;
        if (broadcastFilter !== "all") {
            recipients = contacts.filter(c => c.role === broadcastFilter);
        }

        for (const recipient of recipients) {
            const msg: Message = {
                id: `msg-${Date.now()}-${recipient.id}`,
                senderId: user.id,
                receiverId: recipient.id,
                text: `[BROADCAST] ${broadcastMessage}`,
                timestamp: new Date().toISOString(),
                status: 'sent'
            };
            await db.sendMessage(msg);

            // Also create notification
            db.createNotification({
                userId: recipient.id,
                title: "📢 Admin Broadcast",
                message: broadcastMessage,
                type: "info",
                category: "message"
            });
        }

        toast.success(`Broadcast sent to ${recipients.length} users`);
        setBroadcastMessage("");
        setShowBroadcast(false);
    };

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container mx-auto max-w-7xl h-[calc(100vh-140px)] flex flex-col gap-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-4 shrink-0">
                <div>
                    <h1 className="font-display text-4xl font-black tracking-tighter text-foreground italic flex items-center gap-3">
                        Secure <span className="text-primary not-italic">Comms</span> <MessageSquare className="h-8 w-8 text-primary/80" />
                    </h1>
                    <p className="text-muted-foreground text-sm font-bold opacity-60 mt-1 uppercase tracking-widest italic">
                        Encrypted Node-to-Node Communication Relay
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={() => setShowBroadcast(true)}
                        className="h-12 px-6 rounded-2xl bg-white border border-primary/20 text-primary font-black uppercase tracking-widest text-[10px] hover:bg-primary/5 transition-all shadow-lg"
                    >
                        <Radio className="h-4 w-4 mr-2" /> Global Broadcast
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden pb-6">
                {/* Sidebar / Contacts */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-80 flex flex-col gap-4 shrink-0"
                >
                    <div className="bg-white/50 backdrop-blur-sm p-4 rounded-[2.5rem] shadow-xl border border-white/40 h-full flex flex-col">
                        <div className="relative mb-4">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                            <Input
                                placeholder="Locate node..."
                                className="pl-11 h-12 rounded-xl bg-white border-none shadow-sm text-sm font-bold"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <ScrollArea className="flex-1 -mx-2 px-2">
                            <div className="space-y-2">
                                {filteredContacts.map((contact) => (
                                    <button
                                        key={contact.id}
                                        onClick={() => setSelectedContact(contact)}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 border border-transparent",
                                            selectedContact?.id === contact.id
                                                ? "bg-primary text-white shadow-xl shadow-primary/20 border-primary/20 scale-[1.02]"
                                                : "hover:bg-white/80 hover:scale-[1.01] text-foreground bg-transparent"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-10 w-10 rounded-xl flex items-center justify-center font-black text-xs shadow-inner",
                                            selectedContact?.id === contact.id ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                                        )}>
                                            {contact.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 text-left overflow-hidden">
                                            <p className="font-bold text-sm truncate">{contact.name}</p>
                                            <p className={cn("text-[8px] font-black uppercase tracking-widest opacity-60 truncate", selectedContact?.id === contact.id ? "text-white/80" : "text-muted-foreground")}>
                                                {contact.role} Node
                                            </p>
                                        </div>
                                        <div className={cn("h-2 w-2 rounded-full animate-pulse",
                                            contact.status === 'Active' ? 'bg-emerald-400' : 'bg-amber-400'
                                        )} />
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </motion.div>

                {/* Chat Area */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 flex flex-col bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden relative"
                >
                    {selectedContact ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-6 border-b bg-white/50 flex items-center justify-between backdrop-blur-sm z-10">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-lg shadow-lg shadow-primary/20">
                                        {selectedContact.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xl tracking-tight leading-none text-foreground">{selectedContact.name}</h3>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-primary/5 text-primary border-primary/10 px-2 py-0.5 rounded-md">
                                                {selectedContact.role} Access
                                            </Badge>
                                            <span className="text-[9px] font-bold text-emerald-500 flex gap-1 items-center uppercase tracking-wider">
                                                <Zap className="h-3 w-3 fill-emerald-500" /> Online
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 hover:bg-muted/50">
                                    <MoreHorizontal className="h-5 w-5 opacity-40" />
                                </Button>
                            </div>

                            {/* Messages */}
                            <ScrollArea className="flex-1 p-8 bg-muted/5">
                                <div className="space-y-6 max-w-4xl mx-auto">
                                    {messages.map((msg) => {
                                        const isMe = msg.senderId === user?.id;
                                        return (
                                            <motion.div
                                                key={msg.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={cn("flex", isMe ? "justify-end" : "justify-start")}
                                            >
                                                <div className={cn(
                                                    "max-w-[80%] space-y-1",
                                                    isMe ? "items-end" : "items-start"
                                                )}>
                                                    <div className={cn(
                                                        "p-4 px-6 rounded-3xl text-sm font-semibold leading-relaxed shadow-sm",
                                                        isMe
                                                            ? "bg-primary text-white rounded-br-none shadow-primary/20"
                                                            : "bg-white text-foreground rounded-bl-none shadow-black/5"
                                                    )}>
                                                        {msg.text}
                                                    </div>
                                                    <div className={cn("flex items-center gap-1.5 px-2", isMe ? "flex-row-reverse" : "flex-row")}>
                                                        {isMe ? <CheckCheck className="h-3 w-3 text-primary opacity-60" /> : null}
                                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-30">
                                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                    <div ref={scrollRef} />
                                </div>
                            </ScrollArea>

                            {/* Input Area */}
                            <div className="p-6 bg-white border-t border-black/5">
                                <form onSubmit={handleSendMessage} className="flex gap-3 items-center max-w-4xl mx-auto">
                                    <div className="flex-1 relative flex items-center gap-3 bg-muted/20 p-2 pl-6 rounded-[2rem] border border-black/5 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                                        <Input
                                            placeholder="Encrypt and transmit..."
                                            className="h-10 p-0 border-none bg-transparent shadow-none focus-visible:ring-0 font-medium text-base placeholder:text-muted-foreground/40 w-full"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                        />
                                        <Button
                                            type="submit"
                                            disabled={!newMessage.trim()}
                                            className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 shrink-0 p-0 flex items-center justify-center"
                                        >
                                            <Send className="h-4 w-4 ml-0.5" />
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-20 bg-muted/5 opacity-50">
                            <div className="h-24 w-24 rounded-full bg-white shadow-xl flex items-center justify-center mb-6">
                                <Shield className="h-10 w-10 text-primary opacity-20" />
                            </div>
                            <h3 className="text-2xl font-black italic text-foreground uppercase tracking-tighter">Awaiting Target</h3>
                            <p className="text-xs font-bold mt-2 uppercase tracking-[0.2em] opacity-40">Select a secure node to begin transmission.</p>
                        </div>
                    )}
                </motion.div>

                {/* Broadcast Dialog */}
                <Dialog open={showBroadcast} onOpenChange={setShowBroadcast}>
                    <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none shadow-2xl bg-white/95 backdrop-blur-xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black italic flex items-center gap-2">
                                <Radio className="h-6 w-6 text-primary" /> System Broadcast
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 pt-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-2">Target Sector</Label>
                                <Select value={broadcastFilter} onValueChange={setBroadcastFilter}>
                                    <SelectTrigger className="rounded-2xl h-12 border-none bg-muted/20 font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-xl">
                                        <SelectItem value="all">Global (All Users)</SelectItem>
                                        <SelectItem value="student">Student Nodes</SelectItem>
                                        <SelectItem value="trainer">Trainer Nodes</SelectItem>
                                        <SelectItem value="admin">Admin Nodes</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-2">Transmission Data</Label>
                                <Textarea
                                    placeholder="Enter broadcast content..."
                                    className="rounded-2xl min-h-[120px] border-none bg-muted/20 resize-none font-medium focus:ring-2 ring-primary/10"
                                    value={broadcastMessage}
                                    onChange={(e) => setBroadcastMessage(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter className="pt-2">
                            <Button
                                onClick={handleBroadcast}
                                className="w-full rounded-2xl h-14 font-black uppercase text-xs tracking-widest bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
                                disabled={!broadcastMessage.trim()}
                            >
                                Initiate Broadcast <Send className="h-3 w-3 ml-2" />
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default AdminMessages;
