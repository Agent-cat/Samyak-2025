import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOTPEmail} from "../utils/emailService.js";


const otpStore = new Map();

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const register = async (req, res) => {
  try {
    const {
      email,
      password,
      college,
      collegeId,
      fullName,
      paymentId,
      paymentScreenshot,
      state,
      address,
      phoneNumber,
      country,
      otherCountryName,
      profileImage,
    } = req.body;

    const existingUser = await User.findOne({
      $or: [
        { email },
        { phoneNumber }
      ]
    });
    if (existingUser) {
      return res.status(400).json({
        error: existingUser.email === email ?
          "User already exists with this email" :
          "Phone number already registered"
      });
    }
    console.log(college)
    // Treat KL University users by email domain irrespective of provided college value
    const isKLEmail = typeof email === "string" && email.toLowerCase().endsWith("@kluniversity.in");
    if (isKLEmail) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await User.create({
        email,
        password: hashedPassword,
        college,
        collegeId,
        fullName,
        state,
        address,
        phoneNumber,
        country: country === "Other" ? otherCountryName : country,
        profileImage,
        // Allow login but require ERP event fee for event registrations
        paymentStatus: "pending",
        isApproved: true,
        hasEntered: false,
      });

      const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });

      return res.status(201).json({
        _id: newUser._id,
        email: newUser.email,
        college: newUser.college,
        collegeId: newUser.collegeId,
        fullName: newUser.fullName,
        state: newUser.state,
        address: newUser.address,
        paymentStatus: newUser.paymentStatus,
        role: newUser.role,
        token,
      });
    }



    const tempPassword = "pending_" + Math.random().toString(36).slice(2);
    const salt = await bcrypt.genSalt(10);
    const hashedTempPassword = await bcrypt.hash(tempPassword, salt);

    const pendingRegistration = await User.create({
      email,
      password: hashedTempPassword,
      college,
      collegeId,
      fullName,
      state,
      address,
      phoneNumber,
      country: country === "Other" ? otherCountryName : country,
      paymentId,
      paymentScreenshot,
      profileImage,
      paymentStatus: "pending",
      isApproved: false,
      registrationData: {
        originalPassword: password,
        college: college,
        collegeId: collegeId,
        fullName: fullName,
      },
      hasEntered: false,
    });

    res.status(201).json({
      message: "Registration pending admin approval",
      email: pendingRegistration.email,
      paymentStatus: "pending",
      role: pendingRegistration.role,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const allUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (!user.isApproved) {
      if (user.paymentStatus === "rejected") {
        return res.status(403).json({
          error: "Your registration has been rejected. Please contact support.",
          status: "rejected",
        });
      }
      if (user.paymentStatus === "pending") {
        return res.status(403).json({
          error: "Your registration is pending approval. Please wait for admin confirmation.",
          status: "pending",
        });
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(200).json({
      _id: user._id,
      email: user.email,
      college: user.college,
      collegeId: user.collegeId,
      fullName: user.fullName,
      state: user.state,
      address: user.address,
      paymentStatus: user.paymentStatus,
      isApproved: user.isApproved,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email }).select('-password');

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const sendVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    console.log('Received verification request for:', email);

    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const otp = generateOTP();
    const expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    // Store OTP with expiry
    otpStore.set(email, {
      otp,
      expiry: expiryTime
    });

    console.log('Generated OTP:', otp);

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
      throw new Error('Failed to send email. Please try again later.');
    }

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error('Error in sendVerificationOTP:', error);
    const errorMessage = error.code === 'EAUTH'
      ? 'Email service configuration error'
      : error.message || 'Failed to send OTP';
    res.status(500).json({ error: errorMessage });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const storedOTPData = otpStore.get(email);
    if (!storedOTPData) {
      return res.status(400).json({ error: "OTP not found or expired. Please request a new one." });
    }

    if (Date.now() > storedOTPData.expiry) {
      otpStore.delete(email);
      return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }

    if (storedOTPData.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Clear the OTP after successful verification
    otpStore.delete(email);

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const sendPasswordResetOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otp = generateOTP();
    const expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    // Store OTP with expiry
    otpStore.set(`reset_${email}`, {
      otp,
      expiry: expiryTime
    });

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, "Password Reset");
    if (!emailSent) {
      throw new Error('Failed to send email. Please try again later.');
    }

    res.status(200).json({ message: "Password reset OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const storedOTPData = otpStore.get(`reset_${email}`);
    if (!storedOTPData) {
      return res.status(400).json({ error: "OTP not found or expired" });
    }

    if (Date.now() > storedOTPData.expiry) {
      otpStore.delete(`reset_${email}`);
      return res.status(400).json({ error: "OTP has expired" });
    }

    if (storedOTPData.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    // Clear OTP
    otpStore.delete(`reset_${email}`);

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateHasEntered = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.hasEntered = !user.hasEntered; // Toggle the hasEntered status
    await user.save();

    res.status(200).json({ message: "User entry status updated", hasEntered: user.hasEntered });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
