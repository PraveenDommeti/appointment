import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { CalendarEvent, db } from "@/lib/db";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Calendar as CalendarIcon, Clock, Plus, Trash2, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const StudentCalendar = () => {
    const { user } = useAuth();
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isAddOpen, setIsAddOpen] = useState(false);

    // New Event Form State
    const [newEventTitle, setNewEventTitle] = useState("");
    const [newEventDesc, setNewEventDesc] = useState("");

    useEffect(() => {
        if (user) {
            // Get personal events
            const personalEvents = db.getCalendarEvents(user.id);

            // Get all approved appointments for this user
            const myAppts = db.getAppointments(user.id).filter(a => a.status === 'Approved');

            // Convert appts to calendar events format
            const classEvents: CalendarEvent[] = myAppts
                .filter(a => a.date && a.time)
                .map(a => {
                    try {
                        const dateString = `${a.date}T${a.time}`;
                        const d = new Date(dateString);

                        // Check if date is valid
                        if (isNaN(d.getTime())) {
                            console.warn(`Invalid date format for appointment ${a.id}: ${dateString}`);
                            return null;
                        }

                        return {
                            id: a.id,
                            userId: a.userId,
                            title: `Class: ${a.topic}`,
                            date: d.toISOString(),
                            type: "Class",
                            description: "Instructor led session",
                            meetingLink: a.meetingLink
                        } as CalendarEvent;
                    } catch (e) {
                        return null;
                    }
                })
                .filter((e): e is CalendarEvent => e !== null);

            setEvents([...personalEvents, ...classEvents]);
        }
    }, [user, date]);

    const selectedDateEvents = events.filter((event) => {
        if (!date) return false;
        const eventDate = new Date(event.date);
        return (
            eventDate.getDate() === date.getDate() &&
            eventDate.getMonth() === date.getMonth() &&
            eventDate.getFullYear() === date.getFullYear()
        );
    });

    const handleAddEvent = () => {
        if (!user || !date || !newEventTitle) return;

        const newEvent: CalendarEvent = {
            id: Date.now().toString(),
            userId: user.id,
            title: newEventTitle,
            date: date.toISOString(),
            type: "Personal",
            description: newEventDesc,
        };

        db.addCalendarEvent(newEvent);
        setEvents([...events, newEvent]);

        setNewEventTitle("");
        setNewEventDesc("");
        setIsAddOpen(false);
        toast.success("Event added to calendar");
    };

    return (
        <div className="space-y-8 container mx-auto max-w-6xl pb-10">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card border border-border/50 p-8 rounded-3xl"
            >
                <div className="space-y-1">
                    <h1 className="font-display text-4xl font-black tracking-tight text-foreground">
                        My <span className="text-primary italic">Schedule</span>
                    </h1>
                    <p className="text-muted-foreground font-medium italic opacity-80 italic">Professional calendar management and session tracking.</p>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-primary shadow-lg shadow-primary/20 rounded-xl px-6 h-12 font-black uppercase text-[10px] tracking-widest">
                            <Plus className="h-4 w-4" /> Add Personal Entry
                        </Button>
                    </DialogTrigger>
                    {/* Dialog Content same as before */}
                    <DialogContent className="rounded-3xl border-none shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black">Plan Achievement</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Target Date</Label>
                                <Input value={date ? format(date, "PPP") : ""} disabled className="rounded-xl bg-muted/50 border-none h-12" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Objective Title</Label>
                                <Input
                                    placeholder="e.g., Grammar Review"
                                    value={newEventTitle}
                                    onChange={(e) => setNewEventTitle(e.target.value)}
                                    className="rounded-xl bg-card border-border h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Session Parameters (Optional)</Label>
                                <Textarea
                                    placeholder="Define goals for this slot..."
                                    value={newEventDesc}
                                    onChange={(e) => setNewEventDesc(e.target.value)}
                                    className="rounded-xl bg-card border-border min-h-[100px] p-4"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddEvent} className="bg-primary rounded-xl px-8 font-black uppercase text-[10px]">Record Entry</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Calendar Widget */}
                <div className="lg:col-span-4">
                    <Card className="border-none shadow-sm bg-card rounded-[2rem] overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b p-6">
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-primary" /> Select Date
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-xl border border-border/50 shadow-inner p-4 bg-background"
                                modifiers={{
                                    booked: (d) => events.some(e => {
                                        const evtDate = new Date(e.date);
                                        return evtDate.getDate() === d.getDate() &&
                                            evtDate.getMonth() === d.getMonth() &&
                                            evtDate.getFullYear() === d.getFullYear();
                                    })
                                }}
                                modifiersStyles={{
                                    booked: { fontWeight: 'black', backgroundColor: 'rgba(var(--primary), 0.1)', color: 'var(--primary)', borderRadius: '12px' }
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Events List */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-black tracking-tight">
                            Agenda for <span className="text-primary italic">{date ? format(date, "MMMM do") : "Select a date"}</span>
                        </h2>
                        <Badge variant="outline" className="rounded-full px-4 border-muted-foreground/20 font-bold">
                            {selectedDateEvents.length} Entries
                        </Badge>
                    </div>

                    <AnimatePresence mode="popLayout">
                        {selectedDateEvents.length > 0 ? (
                            selectedDateEvents.map((event, index) => (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                >
                                    <Card className={`group border-none shadow-md hover:shadow-xl transition-all duration-300 rounded-3xl bg-card overflow-hidden ${event.type === 'Class' ? 'bg-gradient-to-r from-background to-primary/5' : ''}`}>
                                        <CardContent className="p-8 flex items-center justify-between gap-6">
                                            <div className="flex items-center gap-6">
                                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner ${event.type === 'Class' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                                    {event.type === 'Class' ? <Video className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="font-black text-xl group-hover:text-primary transition-colors">{event.title}</h3>
                                                        <Badge variant="secondary" className="rounded-lg text-[8px] font-black uppercase tracking-widest px-2 py-0.5">
                                                            {event.type}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground font-medium">{event.description}</p>

                                                    {event.type === 'Class' && (
                                                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-muted-foreground/5">
                                                            <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                                                                <Clock className="h-3.5 w-3.5" /> {format(new Date(event.date), "p")}
                                                            </div>
                                                            {event.meetingLink && (
                                                                <Button variant="link" className="h-auto p-0 text-xs font-black uppercase tracking-widest text-emerald-500" asChild>
                                                                    <a href={event.meetingLink} target="_blank" rel="noreferrer">Join Broadcast <ArrowUpRight className="h-3 w-3 ml-1" /></a>
                                                                </Button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {event.type === 'Personal' && (
                                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-rose-500 rounded-xl" onClick={() => {
                                                    db.deleteCalendarEvent(event.id);
                                                    setEvents(events.filter(e => e.id !== event.id));
                                                    toast.success("Entry removed");
                                                }}>
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-20 bg-muted/10 border-2 border-dashed rounded-[3rem] text-muted-foreground"
                            >
                                <CalendarIcon className="h-16 w-16 mx-auto mb-4 opacity-10" />
                                <h3 className="text-xl font-bold text-foreground">Open Slot Identified</h3>
                                <p className="text-sm mt-2 max-w-xs mx-auto italic font-medium">No sessions or personal tasks scheduled for this chronological anchor.</p>
                                <Button variant="link" onClick={() => setIsAddOpen(true)} className="mt-4 text-primary font-bold">
                                    Initialize Task Entry
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default StudentCalendar;
