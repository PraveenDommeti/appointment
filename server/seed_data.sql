-- Run this in MySQL Workbench to add default data
USE appointment_system;

-- Insert Default Courses
INSERT IGNORE INTO courses (id, title, level, description, duration, status, trainerId, schedule) VALUES
('c1', 'French Essentials A1', 'A1', 'Master the basics of French conversation and grammar for everyday use.', 60, 'Active', '3', 'Mon, Wed 10:00 AM'),
('c2', 'Intermediate Fluency B1', 'B1', 'Express yourself fluently in various professional and social situations.', 90, 'Active', '3', 'Tue, Thu 02:00 PM'),
('c3', 'Advanced Mastery C1', 'C1', 'Reach complete academic and professional proficiency in the French language.', 120, 'Active', '3', 'Fri 11:00 AM');

-- Enroll student 4 in course c1
INSERT IGNORE INTO course_enrollments (courseId, studentId) VALUES ('c1', '4');

-- Verify all data
SELECT '=== USERS ===' AS section;
SELECT id, name, email, role, status FROM users;

SELECT '=== COURSES ===' AS section;
SELECT id, title, level, status, trainerId FROM courses;

SELECT '=== ENROLLMENTS ===' AS section;
SELECT * FROM course_enrollments;

SELECT '=== APPOINTMENTS ===' AS section;
SELECT * FROM appointments;

SELECT '=== MESSAGES ===' AS section;
SELECT * FROM messages;

SELECT '=== NOTIFICATIONS ===' AS section;
SELECT * FROM notifications;

SELECT '=== LEAVE REQUESTS ===' AS section;
SELECT * FROM leave_requests;
