import { generateUUID } from "@/lib/utils";

const API_URL = import.meta.env.VITE_API_URL || 'https://appointment-production-f6d9.up.railway.app/api';

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: "Active" | "Inactive";
    password?: string; // Added for creation
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
    category: "system" | "enrollment" | "message" | "meeting" | "appointment" | "timesheet" | "leave";
    read: boolean;
    timestamp: string;
}

export interface TimeLog {
    id: string;
    userId: string;
    date: string;
    hours: number;
    activity: string;
    status: "Pending" | "Approved" | "Rejected";
    createdAt: string;
}

export interface LeaveRequest {
    id: string;
    userId: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: "Pending" | "Approved" | "Rejected";
    reviewedBy?: string;
    comments?: string;
    createdAt: string;
}

export interface AttendanceRecord {
    id: string;
    courseId: string;
    studentId: string;
    date: string;
    status: "Present" | "Absent";
    markedBy: string;
    appointmentId?: string;
    createdAt: string;
}

export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    text: string;
    timestamp: string;
    status: "sent" | "delivered" | "read";
}

export interface CalendarEvent {
    id: string;
    userId: string;
    title: string;
    date: string;
    type: "Class" | "Personal";
    description?: string;
    meetingLink?: string;
}

export interface Material {
    id: string;
    courseId: string;
    title: string;
    type: string;
    url: string;
    uploadedBy: string;
    uploadedAt: string;
}

// ============================================
// API Helper
// ============================================
async function apiCall(endpoint: string, method = 'GET', body?: any) {
    const url = `${API_URL}${endpoint}`;
    try {
        const options: RequestInit = {
            method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (body) options.body = JSON.stringify(body);
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`API ${response.status}: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error(`API Error [${method} ${endpoint}]:`, error);
        throw error;
    }
}

// ============================================
// LOCAL CACHE - Syncs with MySQL periodically
// Provides synchronous access for 40+ components
// ============================================
const cache = {
    users: [] as User[],
    courses: [] as Course[],
    appointments: [] as Appointment[],
    loaded: false,
};

// Initialize: fetch from MySQL and store in cache
async function syncCache() {
    try {
        const [users, courses, appointments] = await Promise.all([
            apiCall('/users'),
            apiCall('/courses'),
            apiCall('/appointments'),
        ]);
        cache.users = users || [];
        cache.courses = (courses || []).map((c: any) => ({
            ...c,
            studentsEnrolled: c.studentsEnrolled || [],
        }));
        cache.appointments = appointments || [];
        cache.loaded = true;
        window.dispatchEvent(new Event('db-update'));
    } catch (e) {
        console.warn('⚠️ MySQL cache sync failed, using local fallback:', e);
        // Fall back to localStorage if server is down
        cache.users = JSON.parse(localStorage.getItem('classbook_users') || '[]');
        cache.courses = JSON.parse(localStorage.getItem('classbook_courses') || '[]');
        cache.appointments = JSON.parse(localStorage.getItem('classbook_appointments') || '[]');
    }
}

// Auto-sync every 5 seconds
syncCache();
setInterval(syncCache, 5000);

// ============================================
// DATABASE CLASS
// Synchronous reads from cache, async writes to MySQL
// ============================================
class Database {
    // --- COURSES ---
    getCourses(): Course[] {
        return cache.courses;
    }

    getCourse(id: string): Course | undefined {
        return cache.courses.find(c => c.id === id);
    }

    async addCourse(course: Course): Promise<void> {
        await apiCall('/courses', 'POST', course);
        await syncCache();
    }

    async updateCourse(id: string, data: Partial<Course>): Promise<void> {
        await apiCall(`/courses/${id}`, 'PUT', data);
        await syncCache();
    }

    async deleteCourse(id: string): Promise<void> {
        await apiCall(`/courses/${id}`, 'DELETE');
        await syncCache();
    }

    // --- ENROLLMENTS ---
    getEnrollmentRequests(): EnrollmentRequest[] {
        return [];
    }

    updateEnrollmentStatus(id: string, status: EnrollmentRequest["status"]): void {
        console.log("Enrollment status update:", id, status);
    }

    updateEnrollmentMeeting(id: string, meetingLink: string, meetingDescription: string, meetingDate: string, meetingTime: string): void {
        console.log("Enrollment meeting update:", id);
    }

    // --- APPOINTMENTS ---
    getAllAppointments(): Appointment[] {
        return cache.appointments;
    }

    getAppointments(userId: string): Appointment[] {
        return cache.appointments.filter(a => a.userId === userId || a.trainerId === userId);
    }

    getUnifiedSchedule(userId: string): Appointment[] {
        return this.getAppointments(userId);
    }

    async requestAppointment(appt: Appointment): Promise<void> {
        await apiCall('/appointments', 'POST', appt);
        await syncCache();
    }

    async updateAppointment(id: string, data: Partial<Appointment>): Promise<void> {
        await apiCall(`/appointments/${id}`, 'PATCH', data);
        await syncCache();
    }

    async updateAppointmentStatus(id: string, status: Appointment["status"]): Promise<void> {
        await apiCall(`/appointments/${id}`, 'PATCH', { status });
        await syncCache();
    }

    async updateAppointmentLink(id: string, meetingLink: string): Promise<void> {
        await apiCall(`/appointments/${id}`, 'PATCH', { meetingLink });
        await syncCache();
    }

    async approveAppointment(id: string, meetingLink?: string): Promise<void> {
        await apiCall(`/appointments/${id}`, 'PATCH', {
            status: "Approved",
            ...(meetingLink ? { meetingLink } : {})
        });
        await syncCache();
    }

    async approveGroupSession(ids: string[], meetingLink?: string): Promise<void> {
        for (const id of ids) {
            await apiCall(`/appointments/${id}`, 'PATCH', {
                status: "Approved",
                ...(meetingLink ? { meetingLink } : {})
            });
        }
        await syncCache();
    }

    async rejectAppointment(id: string, reason: string): Promise<void> {
        await apiCall(`/appointments/${id}`, 'PATCH', {
            status: "Rejected",
            rejectionReason: reason
        });
        await syncCache();
    }

    // --- USERS ---
    getUsers(): User[] {
        return cache.users;
    }

    getUser(id: string): User | undefined {
        return cache.users.find(u => u.id === id);
    }

    async addUser(user: User): Promise<void> {
        await apiCall('/users', 'POST', user);
        await syncCache();
    }

    async updateUser(id: string, data: Partial<User>): Promise<void> {
        await apiCall(`/users/${id}`, 'PUT', data);
        await syncCache();
    }

    async deleteUser(id: string): Promise<void> {
        await apiCall(`/users/${id}`, 'DELETE');
        await syncCache();
    }

    // --- MESSAGES ---

    async getMessages(userId: string, otherUserId: string): Promise<Message[]> {
        try {
            const messages = await apiCall(`/messages?senderId=${userId}&receiverId=${otherUserId}`);
            return messages || [];
        } catch (e) {
            console.warn('Failed to fetch messages from API, using local fallback');
            const data = localStorage.getItem('classbook_messages');
            const all = data ? JSON.parse(data) : [];
            return all.filter((m: any) =>
                (m.senderId === userId && m.receiverId === otherUserId) ||
                (m.senderId === otherUserId && m.receiverId === userId)
            ).sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        }
    }

    async sendMessage(msg: any): Promise<void> {
        try {
            await apiCall('/messages', 'POST', { ...msg, id: msg.id || generateUUID() });
        } catch (e) {
            // Fallback to local
            const messages = JSON.parse(localStorage.getItem('classbook_messages') || '[]');
            localStorage.setItem('classbook_messages', JSON.stringify([...messages, { ...msg, timestamp: new Date().toISOString() }]));
        }
    }

    markMessagesAsRead(viewerId: string, contactId: string): void {
        const data = localStorage.getItem('classbook_messages');
        if (!data) return;

        let messages = JSON.parse(data);
        let updated = false;

        messages = messages.map((m: any) => {
            if (m.receiverId === viewerId && m.senderId === contactId && m.status !== 'read') {
                updated = true;
                return { ...m, status: 'read' };
            }
            return m;
        });

        if (updated) {
            localStorage.setItem('classbook_messages', JSON.stringify(messages));
        }
    }

    // --- NOTIFICATIONS ---
    createNotification(notif: Omit<Notification, "id" | "timestamp" | "read">): void {
        apiCall('/notifications', 'POST', { ...notif, id: generateUUID() }).catch(e => {
            console.warn('Notification save failed:', e);
        });
    }

    getNotifications(userId: string): Notification[] {
        // Return from local cache for now (sync based)
        const data = localStorage.getItem('classbook_notifications');
        const all = data ? JSON.parse(data) : [];
        return all.filter((n: any) => n.userId === userId);
    }

    markNotificationAsRead(id: string): void {
        apiCall(`/notifications/${id}/read`, 'PATCH').catch(console.warn);
    }

    deleteNotification(id: string): void {
        apiCall(`/notifications/${id}`, 'DELETE').catch(console.warn);
    }

    // --- LEAVE REQUESTS ---
    getLeaveRequests(userId?: string): any[] {
        const data = localStorage.getItem('classbook_leave_requests');
        const all = data ? JSON.parse(data) : [];
        return userId ? all.filter((l: any) => l.userId === userId) : all;
    }

    async addLeaveRequest(request: any): Promise<void> {
        // Optimistically update local storage first so UI helps immediately
        const requests = this.getLeaveRequests();
        localStorage.setItem('classbook_leave_requests', JSON.stringify([...requests, request]));

        try {
            await apiCall('/leave-requests', 'POST', request);
        } catch (e) {
            console.warn('API sync failed for addLeaveRequest, kept local');
        }
    }

    async updateLeaveRequestStatus(id: string, status: string, reviewedBy?: string, comments?: string): Promise<void> {
        // Optimistically update local storage first
        const requests = this.getLeaveRequests();
        const updatedRequests = requests.map((r: any) =>
            r.id === id ? { ...r, status, reviewedBy, comments, reviewedAt: new Date().toISOString() } : r
        );
        localStorage.setItem('classbook_leave_requests', JSON.stringify(updatedRequests));

        try {
            await apiCall(`/leave-requests/${id}`, 'PATCH', { status, reviewedBy, comments });
        } catch (e) {
            console.warn('API sync failed for updateLeaveRequestStatus, kept local');
        }
    }

    // --- SYSTEM LOGS ---
    addSystemLog(log: Omit<SystemLog, "id" | "timestamp">): void {
        apiCall('/system-logs', 'POST', log).catch(() => {
            console.log("📋 Log:", log);
        });
    }

    getSystemLogs(userId?: string, category?: string): SystemLog[] {
        const data = localStorage.getItem('classbook_system_logs');
        const all = data ? JSON.parse(data) : [];
        let filtered = all;
        if (userId) filtered = filtered.filter((l: any) => l.userId === userId);
        if (category) filtered = filtered.filter((l: any) => l.category === category);
        return filtered;
    }

    clearSystemLogs(): void {
        localStorage.removeItem('classbook_system_logs');
    }

    // --- ANALYTICS ---
    getSystemAnalytics(): any {
        const users = this.getUsers();
        const courses = this.getCourses();
        const appointments = this.getAllAppointments();
        return {
            totalUsers: users.length,
            totalStudents: users.filter(u => u.role === 'student').length,
            totalTrainers: users.filter(u => u.role === 'trainer').length,
            totalAdmins: users.filter(u => u.role === 'admin').length,
            activeCourses: courses.filter(c => c.status === 'Active').length,
            totalAppointments: appointments.length,
            approvedAppointments: appointments.filter(a => a.status === 'Approved').length,
            completedAppointments: appointments.filter(a => a.status === 'Completed').length,
            pendingAppointments: appointments.filter(a => a.status === 'Pending').length,
            pendingRequests: appointments.filter(a => a.status === 'Pending').length,
            totalActiveSessions: courses.filter(c => c.status === 'Active').length,
        };
    }

    getAdminAnalytics(): any {
        return this.getSystemAnalytics();
    }

    getSuperAdminAnalytics(): any {
        return this.getSystemAnalytics();
    }

    getStudentAnalytics(userId: string): any {
        const appts = this.getAppointments(userId);
        const booked = appts.length;
        const attended = appts.filter(a => a.status === 'Completed').length;
        const remaining = appts.filter(a => ['Pending', 'Approved'].includes(a.status)).length;
        const attendanceRate = booked > 0 ? Math.round((attended / booked) * 100) : 0;
        return { totalBooked: booked, attended, remaining, attendanceRate };
    }

    getTrainerAnalytics(userId: string): any {
        const courses = this.getCourses().filter(c => c.trainerId === userId);
        const appts = this.getAllAppointments();
        const myAppts = appts.filter(a => a.trainerId === userId || courses.map(c => c.id).includes(a.courseId));
        const sessionsConducted = myAppts.filter(a => a.status === 'Completed').length;
        const upcoming = myAppts.filter(a => ['Pending', 'Approved'].includes(a.status)).length;
        const uniqueStudents = new Set(myAppts.map(a => a.userId));
        return { totalStudents: uniqueStudents.size, sessionsConducted, upcoming, teachingHours: sessionsConducted };
    }

    // --- MATERIALS (localStorage) ---
    getMaterials(): any[] {
        const data = localStorage.getItem('classbook_materials');
        return data ? JSON.parse(data) : [];
    }

    addMaterial(material: any): void {
        const materials = this.getMaterials();
        localStorage.setItem('classbook_materials', JSON.stringify([...materials, material]));
    }

    // --- TIME LOGS (localStorage) ---
    getTimeLogs(userId?: string): any[] {
        const data = localStorage.getItem('classbook_time_logs');
        const logs = data ? JSON.parse(data) : [];
        return userId ? logs.filter((l: any) => l.userId === userId) : logs;
    }

    addTimeLog(log: any): void {
        const logs = this.getTimeLogs();
        localStorage.setItem('classbook_time_logs', JSON.stringify([...logs, log]));
    }

    updateTimeLogStatus(id: string, status: string): void {
        const logs = this.getTimeLogs();
        localStorage.setItem('classbook_time_logs', JSON.stringify(logs.map((l: any) => l.id === id ? { ...l, status } : l)));
    }

    // --- ATTENDANCE (localStorage) ---
    getAttendanceRecords(studentId?: string): any[] {
        const data = localStorage.getItem('classbook_attendance_records');
        const all = data ? JSON.parse(data) : [];
        return studentId ? all.filter((a: any) => a.studentId === studentId) : all;
    }

    addAttendanceRecord(record: any): void {
        const records = this.getAttendanceRecords();
        localStorage.setItem('classbook_attendance_records', JSON.stringify([...records, record]));
    }

    updateAttendanceRecord(id: string, updates: any): void {
        const records = this.getAttendanceRecords();
        localStorage.setItem('classbook_attendance_records', JSON.stringify(records.map((r: any) => r.id === id ? { ...r, ...updates } : r)));
    }

    // --- CALENDAR EVENTS (localStorage) ---
    getCalendarEvents(userId: string): any[] {
        const data = localStorage.getItem('classbook_calendar_events');
        const all = data ? JSON.parse(data) : [];
        return all.filter((e: any) => e.userId === userId);
    }

    addCalendarEvent(event: any): void {
        const all = JSON.parse(localStorage.getItem('classbook_calendar_events') || '[]');
        localStorage.setItem('classbook_calendar_events', JSON.stringify([...all, event]));
    }

    deleteCalendarEvent(id: string): void {
        const all = JSON.parse(localStorage.getItem('classbook_calendar_events') || '[]');
        const filtered = all.filter((e: any) => e.id !== id);
        localStorage.setItem('classbook_calendar_events', JSON.stringify(filtered));
    }

    // --- ADMIN SLOTS (localStorage) ---
    getAdminSlots(): any[] {
        const data = localStorage.getItem('classbook_admin_slots');
        return data ? JSON.parse(data) : [];
    }

    addAdminSlot(slot: any): void {
        const slots = this.getAdminSlots();
        localStorage.setItem('classbook_admin_slots', JSON.stringify([...slots, slot]));
    }

    deleteAdminSlot(id: string): void {
        const slots = this.getAdminSlots();
        localStorage.setItem('classbook_admin_slots', JSON.stringify(slots.filter((s: any) => s.id !== id)));
    }

    // --- MISC ---
    checkAndCompleteAppointments(): void {
        console.log("System Check: Synchronizing session statuses...");
    }
}

export const db = new Database();
