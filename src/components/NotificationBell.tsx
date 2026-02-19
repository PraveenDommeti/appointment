import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/useRealTimeUpdates";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, CheckCheck, X } from "lucide-react";
import { useState } from "react";

export function NotificationBell() {
    const { user } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications(user?.id);
    const [open, setOpen] = useState(false);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "success":
                return "✅";
            case "warning":
                return "⚠️";
            case "error":
                return "❌";
            default:
                return "ℹ️";
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case "success":
                return "border-l-green-500";
            case "warning":
                return "border-l-yellow-500";
            case "error":
                return "border-l-red-500";
            default:
                return "border-l-blue-500";
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                        >
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="end">
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <h3 className="font-semibold">Notifications</h3>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAllAsRead()}
                                className="h-8 text-xs"
                            >
                                <CheckCheck className="h-3 w-3 mr-1" />
                                Mark all read
                            </Button>
                        )}
                    </div>
                </div>

                <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Bell className="h-12 w-12 text-muted-foreground/20 mb-3" />
                            <p className="text-sm text-muted-foreground">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "p-4 hover:bg-muted/50 transition-colors border-l-4",
                                        getNotificationColor(notification.type),
                                        !notification.read && "bg-muted/30"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl flex-shrink-0">
                                            {getNotificationIcon(notification.type)}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="font-semibold text-sm leading-tight">
                                                    {notification.title}
                                                </h4>
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    {!notification.read && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() => markAsRead(notification.id)}
                                                            title="Mark as read"
                                                        >
                                                            <Check className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-destructive hover:text-destructive"
                                                        onClick={() => deleteNotification(notification.id)}
                                                        title="Delete"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground mt-2">
                                                {(() => {
                                                    try {
                                                        // Use timestamp (correct property) or fall back to createdAt (legacy)
                                                        const timeValue = notification.timestamp || notification.createdAt;
                                                        if (!timeValue) return "Just now";

                                                        const date = new Date(timeValue);
                                                        // Check if date is valid
                                                        if (isNaN(date.getTime())) {
                                                            return "Just now";
                                                        }
                                                        return formatDistanceToNow(date, { addSuffix: true });
                                                    } catch (e) {
                                                        return "Just now";
                                                    }
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {notifications.length > 0 && (
                    <div className="border-t px-4 py-2 text-center">
                        <p className="text-xs text-muted-foreground">
                            Showing {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
