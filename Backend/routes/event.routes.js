import express from "express";
import protect from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";
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
  deleteCategory,
  deleteEventInCategory,
  getRegisteredEvents,
} from "../controllers/events.controller.js";

const router = express.Router();

// Ensure events upload directory exists
const eventsUploadDir = "uploads/events";
if (!fs.existsSync(eventsUploadDir)) {
  fs.mkdirSync(eventsUploadDir, { recursive: true });
}

// Multer storage for event images
const eventsStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, eventsUploadDir + "/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const uploadEventImage = multer({ storage: eventsStorage });

// Upload endpoint for event images
router.post("/upload", uploadEventImage.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/events/${req.file.filename}`;
  res.json({ url: fileUrl });
});


router.get("/registered", protect, getRegisteredEvents);


router.post("/", createEvent);


router.get("/", getAllEvents);


router.get("/:id", getEventById);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

router.post("/category", createCategory);
router.delete("/category/:categoryId", deleteCategory);
router.post("/:categoryId/events", createEventInCategory);
router.put("/:categoryId/events/:eventId", updateEventInCategory);
router.delete("/:categoryId/events/:eventId", deleteEventInCategory);
router.post("/:categoryId/events/:eventId/register", protect, registerForEvent);
router.delete("/:categoryId/events/:eventId/unregister", protect, unregisterFromEvent);

export default router;
