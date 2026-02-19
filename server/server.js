import bcrypt from 'bcryptjs';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Appointment API is running 🚀' });
});

// --- DATABASE CONNECTION ---
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
});

const query = async (sql, params = []) => {
    try {
        const [results] = await pool.query(sql, params);
        return results;
    } catch (err) {
        console.error('❌ DB Query Error:', sql);
        console.error('Detailed Error:', err);
        throw err;
    }
};

// Test connection on start
(async () => {
    try {
        await query('SELECT 1');
        console.log('✅ MySQL Connected Successfully');
    } catch (e) {
        console.error('❌ MySQL Connection Failed:', e.message);
    }
})();

// ============================================
// AUTH
// ============================================
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const users = await query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(401).json({ message: 'Invalid email or password' });

        const user = users[0];
        let isMatch = false;
        if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
            isMatch = await bcrypt.compare(password, user.password);
        } else {
            isMatch = (password === user.password);
        }

        if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                joinedDate: user.joinedDate,
                performanceScore: user.performanceScore
            }
        });
    } catch (e) {
        console.error('Login error:', e);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================================
// USERS
// ============================================
app.get('/api/users', async (req, res) => {
    try {
        const results = await query('SELECT id, name, email, role, status, joinedDate, performanceScore FROM users');
        res.json(results);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/users/:id', async (req, res) => {
    try {
        const results = await query('SELECT id, name, email, role, status, joinedDate, performanceScore FROM users WHERE id = ?', [req.params.id]);
        res.json(results.length > 0 ? results[0] : null);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/users', async (req, res) => {
    const { id, name, email, password, role, status, joinedDate, performanceScore } = req.body;
    try {
        const pwd = password || 'default123';
        await query('INSERT INTO users (id, name, email, password, role, status, joinedDate, performanceScore) VALUES (?,?,?,?,?,?,?,?)',
            [id, name, email, pwd, role, status || 'Active', joinedDate || new Date().toISOString().split('T')[0], performanceScore || 0]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const fields = req.body;
    try {
        const sets = [];
        const vals = [];
        for (const [key, value] of Object.entries(fields)) {
            if (key !== 'id') { sets.push(`${key} = ?`); vals.push(value); }
        }
        if (sets.length > 0) {
            vals.push(id);
            await query(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, vals);
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        await query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============================================
// COURSES
// ============================================
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await query('SELECT * FROM courses');
        // Add studentsEnrolled array from junction table
        for (const course of courses) {
            const enrolled = await query('SELECT studentId FROM course_enrollments WHERE courseId = ?', [course.id]);
            course.studentsEnrolled = enrolled.map(e => e.studentId);
        }
        res.json(courses);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/courses/:id', async (req, res) => {
    try {
        const courses = await query('SELECT * FROM courses WHERE id = ?', [req.params.id]);
        if (courses.length === 0) return res.json(null);
        const course = courses[0];
        const enrolled = await query('SELECT studentId FROM course_enrollments WHERE courseId = ?', [course.id]);
        course.studentsEnrolled = enrolled.map(e => e.studentId);
        res.json(course);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/courses', async (req, res) => {
    const { id, title, level, description, duration, status, image, price, trainerId, schedule, studentsEnrolled } = req.body;
    try {
        await query('INSERT INTO courses (id, title, level, description, duration, status, image, price, trainerId, schedule) VALUES (?,?,?,?,?,?,?,?,?,?)',
            [id, title, level, description || '', duration || 60, status || 'Active', image || null, price || null, trainerId || null, schedule || null]);
        // Insert enrolled students
        if (studentsEnrolled && studentsEnrolled.length > 0) {
            for (const studentId of studentsEnrolled) {
                await query('INSERT IGNORE INTO course_enrollments (courseId, studentId) VALUES (?,?)', [id, studentId]);
            }
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/courses/:id', async (req, res) => {
    const { id } = req.params;
    const { studentsEnrolled, ...fields } = req.body;
    try {
        const sets = [];
        const vals = [];
        for (const [key, value] of Object.entries(fields)) {
            if (key !== 'id') { sets.push(`${key} = ?`); vals.push(value); }
        }
        if (sets.length > 0) {
            vals.push(id);
            await query(`UPDATE courses SET ${sets.join(', ')} WHERE id = ?`, vals);
        }
        // Update enrollments if provided
        if (studentsEnrolled) {
            await query('DELETE FROM course_enrollments WHERE courseId = ?', [id]);
            for (const studentId of studentsEnrolled) {
                await query('INSERT INTO course_enrollments (courseId, studentId) VALUES (?,?)', [id, studentId]);
            }
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/courses/:id', async (req, res) => {
    try {
        await query('DELETE FROM courses WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============================================
// APPOINTMENTS
// ============================================
app.get('/api/appointments', async (req, res) => {
    const { userId } = req.query;
    try {
        let results;
        if (userId) {
            results = await query('SELECT * FROM appointments WHERE userId = ? OR trainerId = ? ORDER BY date DESC, time DESC', [userId, userId]);
        } else {
            results = await query('SELECT * FROM appointments ORDER BY date DESC, time DESC');
        }
        res.json(results);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/appointments', async (req, res) => {
    const { id, userId, courseId, topic, date, time, status, description, trainerId, duration, meetingLink } = req.body;
    try {
        await query(
            'INSERT INTO appointments (id, userId, courseId, topic, date, time, status, description, trainerId, duration, meetingLink, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,NOW())',
            [id, userId, courseId || null, topic || '', date, time, status || 'Pending', description || null, trainerId || null, duration || 60, meetingLink || null]
        );
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH - only updates fields that are actually sent (fixes the NULL problem)
app.patch('/api/appointments/:id', async (req, res) => {
    const { id } = req.params;
    const fields = req.body;
    try {
        const sets = [];
        const vals = [];
        for (const [key, value] of Object.entries(fields)) {
            if (key !== 'id') {
                sets.push(`${key} = ?`);
                vals.push(value !== undefined ? value : null);
            }
        }
        if (sets.length > 0) {
            vals.push(id);
            await query(`UPDATE appointments SET ${sets.join(', ')} WHERE id = ?`, vals);
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============================================
// LEAVE REQUESTS
// ============================================
app.get('/api/leave-requests', async (req, res) => {
    const { userId } = req.query;
    try {
        let results;
        if (userId) {
            results = await query('SELECT * FROM leave_requests WHERE userId = ? ORDER BY createdAt DESC', [userId]);
        } else {
            results = await query('SELECT * FROM leave_requests ORDER BY createdAt DESC');
        }
        res.json(results);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/leave-requests', async (req, res) => {
    const { id, userId, startDate, endDate, reason, status } = req.body;
    try {
        await query('INSERT INTO leave_requests (id, userId, startDate, endDate, reason, status, createdAt) VALUES (?,?,?,?,?,?,NOW())',
            [id, userId, startDate, endDate, reason || '', status || 'Pending']);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/leave-requests/:id', async (req, res) => {
    const { id } = req.params;
    const fields = req.body;
    try {
        const sets = [];
        const vals = [];
        for (const [key, value] of Object.entries(fields)) {
            if (key !== 'id') { sets.push(`${key} = ?`); vals.push(value); }
        }
        if (sets.length > 0) {
            vals.push(id);
            await query(`UPDATE leave_requests SET ${sets.join(', ')} WHERE id = ?`, vals);
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============================================
// MESSAGES & BROADCAST
// ============================================
app.get('/api/messages', async (req, res) => {
    const { senderId, receiverId } = req.query;
    try {
        if (senderId && receiverId) {
            const results = await query(
                'SELECT * FROM messages WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?) ORDER BY timestamp ASC',
                [senderId, receiverId, receiverId, senderId]
            );
            res.json(results);
        } else {
            res.json([]);
        }
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/messages', async (req, res) => {
    const { id, senderId, receiverId, text, status } = req.body;
    try {
        const msgId = id || crypto.randomUUID();
        await query('INSERT INTO messages (id, senderId, receiverId, text, status) VALUES (?,?,?,?,?)',
            [msgId, senderId, receiverId, text, status || 'sent']);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/broadcast', async (req, res) => {
    const { senderId, filter, text } = req.body;
    try {
        let targetUsers;
        if (filter === 'all') {
            targetUsers = await query('SELECT id FROM users WHERE status = "Active"');
        } else {
            targetUsers = await query('SELECT id FROM users WHERE status = "Active" AND role = ?', [filter]);
        }
        let count = 0;
        for (const user of targetUsers) {
            if (user.id !== senderId) {
                await query('INSERT INTO messages (id, senderId, receiverId, text, status) VALUES (?,?,?,?,?)',
                    [crypto.randomUUID(), senderId, user.id, text, 'sent']);
                count++;
            }
        }
        res.json({ success: true, sentTo: count });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============================================
// NOTIFICATIONS
// ============================================
app.get('/api/notifications/:userId', async (req, res) => {
    try {
        const results = await query('SELECT * FROM notifications WHERE userId = ? ORDER BY timestamp DESC', [req.params.userId]);
        // Map isRead to read for frontend compatibility
        const mapped = results.map(n => ({ ...n, read: !!n.isRead }));
        res.json(mapped);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/notifications', async (req, res) => {
    const { id, userId, title, message, type, category } = req.body;
    try {
        const notifId = id || crypto.randomUUID();
        await query('INSERT INTO notifications (id, userId, title, message, type, category) VALUES (?,?,?,?,?,?)',
            [notifId, userId, title, message, type || 'info', category]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/notifications/:id/read', async (req, res) => {
    try {
        await query('UPDATE notifications SET isRead = 1 WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/notifications/:id', async (req, res) => {
    try {
        await query('DELETE FROM notifications WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============================================
// SYSTEM LOGS
// ============================================
app.get('/api/system-logs', async (req, res) => {
    // System logs table doesn't exist yet, return empty array
    res.json([]);
});

app.post('/api/system-logs', async (req, res) => {
    // Accept but don't crash - logs table not created yet
    console.log('📋 System Log:', req.body);
    res.json({ success: true });
});

// ============================================
// ANALYTICS
// ============================================
app.get('/api/analytics', async (req, res) => {
    try {
        const users = await query('SELECT id, role FROM users');
        const courses = await query('SELECT id, status FROM courses');
        const appointments = await query('SELECT id, status FROM appointments');
        const pendingLeaves = await query('SELECT COUNT(*) as cnt FROM leave_requests WHERE status = "Pending"');

        res.json({
            totalUsers: users.length,
            totalStudents: users.filter(u => u.role === 'student').length,
            totalTrainers: users.filter(u => u.role === 'trainer').length,
            totalAdmins: users.filter(u => u.role === 'admin').length,
            totalCourses: courses.length,
            activeCourses: courses.filter(c => c.status === 'Active').length,
            totalAppointments: appointments.length,
            approvedAppointments: appointments.filter(a => a.status === 'Approved').length,
            completedAppointments: appointments.filter(a => a.status === 'Completed').length,
            pendingAppointments: appointments.filter(a => a.status === 'Pending').length,
            pendingRequests: pendingLeaves[0]?.cnt || 0,
            totalActiveSessions: courses.filter(c => c.status === 'Active').length,
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', async (req, res) => {
    try {
        await query('SELECT 1');
        res.json({ status: 'ok', database: 'connected' });
    } catch (e) {
        res.status(500).json({ status: 'error', database: 'disconnected', error: e.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 API Server ready on http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});
