// Email Integration Implementation Guide
// This file shows how to integrate the notification service for email alerts

// ========================================
// IMPLEMENTATION IN TRAINER REQUESTS
// File: src/pages/trainer/TrainerRequests.tsx
// ========================================

// 1. Add import at the top:
import { notificationService } from "@/lib/notifications";

// 2. Update the handleApprove function (around line 40-60):

const handleApprove = async (id: string) => {
    const appt = appointments.find((a) => a.id === id);
    if (!appt) return;

    const updatedAppt = {
        ...appt,
        status: "Approved" as const,
        meetingLink: meetingLink || undefined,
        trainerId: user?.id
    };

    db.updateAppointment(id, updatedAppt);

    // Create in-app notification
    db.createNotification({
        userId: appt.userId,
        title: "✅ Appointment Approved",
        message: `Your appointment for "${appt.topic}" on ${appt.date} at ${appt.time} has been approved!${meetingLink ? ` Meeting link: ${meetingLink}` : ''}`,
        type: "success",
        category: "appointment"
    });

    // --- NEW: Send email notification ---
    const student = db.getUser(appt.userId);
    if (student && student.email) {
        const course = db.getCourse(appt.courseId);
        const emailContent = notificationService.templates.appointmentApproved(
            student.name,
            course?.title || appt.topic,
            appt.date,
            appt.time,
            meetingLink
        );

        try {
            await notificationService.sendEmail({
                to: student.email,
                ...emailContent
            });
            console.log(`✉️ Approval email sent to ${student.email}`);
        } catch (error) {
            console.error("Failed to send approval email:", error);
        }
    }
    // --- END NEW CODE ---

    toast.success("Appointment approved successfully");
    setSelectedAppt(null);
    setMeetingLink("");
    refreshData();
};

// 3. Update the handleReject function (around line 62-80):

const handleReject = async (id: string) => {
    const appt = appointments.find((a) => a.id === id);
    if (!appt) return;

    db.updateAppointment(id, {
        status: "Rejected",
        rejectionReason: rejectionReason || "Not specified"
    });

    // Create in-app notification
    db.createNotification({
        userId: appt.userId,
        title: "❌ Appointment Not Approved",
        message: `Your appointment for "${appt.topic}" was not approved.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
        type: "error",
        category: "appointment"
    });

    // --- NEW: Send email notification ---
    const student = db.getUser(appt.userId);
    if (student && student.email) {
        const course = db.getCourse(appt.courseId);
        const emailContent = notificationService.templates.appointmentRejected(
            student.name,
            course?.title || appt.topic,
            rejectionReason
        );

        try {
            await notificationService.sendEmail({
                to: student.email,
                ...emailContent
            });
            console.log(`✉️ Rejection email sent to ${student.email}`);
        } catch (error) {
            console.error("Failed to send rejection email:", error);
        }
    }
    // --- END NEW CODE ---

    toast.success("Appointment rejected");
    setSelectedAppt(null);
    setRejectionReason("");
    refreshData();
};

// ========================================
// IMPLEMENTATION IN ADMIN SLOTS
// File: src/pages/admin/AdminSlots.tsx
// ========================================

// 1. Add import at the top (if not already there):

// 2. Update the createImmediateSlot function (around line 90-130):

const createImmediateSlot = async () => {
    // ... existing validation code ...

    const course = db.getCourse(formData.courseId);
    if (!course) return;

    // Create appointment
    const newAppointment: Appointment = {
        id: `appt-${Date.now()}`,
        userId: formData.courseId,
        courseId: formData.courseId,
        trainerId: formData.trainerId,
        topic: course.title,
        date: formData.date,
        time: formData.time,
        status: "Approved",
        description: "Admin-scheduled immediate session",
        createdAt: new Date().toISOString(),
        duration: course.duration,
        meetingLink: formData.meetingLink || undefined
    };

    db.createAppointment(newAppointment);

    // Log the action
    db.addSystemLog({
        userId: user?.id || "system",
        action: "Admin created immediate slot",
        category: "course",
        details: `Created immediate slot for ${course.title}`
    });

    // Create notification for trainer
    db.createNotification({
        userId: formData.trainerId,
        title: "🎯 Admin Scheduled Session",
        message: `New immediate session: ${course.title} on ${formData.date} at ${formData.time}`,
        type: "info",
        category: "appointment"
    });

    // --- NEW: Email to trainer ---
    const trainer = db.getUser(formData.trainerId);
    if (trainer && trainer.email) {
        try {
            await notificationService.sendEmail({
                to: trainer.email,
                subject: "New Session Scheduled by Admin",
                body: `A new session has been scheduled:\n\nCourse: ${course.title}\nDate: ${formData.date}\nTime: ${formData.time}\n${formData.meetingLink ? `Meeting Link: ${formData.meetingLink}` : ''}`,
                html: `<div style="font-family: Arial, sans-serif;">
                    <h2>New Session Scheduled</h2>
                    <p>An admin has scheduled a new session for you:</p>
                    <ul>
                        <li><strong>Course:</strong> ${course.title}</li>
                        <li><strong>Date:</strong> ${formData.date}</li>
                        <li><strong>Time:</strong> ${formData.time}</li>
                        ${formData.meetingLink ? `<li><strong>Meeting Link:</strong> <a href="${formData.meetingLink}">${formData.meetingLink}</a></li>` : ''}
                    </ul>
                </div>`
            });
            console.log(`✉️ Session email sent to trainer ${trainer.email}`);
        } catch (error) {
            console.error("Failed to send trainer email:", error);
        }
    }
    // --- END NEW CODE ---

    // Get all students enrolled in this course
    course.studentsEnrolled.forEach(async (studentId) => {
        db.createNotification({
            userId: studentId,
            title: "🚀 Surprise Class Alert!",
            message: `Immediate session scheduled: ${course.title} on ${formData.date} at ${formData.time}`,
            type: "success",
            category: "appointment"
        });

        // --- NEW: Email to each student ---
        const student = db.getUser(studentId);
        if (student && student.email) {
            const emailContent = notificationService.templates.appointmentApproved(
                student.name,
                course.title,
                formData.date,
                formData.time,
                formData.meetingLink
            );

            try {
                await notificationService.sendEmail({
                    to: student.email,
                    ...emailContent
                });
                console.log(`✉️ Session email sent to student ${student.email}`);
            } catch (error) {
                console.error(`Failed to send email to ${student.email}:`, error);
            }
        }
        // --- END NEW CODE ---
    });

    toast.success(`Immediate slot created and notified ${course.studentsEnrolled.length} students`);
    setShowImmediateSlot(false);
    resetForm();
};

// ========================================
// OPTIONAL: SESSION REMINDER SERVICE
// Create new file: src/lib/reminderService.ts
// ========================================

import { db } from "./db";

class ReminderService {
    private intervalId: NodeJS.Timeout | null = null;

    // Start the reminder service
    start() {
        // Check every hour for upcoming sessions
        this.intervalId = setInterval(() => {
            this.checkUpcomingSessions();
        }, 60 * 60 * 1000); // 1 hour

        // Also check immediately on start
        this.checkUpcomingSessions();
    }

    // Stop the reminder service
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    private async checkUpcomingSessions() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const allAppointments = db.getAppointments();

        // Filter appointments happening within 24 hours
        const upcomingAppointments = allAppointments.filter(appt => {
            if (appt.status !== "Approved") return false;

            const apptDate = new Date(`${appt.date} ${appt.time}`);
            const hoursUntil = (apptDate.getTime() - now.getTime()) / (1000 * 60 * 60);

            // Sessions happening in 24 hours
            return hoursUntil > 0 && hoursUntil <= 24;
        });

        console.log(`🔔 Found ${upcomingAppointments.length} upcoming sessions`);

        // Send reminders
        for (const appt of upcomingAppointments) {
            await this.sendReminder(appt);
        }
    }

    private async sendReminder(appt: any) {
        const student = db.getUser(appt.userId);
        if (!student || !student.email) return;

        const course = db.getCourse(appt.courseId);
        if (!course) return;

        // Check if we've already sent a reminder (to avoid duplicates)
        const reminderKey = `reminder_sent_${appt.id}`;
        const alreadySent = localStorage.getItem(reminderKey);
        if (alreadySent) return;

        // Send email reminder
        try {
            await notificationService.sendEmail({
                to: student.email,
                subject: `Reminder: Class Tomorrow - ${course.title}`,
                body: `Hi ${student.name},\n\nThis is a friendly reminder about your upcoming class:\n\nCourse: ${course.title}\nDate: ${appt.date}\nTime: ${appt.time}\n${appt.meetingLink ? `\nMeeting Link: ${appt.meetingLink}` : ''}\n\nSee you soon!\n\nBest regards,\nClassBook Team`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #4F46E5;">⏰ Class Reminder</h2>
                        <p>Hi ${student.name},</p>
                        <p>This is a friendly reminder about your upcoming class:</p>
                        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Course:</strong> ${course.title}</p>
                            <p><strong>Date:</strong> ${appt.date}</p>
                            <p><strong>Time:</strong> ${appt.time}</p>
                            ${appt.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${appt.meetingLink}">${appt.meetingLink}</a></p>` : ''}
                        </div>
                        <p>See you soon!</p>
                        <p>Best regards,<br>ClassBook Team</p>
                    </div>
                `
            });

            // Mark as sent
            localStorage.setItem(reminderKey, 'true');
            console.log(`✉️ Reminder sent to ${student.email} for session on ${appt.date}`);
        } catch (error) {
            console.error("Failed to send reminder:", error);
        }
    }
}

export const reminderService = new ReminderService();

// ========================================
// USAGE IN APP.TSX OR MAIN COMPONENT
// ========================================

// In src/App.tsx, add inside the App component:

import { reminderService } from "@/lib/reminderService";
import { useEffect } from "react";

// Inside App component:
useEffect(() => {
    // Start reminder service
    reminderService.start();

    return () => {
        // Stop on unmount
        reminderService.stop();
    };
}, []);

// ========================================
// SUMMARY OF CHANGES
// ========================================

// Files to modify:
// 1. src/pages/trainer/TrainerRequests.tsx - Add email on approve/reject
// 2. src/pages/admin/AdminSlots.tsx - Add email when creating slots
// 3. src/lib/reminderService.ts - NEW FILE for session reminders (optional)
// 4. src/App.tsx - Start reminder service (optional)

// No installation needed - notificationService already exists!
// All emails will currently log to console (mock mode)
// To enable real emails, configure Gmail SMTP in notificationService

// ========================================
// TESTING
// ========================================

// 1. Approve an appointment as trainer
//    → Check console for email log
//    → Check student receives in-app notification

// 2. Reject an appointment as trainer
//    → Check console for email log
//    → Check student receives in-app notification

// 3. Create immediate slot as admin
//    → Check console for multiple email logs (trainer + all students)
//    → Check all recipients receive in-app notifications

// 4. Wait 24 hours before a session (or modify timing for testing)
//    → Check console for reminder email logs
