import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../Pages/Home";
import Gallery from "../Pages/Gallery";
import Events from "../Pages/Events";
import Login from "../Pages/Login";
import Register from "../Pages/Register";

import ProtectedRoute from "../utils/ProtectedRoute";
import PaymentPage from "../Pages/PaymentPage";
import AdminPanel from "../Pages/AdminPanel";
import EventsPanel from "../Pages/EventsPanel";
import RegisteredEvents from "../Pages/RegisteredEvents";
import AuthRoute from "../utils/AuthRoute";
import { getUser, getToken } from "../utils/auth";
import PleaseLogin from "../Pages/PleaseLogin";
import ForgotPassword from "../Components/ForgotPassword";
import UserDetails from "../Pages/UserDetails";
import Team from "../Pages/Team";
import AttendanceAssign from "../Pages/AttendanceAssign";
import ManagerAttendance from "../Pages/ManagerAttendance";
import MyProfile from "../Pages/MyProfile";

const NRoutes = () => {
  const user = getUser();
  const token = getToken();
  const serverRole = user?.role; // kept for now; Navbar will refresh from /me
  const isPrivileged = ["admin", "hod", "manager"].includes(serverRole);
  const isAdmin = serverRole === "admin";
  const isManager = serverRole === "manager";

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/team" element={<Team />} />
      <Route path="/events" element={<Events />} />
      <Route
        path="/login"
        element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        }
      />
      <Route
        path="/register"
        element={
          <AuthRoute>
            <Register />
          </AuthRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/registered-events"
        element={
          <ProtectedRoute>
            <RegisteredEvents />
          </ProtectedRoute>
        }
      />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/please-login" element={<PleaseLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            {isPrivileged ? <AdminPanel /> : <Navigate to="/" />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance-assign"
        element={
          <ProtectedRoute>
            {isAdmin ? <AttendanceAssign /> : <Navigate to="/" />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager-attendance"
        element={
          <ProtectedRoute>
            {isManager || isAdmin ? <ManagerAttendance /> : <Navigate to="/" />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/events-panel"
        element={
          <ProtectedRoute>
            {isPrivileged ? <EventsPanel /> : <Navigate to="/" />}
          </ProtectedRoute>
        }
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/user-details/:email"
        element={
          <ProtectedRoute>
            {isAdmin ? <UserDetails /> : <Navigate to="/" />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-profile"
        element={
          <ProtectedRoute>
            <MyProfile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default NRoutes;
