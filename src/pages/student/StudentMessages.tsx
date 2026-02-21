import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";
import { db, Message, User as UserInfo } from "@/lib/db";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CheckCheck, Image as ImageIcon, MessageSquare, MoreHorizontal, Paperclip, Plus, Search, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const StudentMessages = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [contacts, setContacts] = useState<UserInfo[]>([]);
    const [selectedContact, setSelectedContact] = useState<UserInfo | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const load = async () => {
            const allUsers = db.getUsers();
            // Students can message Admins and Trainers
            setContacts(allUsers.filter(u => u.role === "admin" || u.role === "trainer"));

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

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container mx-auto max-w-7xl h-[calc(100vh-180px)] mt-8 flex gap-6 overflow-hidden">
            {/* Sidebar / Contacts */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-80 flex flex-col gap-4 shrink-0"
            >
                <div className="bg-card p-6 rounded-[2rem] shadow-soft border">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black italic">Messages</h2>
                        <Button variant="ghost" size="icon" className="rounded-full bg-muted/50 h-10 w-10">
                            <Plus className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                        <Input
                            placeholder="Rechercher..."
                            className="pl-10 h-11 rounded-xl bg-muted/30 border-none shadow-inner text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <ScrollArea className="h-[calc(100vh-400px)] -mx-2 px-2">
                        <div className="space-y-2">
                            {filteredContacts.map((contact) => (
                                <button
                                    key={contact.id}
                                    onClick={() => setSelectedContact(contact)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-300",
                                        selectedContact?.id === contact.id
                                            ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                                            : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Avatar className="h-10 w-10 border-2 border-white/20">
                                        <AvatarFallback className="font-bold text-xs bg-muted/20">{contact.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 text-left">
                                        <p className="font-bold text-sm truncate">{contact.name}</p>
                                        <p className={cn("text-[10px] font-bold uppercase tracking-widest opacity-60", selectedContact?.id === contact.id ? "text-white" : "text-primary")}>
                                            {contact.role}
                                        </p>
                                    </div>
                                    <div className="h-2 w-2 rounded-full bg-secondary shadow-glow" />
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
                className="flex-1 flex flex-col bg-card rounded-[2.5rem] shadow-soft border overflow-hidden relative"
            >
                {selectedContact ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-6 border-b bg-muted/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12 border-2 border-primary/10">
                                    <AvatarFallback className="font-black bg-primary/5 text-primary">{selectedContact.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-black text-lg">{selectedContact.name}</h3>
                                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter bg-emerald-500/5 text-emerald-600 border-none px-2">Active now</Badge>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="rounded-xl"><Search className="h-5 w-5 opacity-40" /></Button>
                                <Button variant="ghost" size="icon" className="rounded-xl"><MoreHorizontal className="h-5 w-5 opacity-40" /></Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-8">
                            <div className="space-y-6">
                                {messages.map((msg, idx) => {
                                    const isMe = msg.senderId === user?.id;
                                    return (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={cn("flex", isMe ? "justify-end" : "justify-start")}
                                        >
                                            <div className={cn(
                                                "max-w-[70%] space-y-1",
                                                isMe ? "items-end" : "items-start"
                                            )}>
                                                <div className={cn(
                                                    "p-4 rounded-[1.5rem] shadow-sm text-sm font-medium",
                                                    isMe
                                                        ? "bg-primary text-white rounded-tr-none"
                                                        : "bg-muted text-foreground rounded-tl-none"
                                                )}>
                                                    {msg.text}
                                                </div>
                                                <div className="flex items-center gap-2 px-2">
                                                    <span className="text-[9px] font-black uppercase tracking-tighter opacity-40">
                                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {isMe && <CheckCheck className="h-3 w-3 text-primary" />}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-6 border-t bg-muted/5">
                            <form onSubmit={handleSendMessage} className="flex gap-4 items-center">
                                <div className="flex gap-1">
                                    <Button type="button" variant="ghost" size="icon" className="rounded-xl hover:bg-primary/5 text-primary opacity-60"><ImageIcon className="h-5 w-5" /></Button>
                                    <Button type="button" variant="ghost" size="icon" className="rounded-xl hover:bg-primary/5 text-primary opacity-60"><Paperclip className="h-5 w-5" /></Button>
                                </div>
                                <div className="flex-1 relative">
                                    <Input
                                        placeholder="Taper un message..."
                                        className="h-14 rounded-2xl bg-white border-none shadow-inner px-6 pr-20 font-medium"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        <Button
                                            type="submit"
                                            className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                                        >
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-20 opacity-20">
                        <div className="h-24 w-24 rounded-[2.5rem] bg-muted flex items-center justify-center mb-8 shadow-inner">
                            <MessageSquare className="h-12 w-12" />
                        </div>
                        <h3 className="text-3xl font-black italic">Select a contact</h3>
                        <p className="text-sm font-bold mt-4 uppercase tracking-[0.2em]">Bridge established. Waiting for node selection.</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default StudentMessages;
