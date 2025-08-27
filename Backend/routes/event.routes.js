import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  createEventInCategory,
  updateEventInCategory,
  createCategory,
  deleteEventInCategory,
  getRegisteredEvents,
} from "../controllers/events.controller.js";

const router = express.Router();


router.get("/registered", protect, getRegisteredEvents);


router.post("/", createEvent);


router.get("/", getAllEvents);


router.get("/:id", getEventById);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

router.post("/category", createCategory);
router.post("/:categoryId/events", createEventInCategory);
router.put("/:categoryId/events/:eventId", updateEventInCategory);
router.delete("/:categoryId/events/:eventId", deleteEventInCategory);
router.post("/:categoryId/events/:eventId/register", protect, registerForEvent);
router.delete("/:categoryId/events/:eventId/unregister", protect, unregisterFromEvent);

export default router;
