import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { setToken, setUser } from "../utils/auth";
import ErrorPopup from "../Components/ErrorPopup";
import GenericPopup from "../Components/GenericPopup";

const Register = () => {
  const url = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    college: "kluniversity",
    collegeId: "",
    otherCollegeName: "",
    state: "",
    address: "",
    country: "India",
    otherCountryName: "",
    image: null,
    profileImage: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];

  const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCollegeChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      college: value,
      otherCollegeName: value === "kluniversity" ? "" : prev.otherCollegeName,
    }));
  };

  const handleCountryChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      country: value,
      otherCountryName: value === "Other" ? "" : prev.otherCountryName,
    }));
  };

  const handleSendOTP = async () => {
    if (
      formData.college === "kluniversity" &&
      !formData.email.endsWith("@kluniversity.in")
    ) {
      setError(
        "Please use your KL University email address (@kluniversity.in)."
      );
      setShowPopup(true);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setOtpError(null);

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error("Please enter a valid email address");
      }

      console.log("Sending OTP request for:", formData.email);

      const response = await fetch(`${url}/api/users/send-verification-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      console.log("Server response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setShowOTPInput(true);
      setError(null);
    } catch (error) {
      console.error("Error sending OTP:", error);
      setError(error.message || "Failed to send OTP. Please try again later.");
      setShowPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setIsLoading(true);
      setOtpError(null);

      const response = await fetch(`${url}/api/users/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp: otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setIsEmailVerified(true);
      setShowOTPInput(false);
    } catch (error) {
      setOtpError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!/^image\/(jpeg|jpg|png|webp)$/.test(file.type)) {
      setError("Only JPG, JPEG, PNG or WEBP images are allowed.");
      setShowPopup(true);
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("Image size should not exceed 2MB.");
      setShowPopup(true);
      return;
    }
    setFormData((prev) => ({ ...prev, image: file }));

    try {
      setIsLoading(true);
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${url}/api/users/upload`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image");
      }
      setFormData((prev) => ({ ...prev, profileImage: data.url }));
    } catch (err) {
      setError(err.message || "Image upload failed");
      setShowPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setError(null);

    if (step === 1) {
      if (
        !formData.fullName ||
        !formData.phoneNumber ||
        !formData.collegeId ||
        !formData.password ||
        !formData.confirmPassword ||
        (formData.college === "other" && !formData.otherCollegeName)
      ) {
        setError("Please fill in all required fields.");
        setShowPopup(true);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        setShowPopup(true);
        return;
      }
    } else if (step === 2) {
      if (!formData.email) {
        setError("Please enter your email address.");
        setShowPopup(true);
        return;
      }
      if (!isEmailVerified) {
        setError("Please verify your email first.");
        setShowPopup(true);
        return;
      }
      if (
        formData.college === "kluniversity" &&
        !formData.email.endsWith("@kluniversity.in")
      ) {
        setError(
          "Please use your KL University email address (@kluniversity.in)."
        );
        setShowPopup(true);
        return;
      }
    } else if (step === 3) {
      if (
        !formData.address ||
        (formData.country === "India" && !formData.state)
      ) {
        setError("Please provide your address and state.");
        setShowPopup(true);
        return;
      }
    }

    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);

    try {
      if (!formData.profileImage) {
        throw new Error("Please upload your image before submitting.");
      }

      if (formData.college === "kluniversity") {
        const response = await fetch(`${url}/api/users/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            profileImage: formData.profileImage,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Registration failed");
        }

        setToken(data.token);
        setUser({
          fullName: data.fullName,
          email: data.email,
          college: data.college,
          collegeId: data.collegeId,
          role: data.role,
        });
        navigate("/");
      } else {
        navigate("/payment", {
          state: {
            formData: { ...formData, profileImage: formData.profileImage },
          },
        });
      }
    } catch (error) {
      setError(error.message || "An error occurred during registration.");
      setShowPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="fullName"
                className="block text-white mb-2 font-mono"
              >
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-black border border-white/20 text-white focus:outline-none focus:border-white transition-all duration-300"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-white mb-2 font-mono"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-black border border-white/20 text-white focus:outline-none focus:border-white transition-all duration-300"
                required
                pattern="^\+?[\d\s-]{10,15}$"
                placeholder="Enter your phone number"
                disabled={isLoading}
              />
            </div>
            <div>
              <label
                htmlFor="college"
                className="block text-white mb-2 font-mono"
              >
                College
              </label>
              <select
                id="college"
                name="college"
                value={formData.college}
                onChange={handleCollegeChange}
                className="w-full px-4 py-2 rounded bg-black border border-white/20 text-white focus:outline-none focus:border-white transition-all duration-300"
                required
                disabled={isLoading}
              >
                <option value="kluniversity">KL University</option>
                <option value="other">Other College</option>
              </select>
              {formData.college === "other" && (
                <p className="mt-2 text-sm text-white font-sans">
                  Note: Non-KL University students are required to pay ₹400
                  registration fee.
                </p>
              )}
            </div>
            {formData.college === "other" && (
              <div>
                <label
                  htmlFor="otherCollegeName"
                  className="block text-white mb-2 font-mono"
                >
                  College Name
                </label>
                <input
                  type="text"
                  id="otherCollegeName"
                  name="otherCollegeName"
                  value={formData.otherCollegeName}
                  onChange={handleChange}
                  placeholder="Enter your college name"
                  className="w-full px-4 py-2 rounded bg-black border border-white/20 text-white focus:outline-none focus:border-white transition-all duration-300"
                  required
                  disabled={isLoading}
                />
              </div>
            )}
            <div>
              <label
                htmlFor="collegeId"
                className="block text-white mb-2 font-mono"
              >
                College ID
              </label>
              <input
                type="text"
                id="collegeId"
                name="collegeId"
                value={formData.collegeId}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-black border border-white/20 text-white focus:outline-none focus:border-white transition-all duration-300"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-white mb-2 font-mono"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-black border border-white/20 text-white focus:outline-none focus:border-white transition-all duration-300"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-white mb-2 font-mono"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-black border border-white/20 text-white focus:outline-none focus:border-white transition-all duration-300"
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="button"
              onClick={handleNextStep}
              disabled={isLoading}
              className={`w-full bg-white/20 text-white p-3 rounded-lg transition-all duration-300 font-mono ${
                isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-white/30"
              }`}
            >
              Next
            </button>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-white mb-2 font-mono"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-black border border-white/20 text-white focus:outline-none focus:border-white transition-all duration-300"
                required
                disabled={isLoading || isEmailVerified}
              />
              <p className="text-sm text-white/80 mt-1 font-sans">
                Note: KL University students should use their official
                university Email.
              </p>
            </div>
            {!isEmailVerified && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={isLoading || !formData.email || isEmailVerified}
                  className={`px-4 py-2 text-sm rounded bg-white/20 text-white hover:bg-white/30 transition-colors font-mono ${
                    isLoading || !formData.email || isEmailVerified
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isLoading ? "Sending..." : "Verify Email"}
                </button>
              </div>
            )}
            {showOTPInput && (
              <div className="mt-4">
                <label
                  htmlFor="otp"
                  className="block text-white mb-2 font-mono"
                >
                  Enter OTP
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-2 rounded bg-black border border-white/20 text-white focus:outline-none focus:border-white transition-all duration-300"
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOTP}
                    disabled={isLoading || otp.length !== 6}
                    className={`px-4 py-2 rounded bg-white/20 text-white hover:bg-white/30 transition-colors font-mono ${
                      isLoading || otp.length !== 6
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {isLoading ? "Verifying..." : "Verify"}
                  </button>
                </div>
                {otpError && (
                  <p className="text-red-500 text-sm mt-1 font-sans">
                    {otpError}
                  </p>
                )}
              </div>
            )}
            {isEmailVerified && (
              <span className="text-green-500 text-sm font-sans">
                ✓ Email Verified
              </span>
            )}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-6 py-2 rounded bg-white/20 text-white hover:bg-white/30 transition-colors font-mono"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                disabled={isLoading || !isEmailVerified}
                className={`px-6 py-2 rounded bg-white/20 text-white hover:bg-white/30 transition-colors font-mono ${
                  isLoading || !isEmailVerified
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                Next
              </button>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="country"
                className="block text-white mb-2 font-mono"
              >
                Country
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleCountryChange}
                className="w-full px-4 py-2 rounded bg-black border border-white/20 text-white focus:outline-none focus:border-white transition-all duration-300"
                required
                disabled={isLoading}
              >
                <option value="India">India</option>
                <option value="Other">Other</option>
              </select>
              {formData.country === "Other" && (
                <input
                  type="text"
                  id="otherCountryName"
                  name="otherCountryName"
                  value={formData.otherCountryName}
                  onChange={handleChange}
                  placeholder="Enter your country name"
                  className="w-full px-4 py-2 mt-2 rounded bg-black border border-white/20 text-white focus:outline-none focus:border-white transition-all duration-300"
                  required
                  disabled={isLoading}
                />
              )}
            </div>
            {formData.country === "India" && (
              <div>
                <label
                  htmlFor="state"
                  className="block text-white mb-2 font-mono"
                >
                  State
                </label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded bg-black border border-white/20 text-white focus:outline-none focus:border-white transition-all duration-300"
                  required
                  disabled={isLoading}
                >
                  <option value="">Select State</option>
                  {indianStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label
                htmlFor="address"
                className="block text-white mb-2 font-mono"
              >
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-black border border-white/20 text-white focus:outline-none focus:border-white transition-all duration-300"
                required
                disabled={isLoading}
                rows="3"
              />
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-6 py-2 rounded bg-white/20 text-white hover:bg-white/30 transition-colors font-mono"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                disabled={isLoading}
                className={`px-6 py-2 rounded bg-white/20 text-white hover:bg-white/30 transition-colors font-mono ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Next
              </button>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="image"
                className=" text-white gap-3 flex mb-2 font-mono"
              >
                Upload Student Image <p className="text-rose-600">*</p>
              </label>
              <p className="text-sm text-red-500 mt-1">
                Image size should be less than 2MB.
              </p>
              <input
                type="file"
                id="image"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleImageChange}
                disabled={isLoading}
                className="w-full px-4 py-2 rounded bg-black border border-white/20 text-white focus:outline-none focus:border-white transition-all duration-300"
              />
              {formData.profileImage && (
                <div className="mt-4">
                  <img
                    src={formData.profileImage}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded border border-white/20"
                  />
                  <p className="text-xs text-white/60 mt-1 font-sans">
                    Image uploaded successfully.
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-6 justify-between">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-6 py-2 rounded bg-white/20 text-white hover:bg-white/30 transition-colors font-mono"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.profileImage}
                className={`w-full bg-white/20 text-white p-3 rounded-lg transition-all duration-300 font-mono ${
                  isLoading || !formData.profileImage
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-white/30"
                }`}
              >
                {isLoading ? "Registering..." : "Register"}
              </button>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {error && <ErrorPopup message={error} onClose={() => setError(null)} />}
      {showPopup && (
        <GenericPopup message={error} onClose={() => setShowPopup(false)} />
      )}
      <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8 relative">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gray-800 rounded-full mix-blend-lighten filter blur-3xl opacity-30 animate-pulse"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "easeInOut" }}
          ></motion.div>
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full mix-blend-lighten filter blur-3xl opacity-30 animate-pulse-slow"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "easeInOut", delay: 2 }}
          ></motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="register-container bg-white/5 p-8 rounded-lg backdrop-blur-sm w-full max-w-md relative z-20 shadow-lg border border-white/10"
        >
          <h2 className="text-3xl font-saint-carell text-white text-center mb-8 tracking-widest uppercase">
            Register
          </h2>
          <div className="flex justify-center mb-6">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-black border-2 transition-all duration-300 ${
                  step >= 1
                    ? "bg-white border-white"
                    : "bg-transparent border-white/50 text-white/50"
                }`}
              >
                1
              </div>
              <div className="w-16 h-0.5 bg-white/20 mx-2"></div>
            </div>
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-black border-2 transition-all duration-300 ${
                  step >= 2
                    ? "bg-white border-white"
                    : "bg-transparent border-white/50 text-white/50"
                }`}
              >
                2
              </div>
              <div className="w-16 h-0.5 bg-white/20 mx-2"></div>
            </div>
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-black border-2 transition-all duration-300 ${
                  step >= 3
                    ? "bg-white border-white"
                    : "bg-transparent border-white/50 text-white/50"
                }`}
              >
                3
              </div>
              <div className="w-16 h-0.5 bg-white/20 mx-2"></div>
            </div>
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-black border-2 transition-all duration-300 ${
                  step >= 4
                    ? "bg-white border-white"
                    : "bg-transparent border-white/50 text-white/50"
                }`}
              >
                4
              </div>
            </div>
          </div>
          <form onSubmit={step === 4 ? handleSubmit : handleNextStep}>
            <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
          </form>
        </motion.div>
      </div>
    </>
  );
};

export default Register;
