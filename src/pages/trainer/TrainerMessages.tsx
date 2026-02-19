import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";
import { db, Message, User as UserInfo } from "@/lib/db";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { CheckCheck, Image as ImageIcon, MessageSquare, MoreHorizontal, Plus, Search, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const TrainerMessages = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [contacts, setContacts] = useState<UserInfo[]>([]);
    const [contactMeta, setContactMeta] = useState<Record<string, { unread: number, lastMsg: Message | null }>>({});
    const [selectedContact, setSelectedContact] = useState<UserInfo | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial Load & Polling
    useEffect(() => {
        const load = async () => {
            if (!user) return;
            const allUsers = db.getUsers();

            // Trainers can message everyone except themselves
            const potentialContacts = allUsers.filter(u => u.id !== user.id);
            setContacts(potentialContacts);

            // Fetch metadata for all contacts
            const meta: Record<string, { unread: number, lastMsg: Message | null }> = {};

            for (const contact of potentialContacts) {
                const thread = await db.getMessages(user.id, contact.id);
                const unreadCount = thread.filter(m => m.receiverId === user.id && m.status !== 'read').length;
                const lastMsg = thread.length > 0 ? thread[thread.length - 1] : null;
                meta[contact.id] = { unread: unreadCount, lastMsg };
            }
            setContactMeta(meta);

            // If a contact is selected, keep their thread updated
            if (selectedContact) {
                const thread = await db.getMessages(user.id, selectedContact.id);
                setMessages(thread);

                // Mark as read logic would ideally go here or in a separate effect
            }
        };

        load();
        const interval = setInterval(load, 2000); // Poll every 2s
        return () => clearInterval(interval);
    }, [user, selectedContact]);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Mark messages as read when selecting contact
    useEffect(() => {
        if (user && selectedContact) {
            db.markMessagesAsRead(user.id, selectedContact.id);

            // Optimistically clear unread badge
            setContactMeta(prev => ({
                ...prev,
                [selectedContact.id]: {
                    ...(prev[selectedContact.id] || { lastMsg: null }), // Ensure object exists
                    unread: 0
                }
            }));
        }
    }, [selectedContact, user]);

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

        await db.sendMessage(msg);
        setNewMessage("");
        setMessages(prev => [...prev, msg]);

        // Optimistically update metadata
        setContactMeta(prev => ({
            ...prev,
            [selectedContact.id]: {
                ...prev[selectedContact.id],
                lastMsg: msg
            }
        }));
    };

    const sortedContacts = [...contacts].sort((a, b) => {
        const metaA = contactMeta[a.id];
        const metaB = contactMeta[b.id];
        const timeA = metaA?.lastMsg ? new Date(metaA.lastMsg.timestamp).getTime() : 0;
        const timeB = metaB?.lastMsg ? new Date(metaB.lastMsg.timestamp).getTime() : 0;
        return timeB - timeA; // Most recent first
    });

    const filteredContacts = sortedContacts.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container mx-auto max-w-7xl h-[calc(100vh-180px)] mt-8 flex gap-6 overflow-hidden">
            {/* Sidebar / Contacts */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-96 flex flex-col gap-4 shrink-0"
            >
                <div className="bg-card h-full flex flex-col p-6 rounded-[2rem] shadow-soft border">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black italic">Formateur <span className="text-primary tracking-tighter">Inbox</span></h2>
                        <Button variant="ghost" size="icon" className="rounded-full bg-muted/50 h-10 w-10 hover:bg-primary/10 hover:text-primary transition-colors">
                            <Plus className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                        <Input
                            placeholder="Rechercher des contacts..."
                            className="pl-11 h-12 rounded-2xl bg-muted/30 border-none shadow-inner text-sm font-medium transition-all focus:bg-background focus:ring-2 ring-primary/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <ScrollArea className="flex-1 -mx-2 px-2">
                        <div className="space-y-3">
                            {filteredContacts.map((contact) => {
                                const meta = contactMeta[contact.id];
                                const isSelected = selectedContact?.id === contact.id;

                                return (
                                    <button
                                        key={contact.id}
                                        onClick={() => setSelectedContact(contact)}
                                        className={cn(
                                            "w-full flex items-center gap-4 p-4 rounded-3xl transition-all duration-300 group relative overflow-hidden",
                                            isSelected
                                                ? "bg-primary text-white shadow-lg shadow-primary/25"
                                                : "hover:bg-muted/40 text-muted-foreground hover:text-foreground bg-card border border-transparent hover:border-border/50"
                                        )}
                                    >
                                        <div className="relative">
                                            <Avatar className={cn("h-12 w-12 border-2 transition-all", isSelected ? "border-white/20" : "border-background shadow-sm")}>
                                                <AvatarFallback className={cn("font-black text-sm", isSelected ? "bg-white/10 text-white" : "bg-muted text-muted-foreground")}>
                                                    {contact.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            {meta?.unread > 0 && !isSelected && (
                                                <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-rose-500 text-white text-[10px] font-black rounded-full shadow-sm ring-2 ring-background z-10">
                                                    {meta.unread > 9 ? '9+' : meta.unread}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex-1 text-left min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <p className={cn("font-bold text-sm truncate", isSelected ? "text-white" : "text-foreground")}>{contact.name}</p>
                                                {meta?.lastMsg && (
                                                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", isSelected ? "text-white/60" : "text-muted-foreground/50")}>
                                                        {format(new Date(meta.lastMsg.timestamp), 'HH:mm')}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className={cn("text-xs truncate max-w-[140px]", isSelected ? "text-white/80 font-medium" : "text-muted-foreground font-medium")}>
                                                    {meta?.lastMsg ? (
                                                        <>
                                                            {meta.lastMsg.senderId === user?.id && <span className="italic opacity-70">You: </span>}
                                                            {meta.lastMsg.text}
                                                        </>
                                                    ) : (
                                                        <span className="italic opacity-50">No messages yet</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {isSelected && (
                                            <motion.div
                                                layoutId="activeIndicator"
                                                className="absolute right-0 top-0 bottom-0 w-1.5 bg-white/20"
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>
            </motion.div>

            {/* Chat Area */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 flex flex-col bg-card rounded-[2.5rem] shadow-soft border overflow-hidden relative"
            >
                {selectedContact ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-24 px-8 border-b bg-background/50 backdrop-blur-md flex items-center justify-between shrink-0 z-10">
                            <div className="flex items-center gap-5">
                                <div className="relative">
                                    <Avatar className="h-14 w-14 border-2 border-primary/10 shadow-sm">
                                        <AvatarFallback className="font-black text-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
                                            {selectedContact.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute bottom-0 right-0 h-4 w-4 bg-emerald-500 rounded-full ring-2 ring-background shadow-sm" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-display font-black text-xl text-foreground flex items-center gap-2">
                                        {selectedContact.name}
                                        <Badge variant="secondary" className="hidden group-hover:flex h-5 items-center px-1.5 text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10">
                                            {selectedContact.role}
                                        </Badge>
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/60 uppercase tracking-wider">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Active Now • Secured
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors"><Search className="h-5 w-5" /></Button>
                                <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors"><MoreHorizontal className="h-5 w-5" /></Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-8 bg-muted/5">
                            <div className="space-y-8 pb-4">
                                {messages.map((msg, idx) => {
                                    const isMe = msg.senderId === user?.id;
                                    const showTime = idx === 0 || new Date(msg.timestamp).getTime() - new Date(messages[idx - 1].timestamp).getTime() > 600000;

                                    return (
                                        <div key={msg.id} className="space-y-4">
                                            {showTime && (
                                                <div className="flex justify-center">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 bg-muted/50 px-3 py-1 rounded-full">
                                                        {format(new Date(msg.timestamp), "d MMM, h:mm a")}
                                                    </span>
                                                </div>
                                            )}
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}
                                            >
                                                <div className={cn(
                                                    "max-w-[65%] flex flex-col",
                                                    isMe ? "items-end" : "items-start"
                                                )}>
                                                    <div className={cn(
                                                        "p-5 text-sm font-medium shadow-sm relative group transition-all duration-200",
                                                        isMe
                                                            ? "bg-primary text-primary-foreground rounded-[2rem] rounded-tr-sm hover:brightness-110"
                                                            : "bg-white dark:bg-muted text-foreground rounded-[2rem] rounded-tl-sm border border-border/40 hover:bg-white/80"
                                                    )}>
                                                        {msg.text}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-1 px-2 opacity-60">
                                                        {isMe && <CheckCheck className="h-3 w-3 text-primary" />}
                                                        <span className="text-[9px] font-bold uppercase tracking-wider">
                                                            {format(new Date(msg.timestamp), "h:mm a")}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </div>
                                    );
                                })}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-6 bg-background border-t">
                            <form onSubmit={handleSendMessage} className="flex gap-4 items-center bg-muted/30 p-2 rounded-[2rem] border border-muted-foreground/5 shadow-inner">
                                <div className="flex gap-1 pl-2">
                                    <Button type="button" variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors h-10 w-10"><Plus className="h-5 w-5" /></Button>
                                    <Button type="button" variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors h-10 w-10"><ImageIcon className="h-5 w-5" /></Button>
                                </div>
                                <div className="flex-1 relative">
                                    <Input
                                        placeholder="Type your message..."
                                        className="h-12 bg-transparent border-none shadow-none focus-visible:ring-0 px-2 font-medium text-base"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!newMessage.trim()}
                                    className="h-12 w-12 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    <Send className="h-5 w-5 ml-0.5" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-20 bg-muted/5">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="h-32 w-32 rounded-[2.5rem] bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent flex items-center justify-center mb-8 shadow-2xl shadow-primary/10"
                        >
                            <MessageSquare className="h-14 w-14 text-primary opacity-80" />
                        </motion.div>
                        <h3 className="text-4xl font-display font-black italic text-foreground uppercase tracking-tighter">Formateur <span className="text-primary">Hub</span></h3>
                        <p className="text-xs font-bold mt-4 uppercase tracking-[0.2em] opacity-40 max-w-sm">
                            Encrypted communication channel active. Select a node to begin transmission.
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default TrainerMessages;
