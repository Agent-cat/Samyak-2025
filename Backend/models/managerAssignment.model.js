import mongoose from "mongoose";

const managerAssignmentSchema = new mongoose.Schema(
  {
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    subcategoryId: { type: mongoose.Schema.Types.ObjectId, required: false },
    eventId: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

managerAssignmentSchema.index(
  { manager: 1, categoryId: 1, subcategoryId: 1, eventId: 1 },
  { unique: true }
);

const ManagerAssignment = mongoose.model("ManagerAssignment", managerAssignmentSchema);

export default ManagerAssignment;


