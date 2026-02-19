
import SuperAdminLayout from "@/components/superadmin/SuperAdminLayout";
import { useAuth } from "@/context/AuthContext";
import { Routes, Route } from "react-router-dom";
import SuperAdminHome from "./superadmin/SuperAdminHome";
import SuperAdminAdmins from "./superadmin/SuperAdminAdmins";
import SuperAdminUsers from "./superadmin/SuperAdminUsers";
import SuperAdminSettings from "./superadmin/SuperAdminSettings";
import SuperAdminLogs from "./superadmin/SuperAdminLogs";
import AdminReports from "./admin/AdminReports";

import SuperAdminTimesheets from "./superadmin/SuperAdminTimesheets";

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  return (
    <SuperAdminLayout userName={user?.name || "Super Admin"}>
      <Routes>
        <Route path="/" element={<SuperAdminHome />} />
        <Route path="/timesheets" element={<SuperAdminTimesheets />} />
        <Route path="/admins" element={<SuperAdminAdmins />} />
        <Route path="/users" element={<SuperAdminUsers />} />
        <Route path="/analytics" element={<AdminReports />} />
        <Route path="/settings" element={<SuperAdminSettings />} />
        <Route path="/logs" element={<SuperAdminLogs />} />
      </Routes>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
