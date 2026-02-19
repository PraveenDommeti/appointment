import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";

const TrainerSlots = () => {
    const [slots, setSlots] = useState<{ id: string; day: string; time: string }[]>([
        { id: "1", day: "Monday", time: "10:00 AM" },
        { id: "2", day: "Wednesday", time: "02:00 PM" },
    ]);

    const [newSlot, setNewSlot] = useState({ day: "Monday", time: "" });

    const handleAddSlot = () => {
        if (!newSlot.time) return;
        setSlots([...slots, { id: Date.now().toString(), ...newSlot }]);
        setNewSlot({ day: "Monday", time: "" });
        toast.success("Availability slot added");
    };

    const handleDelete = (id: string) => {
        setSlots(slots.filter(s => s.id !== id));
        toast.info("Slot removed");
    };

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="font-display text-3xl font-bold text-foreground">Availability Slots</h1>
                <p className="text-muted-foreground mt-2">Define when you are available for student bookings.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Slot</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Day of Week</Label>
                            <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                                value={newSlot.day}
                                onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                            >
                                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                                    <option key={day} value={day}>{day}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Time</Label>
                            <Input
                                type="time"
                                value={newSlot.time}
                                onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
                            />
                        </div>
                        <Button className="w-full" onClick={handleAddSlot}>
                            <Plus className="h-4 w-4 mr-2" /> Add Availability
                        </Button>
                    </CardContent>
                </Card>

                <div className="lg:col-span-2 space-y-4">
                    {slots.map((slot) => (
                        <Card key={slot.id} className="hover:bg-muted/50 transition-colors">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{slot.day}</p>
                                        <p className="text-sm text-muted-foreground">{slot.time}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(slot.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrainerSlots;
