
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { Routes, Route } from "react-router-dom";
import TrainerHome from "./trainer/TrainerHome";
import TrainerSchedule from "./trainer/TrainerSchedule";
import TrainerStudents from "./trainer/TrainerStudents";
import TrainerRequests from "./trainer/TrainerRequests";
import TrainerTimesheet from "./trainer/TrainerTimesheet";
import TrainerMessages from "./trainer/TrainerMessages";
import TrainerSettings from "./trainer/TrainerSettings";
import TrainerAnalytics from "./trainer/TrainerAnalytics";
import TrainerSlots from "./trainer/TrainerSlots";
import TrainerMaterials from "./trainer/TrainerMaterials";
import TrainerCourses from "./trainer/TrainerCourses";
import TrainerAttendance from "./trainer/TrainerAttendance";
import TrainerLeaveRequests from "./trainer/TrainerLeaveRequests";

const TrainerDashboard = () => {
  const { user } = useAuth();
  return (
    <DashboardLayout role="trainer" userName={user?.name || "Trainer"}>
      <Routes>
        <Route path="/" element={<TrainerHome />} />
        <Route path="/courses" element={<TrainerCourses />} />
        <Route path="/requests" element={<TrainerRequests />} />
        <Route path="/schedule" element={<TrainerSchedule />} />
        <Route path="/students" element={<TrainerStudents />} />
        <Route path="/attendance" element={<TrainerAttendance />} />
        <Route path="/leave-requests" element={<TrainerLeaveRequests />} />
        <Route path="/timesheet" element={<TrainerTimesheet />} />
        <Route path="/messages" element={<TrainerMessages />} />
        <Route path="/settings" element={<TrainerSettings />} />
        <Route path="/analytics" element={<TrainerAnalytics />} />
        <Route path="/slots" element={<TrainerSlots />} />
        <Route path="/materials" element={<TrainerMaterials />} />
      </Routes>
    </DashboardLayout>
  );
};

export default TrainerDashboard;
