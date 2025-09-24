import express from "express";
import { register, login, allUsers, verifyUser, sendVerificationOTP, verifyOTP, sendPasswordResetOTP, resetPassword, updateHasEntered } from "../controllers/user.controller.js";
import multer from "multer";
import path from "path";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });


router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

router.post("/register", register);
router.post("/login", login);
router.get("/all-users", allUsers);
router.get("/me", protect, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      college: user.college,
      collegeId: user.collegeId,
      state: user.state,
      address: user.address,
      paymentStatus: user.paymentStatus,
      isApproved: user.isApproved,
      role: user.role,
      hasEntered: user.hasEntered,
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});
router.get("/verify-user", protect, async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
}, verifyUser);
router.post("/send-verification-otp", sendVerificationOTP);
router.post("/verify-otp", verifyOTP);
router.post("/send-reset-otp", sendPasswordResetOTP);
router.post("/reset-password", resetPassword);
router.post("/update-has-entered", updateHasEntered);

export default router;
