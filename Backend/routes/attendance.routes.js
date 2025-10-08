import express from "express";
import protect, { requireRoles } from "../middleware/authMiddleware.js";
import { assignManager, listAssignments, getAttendance, submitAttendance, listMyAttendance, listAllAttendance } from "../controllers/attendance.controller.js";

const router = express.Router();

// Admin assigns managers to events
router.post(
  "/assign",
  protect,
  requireRoles("admin"),
  assignManager
);

// View assignments (admin) or self assignments (manager via ?managerId=me)
router.get(
  "/assignments",
  protect,
  requireRoles("admin", "manager"),
  (req, res, next) => {
    if (req.query.managerId === "me") req.query.managerId = req.user._id.toString();
    next();
  },
  listAssignments
);

// Get attendance for an event/date/session
router.get(
  "/:categoryId/events/:eventId/attendance",
  protect,
  requireRoles("admin", "manager"),
  getAttendance
);

// Submit attendance for an event
router.post(
  "/:categoryId/events/:eventId/attendance",
  protect,
  requireRoles("admin", "manager"),
  submitAttendance
);

export default router;

// User profile: my attendance
router.get(
  "/me",
  protect,
  requireRoles("user", "admin", "manager", "hod"),
  listMyAttendance
);

// Admin overview
router.get(
  "/all",
  protect,
  requireRoles("admin"),
  listAllAttendance
);


