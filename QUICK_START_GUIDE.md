# ⚡ QUICK START GUIDE - Finish Remaining Features

## 🎯 YOU HAVE 3 TASKS LEFT (~2 hours total)

---

## ✅ TASK 1: Complete Broadcast UI (15 minutes)

**File to Edit:** `src/pages/admin/AdminMessages.tsx`

### Step 1: Add Missing Imports (Top of file)
Find the import section and add:
```tsx
import { toast } from "sonner";
import { Radio } from "lucide-react";
```

Also ensure these exist:
```tsx
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
```

### Step 2: Fix Syntax Error
Find line ~92 in `handleBroadcast` function:
```tsx
// CHANGE THIS:
setShowBroadcast(false)

// TO THIS:
setShowBroadcast(false);  // Add semicolon
```

### Step 3: Add Broadcast Button
Find the Plus button (around line 79-81) and add this button next to it:
```tsx
<Button 
    variant="ghost" 
    size="icon" 
    className="rounded-full bg-primary/10 h-10 w-10"
    onClick={() => setShowBroadcast(true)}
>
    <Radio className="h-5 w-5 text-primary" />
</Button>
```

### Step 4: Add Dialog Component
At the end of the component (before the last closing `</div>`), add:
```tsx
<Dialog open={showBroadcast} onOpenChange={setShowBroadcast}>
    <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
            <DialogTitle className="text-2xl font-black">📢 Broadcast Message</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
            <div className="space-y-2">
                <Label>Send To</Label>
                <Select value={broadcastFilter} onValueChange={setBroadcastFilter}>
                    <SelectTrigger className="rounded-xl">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="student">Students Only</SelectItem>
                        <SelectItem value="trainer">Trainers Only</SelectItem>
                        <SelectItem value="admin">Admins Only</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                    placeholder="Type your broadcast message..."
                    className="rounded-xl min-h-[100px]"
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                />
            </div>
        </div>
        <DialogFooter>
            <Button onClick={handleBroadcast} className="w-full rounded-xl">
                Send Broadcast
            </Button>
        </DialogFooter>
    </DialogContent>
</Dialog>
```

### ✅ Done! Test it:
1. Login as Admin
2. Go to Messages
3. Click the Radio button icon
4. Select "All Users"
5. Type a message and send
6. Check that all users receive it

---

## ✅ TASK 2: Implement Password Hashing (45 minutes)

### Step 1: Install bcryptjs
```bash
npm install bcryptjs @types/bcryptjs
```

### Step 2: Update AuthContext
**File:** `src/context/AuthContext.tsx`

Add import at the top:
```tsx
import bcrypt from 'bcryptjs';
```

### Step 3: Update Signup Function (around line 73-115)
Replace the password storage with:
```tsx
// Hash the password
const hashedPassword = await bcrypt.hash(password, 10);

const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    email,
    role,
    status: "Active",
    joinedDate: new Date().toISOString().split('T')[0],
    performanceScore: 0,
    password: hashedPassword  // Store hashed password
};
```

### Step 4: Update Login Function (around line 117-173)
Replace password verification with:
```tsx
// Verify password
const isPasswordValid = await bcrypt.compare(password, foundUser.password || "");

if (!isPasswordValid) {
    // Temporary backward compatibility
    if (foundUser.password !== password) {
        throw new Error("Invalid email or password");
    }
}
```

### ✅ Done! Test it:
1. Create a new user account
2. Check localStorage - password should be hashed (starts with `$2a$`)
3. Login with the account - should work
4. Try wrong password - should fail

**Note:** Full implementation code is in `PASSWORD_HASHING_IMPLEMENTATION.tsx`

---

## ✅ TASK 3: Integrate Email Service (1 hour)

### Part A: Update TrainerRequests.tsx (30 min)

**File:** `src/pages/trainer/TrainerRequests.tsx`

Add import:
```tsx
import { notificationService } from "@/lib/notifications";
```

In `handleApprove` function, add after creating notification:
```tsx
// Send email notification
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
    
    await notificationService.sendEmail({
        to: student.email,
        ...emailContent
    });
}
```

In `handleReject` function, add:
```tsx
// Send email notification
const student = db.getUser(appt.userId);
if (student && student.email) {
    const course = db.getCourse(appt.courseId);
    const emailContent = notificationService.templates.appointmentRejected(
        student.name,
        course?.title || appt.topic,
        rejectionReason
    );
    
    await notificationService.sendEmail({
        to: student.email,
        ...emailContent
    });
}
```

### Part B: Update AdminSlots.tsx (30 min)

**File:** `src/pages/admin/AdminSlots.tsx`

Add import:
```tsx
import { notificationService } from "@/lib/notifications";
```

In `createImmediateSlot`, inside the `course.studentsEnrolled.forEach` loop:
```tsx
course.studentsEnrolled.forEach(async (studentId) => {
    // ... existing notification code ...
    
    // Add email
    const student = db.getUser(studentId);
    if (student && student.email) {
        const emailContent = notificationService.templates.appointmentApproved(
            student.name,
            course.title,
            formData.date,
            formData.time,
            formData.meetingLink
        );
        
        await notificationService.sendEmail({
            to: student.email,
            ...emailContent
        });
    }
});
```

### ✅ Done! Test it:
1. Approve an appointment - check console for email log
2. Reject an appointment - check console for email log
3. Create admin slot - check console for multiple email logs

**Note:** Emails will log to console until you configure Gmail SMTP. Full implementation in `EMAIL_INTEGRATION_IMPLEMENTATION.tsx`

---

## 🎉 YOU'RE DONE!

After completing these 3 tasks:
- ✅ Broadcast messaging works
- ✅ Passwords are hashed
- ✅ Email notifications are integrated

**Total Time: ~2 hours**

---

## 📚 Reference Documents

If you need more details:
1. **`FEATURE_IMPLEMENTATION_STATUS.md`** - Overall status
2. **`PASSWORD_HASHING_IMPLEMENTATION.tsx`** - Complete password code
3. **`EMAIL_INTEGRATION_IMPLEMENTATION.tsx`** - Complete email code
4. **`IMPLEMENTATION_SUMMARY_FEB17.md`** - Detailed summary

---

## ⚠️ TROUBLESHOOTING

**Broadcast UI not showing?**
- Check you added all imports
- Verify the dialog is before the closing `</div>`
- Check browser console for errors

**Password hashing errors?**
- Ensure bcryptjs is installed: `npm list bcryptjs`
- Check you added `import bcrypt from 'bcryptjs'`
- Make sure signup and login are `async` functions

**Email not logging?**
- Check you imported `notificationService`
- Verify you're calling `await notificationService.sendEmail(...)`
- Check browser console for logs starting with "📧"

---

**Last Updated:** February 17, 2026 17:35 IST  
**Quick Reference Version:** 1.0
