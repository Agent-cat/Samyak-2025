import React, { useState } from "react";
import { motion } from "framer-motion";

import { useNavigate } from "react-router-dom";
import ErrorPopup from "./ErrorPopup";

const ForgotPassword = () => {
  const url = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${url}/api/users/send-reset-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }

      setStep(2);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError("Please enter OTP");
      return;
    }
    setStep(3);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${url}/api/users/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
          newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }

      navigate("/login");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {error && <ErrorPopup message={error} onClose={() => setError(null)} />}
      <div className="min-h-screen relative flex items-center justify-center px-4">
        {/* <video
          autoPlay
          loop
          muted
          onLoadedData={handleVideoLoad}
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        >
          <source src={intro3} type="video/mp4" />
        </video> */}

        <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-10"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: isVideoLoaded ? 1 : 0,
            y: isVideoLoaded ? 0 : 20,
          }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 p-8 rounded-lg backdrop-blur-sm w-full max-w-md relative z-20"
        >
          <h2 className="text-3xl font-saint-carell text-white text-center mb-8">
            Reset Password
          </h2>

          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-white mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded bg-black border border-white/20 text-white focus:outline-none focus:border-white"
                  required
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition-colors duration-300"
              >
                {isLoading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-white mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-2 rounded bg-black border border-white/20 text-white focus:outline-none focus:border-white"
                  required
                  maxLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition-colors duration-300"
              >
                Verify OTP
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label htmlFor="newPassword" className="block text-white mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded bg-black border border-white/20 text-white focus:outline-none focus:border-white"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-white mb-2"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded bg-black border border-white/20 text-white focus:outline-none focus:border-white"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition-colors duration-300"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default ForgotPassword;
