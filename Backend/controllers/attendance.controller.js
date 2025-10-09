import Event from "../models/events.model.js";
import Attendance from "../models/attendance.model.js";
import ManagerAssignment from "../models/managerAssignment.model.js";
import User from "../models/user.model.js";
import { enqueueCertificateEmail } from "../queue/emailQueue.js";

const findEventRefs = async ({ categoryId, subcategoryId, eventId }) => {
  const category = await Event.findById(categoryId).lean();
  if (!category) return { error: "Category not found" };
  if (subcategoryId) {
    const sub = (category.subcategories || []).find((s) => s._id.toString() === String(subcategoryId));
    if (!sub) return { error: "Subcategory not found" };
    const ev = (sub.Events || []).find((e) => e._id.toString() === String(eventId));
    if (!ev) return { error: "Event not found" };
    return { category, subcategory: sub, event: ev };
  }
  const ev = (category.Events || []).find((e) => e._id.toString() === String(eventId));
  if (!ev) return { error: "Event not found" };
  return { category, subcategory: null, event: ev };
};

const assertManagerAllowed = async (userId, refs) => {
  // Admins are implicitly allowed via route guard; here focus on manager scope
  const assignment = await ManagerAssignment.findOne({
    manager: userId,
    categoryId: refs.category._id,
    subcategoryId: refs.subcategory ? refs.subcategory._id : null,
    eventId: refs.event._id,
  });
  return Boolean(assignment);
};

export const assignManager = async (req, res) => {
  try {
    const { managerId, categoryId, subcategoryId = null, eventId } = req.body;
    const refs = await findEventRefs({ categoryId, subcategoryId, eventId });
    if (refs.error) return res.status(404).json({ message: refs.error });

    const record = await ManagerAssignment.findOneAndUpdate(
      {
        manager: managerId,
        categoryId,
        subcategoryId: subcategoryId || null,
        eventId,
      },
      {
        manager: managerId,
        categoryId,
        subcategoryId: subcategoryId || null,
        eventId,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(200).json(record);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const listAssignments = async (req, res) => {
  try {
    const { managerId } = req.query;
    const query = managerId ? { manager: managerId } : {};
    const list = await ManagerAssignment.find(query).lean();
    res.status(200).json(list);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getAttendance = async (req, res) => {
  try {
    const { categoryId, eventId } = req.params;
    const { subcategoryId = null, date, session = "full" } = req.query;
    const refs = await findEventRefs({ categoryId, subcategoryId, eventId });
    if (refs.error) return res.status(404).json({ message: refs.error });

    // Only admin or assigned manager can view
    if (req.user.role === "manager") {
      const allowed = await assertManagerAllowed(req.user._id, refs);
      if (!allowed) return res.status(403).json({ message: "Not assigned to this event" });
    }

    const filter = {
      categoryId,
      subcategoryId: subcategoryId || null,
      eventId,
    };
    if (date) filter.date = date;
    if (session) filter.session = session;

    const doc = await Attendance.findOne(filter)
      .populate("entries.user", "fullName email college collegeId")
      .lean();
    res.status(200).json(doc || { ...filter, entries: [] });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const submitAttendance = async (req, res) => {
  try {
    const { categoryId, eventId } = req.params;
    const { subcategoryId = null } = req.query;
    const { date, session = "full", entries } = req.body;

    if (!Array.isArray(entries)) {
      return res.status(400).json({ message: "entries array is required" });
    }
    if (!date) {
      return res.status(400).json({ message: "date is required (YYYY-MM-DD)" });
    }

    const refs = await findEventRefs({ categoryId, subcategoryId, eventId });
    if (refs.error) return res.status(404).json({ message: refs.error });

    // Only admin or assigned manager can submit
    if (req.user.role === "manager") {
      const allowed = await assertManagerAllowed(req.user._id, refs);
      if (!allowed) return res.status(403).json({ message: "Not assigned to this event" });
    }

    // Only registered students can be marked
    const registeredIds = new Set(
      (refs.event.registeredStudents || []).map((id) => String(id))
    );

    const sanitized = entries
      .filter((e) => registeredIds.has(String(e.user)))
      .map((e) => ({ user: e.user, status: e.status === "present" ? "present" : "absent", markedBy: req.user._id }));

    // Prevent editing once submitted: if a document already exists, block
    const existing = await Attendance.findOne({
      categoryId,
      subcategoryId: subcategoryId || null,
      eventId,
      date,
      session,
    }).lean();

    if (existing) {
      if (req.user.role !== "admin") {
        return res.status(409).json({ message: "Attendance already submitted for this event/date/session" });
      }
      // Admin is allowed to overwrite the existing attendance
    }

    const doc = await Attendance.findOneAndUpdate(
      {
        categoryId,
        subcategoryId: subcategoryId || null,
        eventId,
        date,
        session,
      },
      {
        $set: {
          categoryId,
          subcategoryId: subcategoryId || null,
          eventId,
          date,
          session,
          entries: sanitized,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Enqueue certificate emails to Redis queue (processed by worker)
    ;(async () => {
      try {
        const refs2 = await findEventRefs({ categoryId, subcategoryId, eventId });
        const eventTitle = refs2?.event?.title || "SAMYAK Event";
        const users = await User.find({ _id: { $in: sanitized.map((s) => s.user) } }).select('email fullName college collegeId').lean();
        const userById = new Map(users.map((u) => [String(u._id), u]));
        for (const e of sanitized) {
          const u = userById.get(String(e.user));
          if (!u || !u.email) continue;
          await enqueueCertificateEmail({
            toEmail: u.email,
            fullName: u.fullName,
            college: u.college,
            collegeId: u.collegeId,
            eventTitle,
          });
        }
      } catch (err) {
        console.error('Queueing certificate email error:', err);
      }
    })();

    res.status(200).json(doc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const listMyAttendance = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const docs = await Attendance.find({ "entries.user": userId })
      .select("categoryId subcategoryId eventId date session entries")
      .lean();

    // Build quick lookup for event titles
    const categories = await Event.find({ _id: { $in: docs.map((d) => d.categoryId) } }).lean();

    const catById = new Map(categories.map((c) => [c._id.toString(), c]));
    const result = [];
    for (const d of docs) {
      const cat = catById.get(d.categoryId.toString());
      let title = "";
      if (d.subcategoryId) {
        const sub = (cat?.subcategories || []).find((s) => s._id.toString() === d.subcategoryId.toString());
        const ev = sub ? (sub.Events || []).find((e) => e._id.toString() === d.eventId.toString()) : null;
        title = ev?.title || "";
      } else {
        const ev = (cat?.Events || []).find((e) => e._id.toString() === d.eventId.toString());
        title = ev?.title || "";
      }
      const myEntry = (d.entries || []).find((e) => e.user.toString() === userId);
      if (myEntry) {
        result.push({
          categoryId: d.categoryId,
          subcategoryId: d.subcategoryId || null,
          eventId: d.eventId,
          eventTitle: title,
          date: d.date,
          session: d.session,
          status: myEntry.status,
          markedAt: myEntry.markedAt,
        });
      }
    }

    res.status(200).json(result.sort((a, b) => String(b.date).localeCompare(String(a.date))));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const listAllAttendance = async (req, res) => {
  try {
    // Admin overview: list attendance documents with counts
    const docs = await Attendance.find({})
      .select("categoryId subcategoryId eventId date session entries createdAt updatedAt")
      .lean();
    const categories = await Event.find({ _id: { $in: docs.map((d) => d.categoryId) } }).lean();
    const catById = new Map(categories.map((c) => [c._id.toString(), c]));

    const out = docs.map((d) => {
      const cat = catById.get(d.categoryId.toString());
      let title = "";
      if (d.subcategoryId) {
        const sub = (cat?.subcategories || []).find((s) => s._id.toString() === String(d.subcategoryId));
        const ev = sub ? (sub.Events || []).find((e) => e._id.toString() === String(d.eventId)) : null;
        title = ev?.title || "";
      } else {
        const ev = (cat?.Events || []).find((e) => e._id.toString() === String(d.eventId));
        title = ev?.title || "";
      }
      const present = (d.entries || []).filter((e) => e.status === "present").length;
      const absent = (d.entries || []).filter((e) => e.status === "absent").length;
      return {
        categoryId: d.categoryId,
        subcategoryId: d.subcategoryId || null,
        eventId: d.eventId,
        eventTitle: title,
        date: d.date,
        session: d.session,
        present,
        absent,
        count: (d.entries || []).length,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      };
    });
    res.status(200).json(out.sort((a, b) => String(b.date).localeCompare(String(a.date))));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};


