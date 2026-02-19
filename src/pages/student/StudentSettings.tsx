import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/db";
import { toast } from "sonner";

const StudentSettings = () => {
    const { user } = useAuth();
    const [name, setName] = useState(user?.name || "");
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(false);

    const handleSave = () => {
        if (!user) return;
        db.updateUser(user.id, { name });
        toast.success("Identity updated in decentralized registry");
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="font-display text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-2">Manage your account preferences and profile.</p>
            </motion.div>

            {/* Profile Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} />
                            <AvatarFallback>ST</AvatarFallback>
                        </Avatar>
                        <Button variant="outline">Change Avatar</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input defaultValue={user?.email} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input placeholder="+1234567890" />
                        </div>
                        <div className="space-y-2">
                            <Label>Location</Label>
                            <Input placeholder="City, Country" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notifications Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Configure how you receive alerts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive updates about class schedules and materials.</p>
                        </div>
                        <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Push Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive real-time alerts on your device.</p>
                        </div>
                        <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSave}>Save Changes</Button>
            </div>
        </div>
    );
};

export default StudentSettings;
