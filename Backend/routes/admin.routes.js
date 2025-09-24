import express from "express";
const router = express.Router();
import {
  getRegistrations,
  updateRegistration,
  bulkApproveByEmails,
  getStats,
} from "../controllers/admin.controller.js";
import protect, { requireRoles } from "../middleware/authMiddleware.js";

router.get("/registrations", protect, requireRoles("admin", "manager", "hod"), getRegistrations);
router.put("/registrations/:id", protect, requireRoles("admin", "manager"), updateRegistration);
router.post("/registrations/bulk-approve", protect, requireRoles("admin"), bulkApproveByEmails);
router.get("/stats", protect, requireRoles("admin", "manager", "hod"), getStats);

export default router;
