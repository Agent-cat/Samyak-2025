import User from "../models/user.model.js";
import Event from "../models/events.model.js";
import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import { sendEmailWithAttachment, sendKLUApprovalEmail } from "../utils/emailService.js";

export const getRegistrations = async (req, res) => {
  try {
    const { status, includeKL } = req.query;
    let query = {};
    if (includeKL !== 'true') {
      // Exclude KLU users by email domain, not by provided college string
      query.email = { $not: /@kluniversity\.in$/i };
    }

    if (status && status !== "all") {
      query.paymentStatus = status;
    }

    const registrations = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const registration = await User.findById(id);
    if (!registration) {
      return res.status(404).json({ error: "Registration not found" });
    }

    if (status === "approved") {
      const isKLEmail =
        typeof registration.email === "string" &&
        registration.email.toLowerCase().endsWith("@kluniversity.in");

      // For KL emails: send ERP acknowledgment with credentials; else send QR email
      if (isKLEmail) {
        // Generate a temporary password and set it
        const tempPassword = Math.random().toString(36).slice(2, 10);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);
        registration.password = hashedPassword;
        await sendKLUApprovalEmail(registration.email, tempPassword);
      } else {
        const qrUrl = `${process.env.FRONTEND_URL}/user-details/${registration.email}`;
        const qrCodeDataUrl = await QRCode.toDataURL(qrUrl);
        await sendEmailWithAttachment(registration.email, qrCodeDataUrl, {
          fullName: registration.fullName,
          college: registration.college,
          collegeId: registration.collegeId,
          profileImage: registration.profileImage
        });
      }

      if (!isKLEmail) {
        // For non-KL users, require original password (submitted during pending registration)
        const plainPassword = registration.registrationData?.originalPassword;
        if (!plainPassword) {
          return res
            .status(400)
            .json({ error: "No password found in registration data" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);
        registration.password = hashedPassword;
      }

      // Set approval/payment status for all approved users
      registration.paymentStatus = "approved";
      registration.isApproved = true;
      await registration.save();
    } else if (status === "rejected") {
      registration.paymentStatus = "rejected";
      registration.isApproved = false;
      await registration.save();
    }

    res.status(200).json({
      _id: registration._id,
      email: registration.email,
      college: registration.college,
      paymentStatus: registration.paymentStatus,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const bulkApproveByEmails = async (req, res) => {
  try {
    const { emails } = req.body; // array of email strings
    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: "emails array is required" });
    }

    const normalized = emails.map(e => String(e).toLowerCase().trim());
    const users = await User.find({ email: { $in: normalized } });

    const updated = [];
    const created = [];
    const errors = [];

    // Approve existing users
    for (const user of users) {
      try {
        user.paymentStatus = "approved";
        user.isApproved = true;
        await user.save();
        updated.push({ email: user.email, status: "approved" });
      } catch (err) {
        errors.push({ email: user.email, error: err.message });
      }
    }

    // Create users for emails not found (only for @kluniversity.in)
    const existingSet = new Set(users.map(u => u.email));
    const toCreate = normalized.filter(e => !existingSet.has(e));

    for (const email of toCreate) {
      try {
        const isKLEmail = typeof email === "string" && email.endsWith("@kluniversity.in");
        if (!isKLEmail) {
          // Skip non-KLU emails for auto-create; report as notFound
          created.push({ email, status: "skipped_non_klu" });
          continue;
        }

        // username = number before @
        const username = email.split("@")[0];
        // Generate a temp password
        const tempPassword = Math.random().toString(36).slice(2, 10);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);

        const avatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(username)}`;

        const newUser = new User({
          email,
          password: hashedPassword,
          role: "user",
          college: "kluniversity",
          collegeId: username,
          fullName: username,
          state: "Andhra Pradesh",
          address: "KL University",
          phoneNumber: "0000000000",
          country: "India",
          profileImage: avatarUrl,
          paymentStatus: "approved",
          isApproved: true,
          hasEntered: false,
        });

        await newUser.save();

        // Send credentials email to KLU user
        await sendKLUApprovalEmail(email, tempPassword);

        created.push({ email, status: "created_and_notified" });
      } catch (err) {
        errors.push({ email, error: err.message });
      }
    }

    res.status(200).json({ updated, created, errors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const kluFilter = { email: { $regex: /@kluniversity\.in$/i } };
    const nonKluFilter = { email: { $not: /@kluniversity\.in$/i } };

    const [
      totalUsers,
      kluUsers,
      nonKluUsers,
      approvedCount,
      pendingCount,
      rejectedCount,
      approvedKLU,
      approvedNonKLU,
      enteredCount,
      recentUsers,
      eventDocs
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments(kluFilter),
      User.countDocuments(nonKluFilter),
      User.countDocuments({ paymentStatus: "approved" }),
      User.countDocuments({ paymentStatus: "pending" }),
      User.countDocuments({ paymentStatus: "rejected" }),
      User.countDocuments({ ...kluFilter, paymentStatus: "approved" }),
      User.countDocuments({ ...nonKluFilter, paymentStatus: "approved" }),
      User.countDocuments({ hasEntered: true }),
      User.find({}).select("email college fullName createdAt paymentStatus").sort({ createdAt: -1 }).limit(10),
      Event.find({}).lean()
    ]);

    // Compute event-related stats
    let totalCategories = eventDocs.length;
    let totalSubcategories = 0;
    let totalEvents = 0;
    let totalEventRegistrations = 0;

    for (const cat of eventDocs) {
      const subs = Array.isArray(cat.subcategories) ? cat.subcategories : [];
      totalSubcategories += subs.length;
      const directEvents = Array.isArray(cat.Events) ? cat.Events.length : 0;
      totalEvents += directEvents;
      for (const ev of (cat.Events || [])) {
        totalEventRegistrations += Array.isArray(ev.registeredStudents) ? ev.registeredStudents.length : 0;
      }
      for (const sub of subs) {
        const subEvents = Array.isArray(sub.Events) ? sub.Events : [];
        totalEvents += subEvents.length;
        for (const ev of subEvents) {
          totalEventRegistrations += Array.isArray(ev.registeredStudents) ? ev.registeredStudents.length : 0;
        }
      }
    }

    res.status(200).json({
      users: {
        total: totalUsers,
        klu: kluUsers,
        nonKlu: nonKluUsers,
        payment: {
          approved: approvedCount,
          pending: pendingCount,
          rejected: rejectedCount,
          approvedKLU,
          approvedNonKLU,
        },
        hasEntered: enteredCount,
        recent: recentUsers,
      },
      events: {
        categories: totalCategories,
        subcategories: totalSubcategories,
        events: totalEvents,
        totalRegistrations: totalEventRegistrations,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
