import mongoose from "mongoose";

const attendanceEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["present", "absent"], required: true },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    markedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    subcategoryId: { type: mongoose.Schema.Types.ObjectId, required: false },
    eventId: { type: mongoose.Schema.Types.ObjectId, required: true },
    date: { type: String, required: true },
    session: { type: String, enum: ["morning", "afternoon", "evening", "full"], default: "full" },
    entries: [attendanceEntrySchema],
  },
  { timestamps: true }
);

attendanceSchema.index({ categoryId: 1, subcategoryId: 1, eventId: 1, date: 1, session: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;


