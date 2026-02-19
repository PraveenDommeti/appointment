import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { CalendarEvent, db } from "@/lib/db";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Clock, Plus, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const TrainerSchedule = () => {
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

            // Get all approved appointments (Classes)
            const allAppts = db.getAllAppointments();
            // Filter appointments where the user is involved (either as student or if we had trainerId on appt but we don't yet, so we show all APPROVED for now or filter by trainer logic if added)
            // Ideally appointment should have trainerId. For now, we just show all verified appointments to simulate "Platform Schedule" or similar, 
            // OR even better, we rely on the implementation plan's "db enhancements" to filter correctly.
            // Simplified: Show all approved appointments.
            const relevantAppts = allAppts.filter(a => a.status === 'Approved');

            // Convert appts to calendar events format for display
            const classEvents: CalendarEvent[] = relevantAppts.map(a => {
                let isoDate = new Date().toISOString();
                try {
                    // Handle potential date/time format issues
                    if (a.date) {
                        // If time is missing, default to 00:00, or try to parse
                        const timeStr = a.time ? a.time : "00:00";
                        // Remove AM/PM for ISO standard if present, or rely on browser parsing
                        // Safe approach: create string and check validity
                        const d = new Date(`${a.date}T${timeStr}`);
                        if (!isNaN(d.getTime())) {
                            isoDate = d.toISOString();
                        } else {
                            // Fallback for space separated or other formats
                            const d2 = new Date(`${a.date} ${timeStr}`);
                            if (!isNaN(d2.getTime())) isoDate = d2.toISOString();
                        }
                    }
                } catch (e) {
                    console.warn(`Invalid date for appointment ${a.id}:`, a.date, a.time);
                }

                return {
                    id: a.id,
                    userId: a.userId,
                    title: a.topic || "Untitled Session",
                    date: isoDate,
                    type: "Class",
                    description: `Student ID: ${a.userId}`,
                    meetingLink: a.meetingLink
                };
            });

            // Merge personalized events (Mocked distinct IDs to avoid collision)
            // Logic: Personal events + Class events
            setEvents([...personalEvents, ...classEvents]);
        }
    }, [user, date, isAddOpen]);

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

        // Refresh local state
        setNewEventTitle("");
        setNewEventDesc("");
        setIsAddOpen(false);
        toast.success("Personal event added");
    };

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex justify-between items-center"
            >
                <div className="space-y-1">
                    <h1 className="font-display text-4xl font-bold tracking-tight text-foreground italic flex items-center gap-3">
                        My <span className="text-primary">Calendar</span>
                    </h1>
                    <p className="text-muted-foreground font-medium">Coordinate your upcoming French language sessions.</p>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> Add Personal Note
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Personal Event</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input value={date ? format(date, "PPP") : ""} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    placeholder="e.g., Prepare for React Class"
                                    value={newEventTitle}
                                    onChange={(e) => setNewEventTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description (Optional)</Label>
                                <Textarea
                                    placeholder="Add details..."
                                    value={newEventDesc}
                                    onChange={(e) => setNewEventDesc(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddEvent}>Save Event</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Calendar Widget */}
                <div className="lg:col-span-4">
                    <Card className="border-border shadow-sm">
                        <CardContent className="p-4">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border mx-auto"
                                modifiers={{
                                    booked: (d) => events.some(e => {
                                        const evtDate = new Date(e.date);
                                        return evtDate.getDate() === d.getDate() &&
                                            evtDate.getMonth() === d.getMonth() &&
                                            evtDate.getFullYear() === d.getFullYear();
                                    })
                                }}
                                modifiersStyles={{
                                    booked: { fontWeight: 'bold', textDecoration: 'underline', color: 'var(--primary)' }
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Events List */}
                <div className="lg:col-span-8 space-y-4">
                    <h2 className="text-xl font-semibold mb-4">
                        Schedule for {date?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                    </h2>

                    {selectedDateEvents.length > 0 ? (
                        selectedDateEvents.map((event, index) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                                <Card className={`border-l-4 hover:bg-muted/50 transition-colors ${event.type === 'Class' ? 'border-l-primary' : 'border-l-secondary'}`}>
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div>
                                            <h3 className="font-display text-lg font-semibold">{event.title}</h3>
                                            <p className="text-muted-foreground text-sm mt-1">{event.description}</p>

                                            {event.type === 'Class' && (
                                                <div className="space-y-3 mt-3">
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-4 w-4" />
                                                            <span>{format(new Date(event.date), "p")}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Video className="h-4 w-4" />
                                                            <span>{event.meetingLink ? "Meeting Link Set" : "No Link Set"}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <Input
                                                            placeholder="Paste Zoom/Meet link..."
                                                            className="h-8 max-w-xs"
                                                            defaultValue={event.meetingLink}
                                                            onBlur={(e) => {
                                                                const link = e.target.value;
                                                                if (link) {
                                                                    db.updateAppointment(event.id, { meetingLink: link });
                                                                    toast.success("Meeting link updated");
                                                                }
                                                            }}
                                                        />
                                                        {event.meetingLink && (
                                                            <Button size="sm" variant="secondary" className="h-8" asChild>
                                                                <a href={event.meetingLink} target="_blank" rel="noreferrer">Join</a>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <Badge variant={event.type === "Class" ? "default" : "secondary"}>
                                            {event.type}
                                        </Badge>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                            <p>No events scheduled for this day.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainerSchedule;
