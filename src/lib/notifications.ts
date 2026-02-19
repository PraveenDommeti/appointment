// Notification Service for Email and WhatsApp
// This service handles all notification delivery

export interface EmailConfig {
    to: string;
    subject: string;
    body: string;
    html?: string;
}

export interface WhatsAppConfig {
    to: string;
    message: string;
}

class NotificationService {
    private emailEnabled = false; // Set to true when Gmail SMTP is configured
    private whatsappEnabled = false; // Set to true when WhatsApp Business API is configured

    // Email Notification (Gmail SMTP)
    async sendEmail(config: EmailConfig): Promise<boolean> {
        if (!this.emailEnabled) {
            console.log("📧 [EMAIL MOCK]", config);
            return true;
        }

        try {
            // TODO: Implement actual Gmail SMTP integration
            // Example using nodemailer (requires backend):
            // const transporter = nodemailer.createTransport({
            //     service: 'gmail',
            //     auth: {
            //         user: process.env.GMAIL_USER,
            //         pass: process.env.GMAIL_APP_PASSWORD
            //     }
            // });
            // await transporter.sendMail({
            //     from: process.env.GMAIL_USER,
            //     to: config.to,
            //     subject: config.subject,
            //     text: config.body,
            //     html: config.html
            // });

            console.log("📧 Email sent to:", config.to);
            return true;
        } catch (error) {
            console.error("Failed to send email:", error);
            return false;
        }
    }

    // WhatsApp Notification (WhatsApp Business API)
    async sendWhatsApp(config: WhatsAppConfig): Promise<boolean> {
        if (!this.whatsappEnabled) {
            console.log("📱 [WHATSAPP MOCK]", config);
            return true;
        }

        try {
            // TODO: Implement actual WhatsApp Business API integration
            // Example using Twilio WhatsApp API:
            // const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json', {
            //     method: 'POST',
            //     headers: {
            //         'Authorization': 'Basic ' + btoa('YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN'),
            //         'Content-Type': 'application/x-www-form-urlencoded'
            //     },
            //     body: new URLSearchParams({
            //         From: 'whatsapp:+14155238886',
            //         To: `whatsapp:${config.to}`,
            //         Body: config.message
            //     })
            // });

            console.log("📱 WhatsApp sent to:", config.to);
            return true;
        } catch (error) {
            console.error("Failed to send WhatsApp:", error);
            return false;
        }
    }

    // Notification Templates
    templates = {
        appointmentApproved: (studentName: string, topic: string, date: string, time: string, meetingLink?: string) => ({
            subject: "Class Appointment Approved ✅",
            body: `Hi ${studentName},\n\nYour class appointment has been approved!\n\nTopic: ${topic}\nDate: ${date}\nTime: ${time}\n${meetingLink ? `\nMeeting Link: ${meetingLink}` : ''}\n\nSee you in class!\n\nBest regards,\nClassBook Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4F46E5;">Class Appointment Approved ✅</h2>
                    <p>Hi ${studentName},</p>
                    <p>Your class appointment has been approved!</p>
                    <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Topic:</strong> ${topic}</p>
                        <p><strong>Date:</strong> ${date}</p>
                        <p><strong>Time:</strong> ${time}</p>
                        ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
                    </div>
                    <p>See you in class!</p>
                    <p>Best regards,<br>ClassBook Team</p>
                </div>
            `
        }),

        appointmentRejected: (studentName: string, topic: string, reason?: string) => ({
            subject: "Class Appointment Update",
            body: `Hi ${studentName},\n\nUnfortunately, your class appointment for "${topic}" could not be approved at this time.\n${reason ? `\nReason: ${reason}` : ''}\n\nPlease try booking another slot or contact your trainer for more information.\n\nBest regards,\nClassBook Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #DC2626;">Class Appointment Update</h2>
                    <p>Hi ${studentName},</p>
                    <p>Unfortunately, your class appointment for "<strong>${topic}</strong>" could not be approved at this time.</p>
                    ${reason ? `<p><em>Reason: ${reason}</em></p>` : ''}
                    <p>Please try booking another slot or contact your trainer for more information.</p>
                    <p>Best regards,<br>ClassBook Team</p>
                </div>
            `
        }),

        meetingLinkSent: (studentName: string, topic: string, link: string, description: string) => ({
            subject: "Meeting Link for Your Class 🎓",
            body: `Hi ${studentName},\n\nYour meeting link is ready!\n\nClass: ${topic}\nDescription: ${description}\n\nJoin here: ${link}\n\nBest regards,\nClassBook Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #10B981;">Meeting Link Ready 🎓</h2>
                    <p>Hi ${studentName},</p>
                    <p>Your meeting link is ready!</p>
                    <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Class:</strong> ${topic}</p>
                        <p><strong>Description:</strong> ${description}</p>
                        <a href="${link}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">Join Meeting</a>
                    </div>
                    <p>Best regards,<br>ClassBook Team</p>
                </div>
            `
        }),

        leaveApproved: (studentName: string, startDate: string, endDate: string) => ({
            subject: "Leave Request Approved ✅",
            body: `Hi ${studentName},\n\nYour leave request has been approved.\n\nFrom: ${startDate}\nTo: ${endDate}\n\nEnjoy your time off!\n\nBest regards,\nClassBook Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #10B981;">Leave Request Approved ✅</h2>
                    <p>Hi ${studentName},</p>
                    <p>Your leave request has been approved.</p>
                    <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>From:</strong> ${startDate}</p>
                        <p><strong>To:</strong> ${endDate}</p>
                    </div>
                    <p>Enjoy your time off!</p>
                    <p>Best regards,<br>ClassBook Team</p>
                </div>
            `
        }),

        timesheetApproved: (studentName: string, hours: number, date: string) => ({
            subject: "Timesheet Approved ✅",
            body: `Hi ${studentName},\n\nYour timesheet has been approved.\n\nHours: ${hours}\nDate: ${date}\n\nBest regards,\nClassBook Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #10B981;">Timesheet Approved ✅</h2>
                    <p>Hi ${studentName},</p>
                    <p>Your timesheet has been approved.</p>
                    <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Hours:</strong> ${hours}</p>
                        <p><strong>Date:</strong> ${date}</p>
                    </div>
                    <p>Best regards,<br>ClassBook Team</p>
                </div>
            `
        }),

        newStudentSignup: (adminName: string, studentName: string, studentEmail: string) => ({
            subject: "New Student Registration 🎉",
            body: `Hi ${adminName},\n\nA new student has registered!\n\nName: ${studentName}\nEmail: ${studentEmail}\n\nPlease review their account in the admin dashboard.\n\nBest regards,\nClassBook System`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4F46E5;">New Student Registration 🎉</h2>
                    <p>Hi ${adminName},</p>
                    <p>A new student has registered!</p>
                    <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Name:</strong> ${studentName}</p>
                        <p><strong>Email:</strong> ${studentEmail}</p>
                    </div>
                    <p>Please review their account in the admin dashboard.</p>
                    <p>Best regards,<br>ClassBook System</p>
                </div>
            `
        })
    };

    // Enable/Disable services
    enableEmail() {
        this.emailEnabled = true;
    }

    disableEmail() {
        this.emailEnabled = false;
    }

    enableWhatsApp() {
        this.whatsappEnabled = true;
    }

    disableWhatsApp() {
        this.whatsappEnabled = false;
    }
}

export const notificationService = new NotificationService();
