export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: "Active" | "Inactive";
    joinedDate: string;
    performanceScore?: number;
}

export interface Course {
    id: string;
    title: string;
    level: string;
    description: string;
    duration: number;
    status: "Active" | "Draft" | "Inactive";
    image?: string;
    price?: number;
    trainerId?: string;
    studentsEnrolled: string[];
    schedule?: string;
}

export interface Appointment {
    id: string;
    userId: string;
    courseId: string;
    topic: string;
    date: string;
    time: string;
    status: "Pending" | "Approved" | "Rejected" | "Completed";
    description?: string;
    createdAt: string;
    trainerId?: string;
    duration?: number;
    meetingLink?: string;
    rejectionReason?: string;
}

export interface EnrollmentRequest {
    id: string;
    studentId: string;
    courseId: string;
    status: "Pending" | "Approved" | "Rejected";
    requestedAt: string;
    meetingLink?: string;
    meetingDescription?: string;
    meetingDate?: string;
    meetingTime?: string;
}

export interface SystemLog {
    id: string;
    userId: string;
    action: string;
    category: "auth" | "user" | "course" | "system";
    details: string;
    timestamp: string;
}

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    category: "system" | "enrollment" | "message" | "meeting" | "appointment";
    read: boolean;
    timestamp: string;
}

const INITIAL_COURSES: Course[] = [
    {
        id: "c1",
        title: "French Essentials A1",
        level: "A1",
        description: "Master the basics of French conversation and grammar for everyday use.",
        duration: 60,
        status: "Active",
        trainerId: "3",
        studentsEnrolled: ["4"],
        schedule: "Mon, Wed 10:00 AM"
    },
    {
        id: "c2",
        title: "Intermediate Fluency B1",
        level: "B1",
        description: "Express yourself fluently in various professional and social situations.",
        duration: 90,
        status: "Active",
        trainerId: "3",
        studentsEnrolled: [],
        schedule: "Tue, Thu 02:00 PM"
    },
    {
        id: "c3",
        title: "Advanced Mastery C1",
        level: "C1",
        description: "Reach complete academic and professional proficiency in the French language.",
        duration: 120,
        status: "Active",
        trainerId: "3",
        studentsEnrolled: [],
        schedule: "Fri 11:00 AM"
    }
];

const INITIAL_APPOINTMENTS: Appointment[] = [
    {
        id: "a1",
        userId: "4",
        courseId: "c1",
        topic: "Initial Assessment",
        date: new Date().toISOString().split('T')[0],
        time: "10:00",
        status: "Approved",
        createdAt: new Date().toISOString(),
        trainerId: "3",
        duration: 60,
        meetingLink: "https://meet.google.com/abc-defg-hij"
    },
    {
        id: "a2",
        userId: "4",
        courseId: "c2",
        topic: "Grammar Deep Dive",
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time: "14:30",
        status: "Pending",
        createdAt: new Date().toISOString(),
        trainerId: "3",
        duration: 90
    }
];

class RealDatabase {
    private apiUrl = 'https://appointment-production-f6d9.up.railway.app/api';

    private async call(endpoint: string, method = 'GET', body?: any) {
        const response = await fetch(`${this.apiUrl}${endpoint}`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined
        });
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return response.json();
    }

    // Courses
    async getCourses(): Promise<Course[]> {
        return this.call('/courses');
    }

    async addCourse(course: Course): Promise<void> {
        await this.call('/courses', 'POST', course);
    }

    // Appointments (Slots)
    async getAllAppointments(): Promise<Appointment[]> {
        return this.call('/appointments');
    }

    async getAppointments(userId: string): Promise<Appointment[]> {
        return this.call(`/appointments?userId=${userId}`);
    }

    async requestAppointment(appt: Appointment): Promise<void> {
        await this.call('/appointments', 'POST', appt);
    }

    async updateAppointmentStatus(id: string, status: string): Promise<void> {
        await this.call(`/appointments/${id}`, 'PATCH', { status });
    }

    async approveAppointment(id: string, meetingLink?: string): Promise<void> {
        await this.call(`/appointments/${id}`, 'PATCH', { status: 'Approved', meetingLink });
    }

    async rejectAppointment(id: string, reason: string): Promise<void> {
        await this.call(`/appointments/${id}`, 'PATCH', { status: 'Rejected', rejectionReason: reason });
    }

    // Users
    async getUsers(): Promise<User[]> {
        return this.call('/users');
    }

    async getUser(id: string): Promise<User | undefined> {
        const users = await this.getUsers();
        return users.find(u => u.id === id);
    }

    // Notifications
    async getNotifications(userId: string): Promise<Notification[]> {
        return this.call(`/notifications/${userId}`);
    }

    async createNotification(notif: any): Promise<void> {
        await this.call('/notifications', 'POST', { ...notif, id: crypto.randomUUID() });
    }

    // Messages
    async getMessages(userId: string, otherUserId: string): Promise<any[]> {
        return this.call(`/messages?senderId=${userId}&receiverId=${otherUserId}`);
    }

    async sendMessage(msg: any): Promise<void> {
        await this.call('/messages', 'POST', { ...msg, id: crypto.randomUUID() });
    }

    async sendBroadcast(senderId: string, filter: string, text: string): Promise<void> {
        await this.call('/broadcast', 'POST', { senderId, filter, text });
    }

    // System Logs
    async addSystemLog(log: any): Promise<void> {
        console.log("MySQL Logged:", log);
        // We can add a logs table later if needed
    }

    // Legacy Support (Preventing immediate crashes while components update)
    // IMPORTANT: Components should be updated to handle async/await
    private localGet<T>(key: string, def: T): T {
        const d = localStorage.getItem(`classbook_${key}`);
        return d ? JSON.parse(d) : def;
    }

    getMaterials(): any[] { return this.localGet("materials", []); }
}

export const db = new RealDatabase();
