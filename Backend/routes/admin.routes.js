import express from "express";
const router = express.Router();
import {
  getRegistrations,
  updateRegistration,
} from "../controllers/admin.controller.js";

router.get("/registrations", getRegistrations);
router.put("/registrations/:id", updateRegistration);

export default router;
