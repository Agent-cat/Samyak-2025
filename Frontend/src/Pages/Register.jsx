import React, { useState } from "react";
import { motion } from "framer-motion";
import intro3 from "../assets/intro3.mp4";
import { useNavigate } from "react-router-dom";
import { setToken, setUser } from "../utils/auth";
import ErrorPopup from "../Components/ErrorPopup";
import GenericPopup from "../Components/GenericPopup";

const Register = () => {

  const url = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
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
  });
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
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

  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
  };

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
    try {
      setIsLoading(true);
      setError(null);
      setOtpError(null);

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      console.log('Sending OTP request for:', formData.email);

      const response = await fetch(`${url}/api/users/send-verification-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setShowOTPInput(true);
      setError(null);
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError(error.message || 'Failed to send OTP. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setIsLoading(true);
      setOtpError(null);

      const response = await fetch(`${url}/api/users/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_IMAGE_SIZE) {
        setError("Image size should not exceed 2MB.");
        setShowPopup(true);
        return;
      }
      setFormData({ ...formData, image: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEmailVerified) {
      setError("Please verify your email first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Validate password match
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Validate KL University email for KL students
      if (formData.college === "kluniversity" && !formData.email.endsWith("@kluniversity.in")) {
        throw new Error("Please use your KL University email address");
      }

      // For KL University students, proceed with direct registration
      if (formData.college === "kluniversity") {
        const response = await fetch(
          `${url}/api/users/register`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...formData,
            }),
          }
        );

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
        // For other college students, proceed to payment page
        navigate("/payment", { state: { formData } });
      }
    } catch (error) {
      setError(error.message || "An error occurred during registration.");
      setShowPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {error && <ErrorPopup message={error} onClose={() => setError(null)} />}
      {showPopup && <GenericPopup message={error} onClose={() => setShowPopup(false)} />}
      <div className="min-h-screen relative flex items-center justify-center px-4 py-8">
        {!isVideoLoaded && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
            <div className="text-white text-2xl">Loading...</div>
          </div>
        )}

        <video
          autoPlay
          loop
          muted
          onLoadedData={handleVideoLoad}
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        >
          <source src={intro3} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-10"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVideoLoaded ? 1 : 0, y: isVideoLoaded ? 0 : 20 }}
          transition={{ duration: 0.5 }}
          className="register-container bg-white/10 p-8 rounded-lg backdrop-blur-sm w-full max-w-md relative z-20"
        >
          <h2 className="text-3xl font-saint-carell text-white text-center mb-8">
            Register
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-white mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-black border border-white/20 text-white focus:outline-none focus:border-white"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-white mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-black border border-white/20 text-white focus:outline-none focus:border-white"
                required
                disabled={isLoading}
              />
              <p className="text-sm text-white/80 mt-1">
                Note:<br />
                1.Kl university students should use their official university Email <br />
                2. Other college students should select their college before filling the email address
              </p>
            </div>
            {!isEmailVerified && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={isLoading || !formData.email}
                  className={`px-4 py-2 text-sm rounded bg-purple-500 text-white hover:bg-purple-600 transition-colors ${isLoading || !formData.email ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  {isLoading ? 'Sending...' : 'Verify Email'}
                </button>
                {isEmailVerified && (
                  <span className="text-green-500 text-sm">✓ Verified</span>
                )}
              </div>
            )}
            {showOTPInput && (
              <div className="mt-4">
                <label htmlFor="otp" className="block text-white mb-2">
                  Enter OTP
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-2 rounded bg-black border border-white/20 text-white focus:outline-none focus:border-white"
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOTP}
                    disabled={isLoading || otp.length !== 6}
                    className={`px-4 py-2 rounded bg-purple-500 text-white hover:bg-purple-600 transition-colors ${isLoading || otp.length !== 6 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    {isLoading ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
                {otpError && (
                  <p className="text-red-500 text-sm mt-1">{otpError}</p>
                )}
              </div>
            )}
            <div>
              <label htmlFor="password" className="block text-white mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-black border border-white/20 text-white focus:outline-none focus:border-white"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-white mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-black border border-white/20 text-white focus:outline-none focus:border-white"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-white mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-black border border-white/20 text-white focus:outline-none focus:border-white"
                required
                pattern="^\+?[\d\s-]{10,15}$"
                placeholder="Enter your phone number"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="collegeId" className="block text-white mb-2">
                College ID
              </label>
              <input
                type="text"
                id="collegeId"
                name="collegeId"
                value={formData.collegeId}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-black border border-white/20 text-white focus:outline-none focus:border-white"
                required
                disabled={isLoading}
              />
            </div>


            <div>
              <label htmlFor="college" className="block text-white mb-2">
                College
              </label>
              <select
                id="college"
                name="college"
                value={formData.college}
                onChange={handleCollegeChange}
                className="w-full px-4 py-2 rounded bg-black border border-white/20 text-white focus:outline-none focus:border-white"
                required
                disabled={isLoading}
              >
                <option value="kluniversity">KL University</option>
                <option value="other">Other College</option>
              </select>
              {formData.college === "other" && (
                <>
                  <input
                    type="text"
                    id="otherCollegeName"
                    name="otherCollegeName"
                    value={formData.otherCollegeName}
                    onChange={handleChange}
                    placeholder="Enter your college name"
                    className="w-full px-4 py-2 mt-2 rounded bg-black border border-white/20 text-white focus:outline-none focus:border-white"
                    required
                    disabled={isLoading}
                  />
                  <p className="mt-2 text-sm text-white">
                    Note: Non-KL University students are required to pay ₹310
                    registration fee
                  </p>
                </>
              )}
            </div>


            <div>
              <label htmlFor="country" className="block text-white mb-2">
                Country
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleCountryChange}
                className="w-full px-4 py-2 rounded bg-black border border-white/20 text-white focus:outline-none focus:border-white"
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
                  className="w-full px-4 py-2 mt-2 rounded bg-black border border-white/20 text-white focus:outline-none focus:border-white"
                  required
                  disabled={isLoading}
                />
              )}
            </div>

            {formData.country === "India" && (
              <div>
                <label htmlFor="state" className="block text-white mb-2">
                  State
                </label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded bg-black border border-white/20 text-white focus:outline-none focus:border-white"
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
              <label htmlFor="address" className="block text-white mb-2">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-black border border-white/20 text-white focus:outline-none focus:border-white"
                required
                disabled={isLoading}
                rows="3"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-purple-500 text-white p-3 rounded-lg transition-all duration-300 ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-600"
                }`}
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
          </form>
        </motion.div>
      </div>
    </>
  );
};

export default Register;
