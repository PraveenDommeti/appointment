
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { Routes, Route } from "react-router-dom";
import AdminHome from "./admin/AdminHome";
import AdminUsers from "./admin/AdminUsers";
import AdminCourses from "./admin/AdminCourses";
import AdminReports from "./admin/AdminReports";
import AdminSettings from "./admin/AdminSettings";
import AdminMeetings from "./admin/AdminMeetings";
import AdminMessages from "./admin/AdminMessages";
import AdminEnrollments from "./admin/AdminEnrollments";
import AdminPerformance from "./admin/AdminPerformance";
import AdminMaterials from "./admin/AdminMaterials";
import AdminSlots from "./admin/AdminSlots";
import AdminStudentTimesheets from "./admin/AdminStudentTimesheets";

import AdminTrainerTimesheets from "./admin/AdminTrainerTimesheets";
import AdminApprovedClasses from "./admin/AdminApprovedClasses";
import AdminLeaveRequests from "./admin/AdminLeaveRequests";

const AdminDashboard = () => {
  const { user } = useAuth();
  return (
    <DashboardLayout role="admin" userName={user?.name || "Admin"}>
      <Routes>
        <Route path="/" element={<AdminHome />} />
        <Route path="/trainer-timesheets" element={<AdminTrainerTimesheets />} />
        <Route path="/student-timesheets" element={<AdminStudentTimesheets />} />
        <Route path="/users" element={<AdminUsers />} />
        <Route path="/courses" element={<AdminCourses />} />
        <Route path="/enrollments" element={<AdminEnrollments />} />
        <Route path="/approved" element={<AdminApprovedClasses />} />
        <Route path="/meetings" element={<AdminMeetings />} />
        <Route path="/leave-requests" element={<AdminLeaveRequests />} />
        <Route path="/materials" element={<AdminMaterials />} />
        <Route path="/performance" element={<AdminPerformance />} />
        <Route path="/slots" element={<AdminSlots />} />
        <Route path="/messages" element={<AdminMessages />} />
        <Route path="/reports" element={<AdminReports />} />
        <Route path="/analytics" element={<AdminReports />} />
        <Route path="/settings" element={<AdminSettings />} />
      </Routes>
    </DashboardLayout>
  );
};

export default AdminDashboard;
