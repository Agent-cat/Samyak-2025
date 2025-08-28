import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { setToken, setUser } from "../utils/auth";
import ErrorPopup from "../Components/ErrorPopup";

const Login = () => {
  const url = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${url}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Login failed. Please check your credentials."
        );
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data);
      navigate("/");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {error && <ErrorPopup message={error} onClose={() => setError(null)} />}
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
          className="login-container bg-white/5 p-8 rounded-lg backdrop-blur-sm w-full max-w-md relative z-20 shadow-lg border border-white/10"
        >
          <h2 className="text-3xl font-saint-carell text-white text-center mb-8 tracking-widest uppercase">
            Login
          </h2>
          <form onSubmit={handleLogin} className="space-y-6">
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
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-purple-300 hover:text-purple-200 transition-colors font-sans"
              >
                Forgot Password?
              </Link>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-white/20 text-white p-3 rounded-lg transition-all duration-300 font-mono ${
                isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-white/30"
              }`}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
          <p className="text-white/60 text-center mt-4 font-sans">
            Don't have an account?{" "}
            <Link to="/register" className="text-white hover:text-gray-300">
              Register here
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default Login;
