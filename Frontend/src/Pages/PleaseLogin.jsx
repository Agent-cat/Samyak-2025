import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const PleaseLogin = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black backdrop-blur-lg">
      <motion.div
        initial={{ scale: 0, rotate: 0 }}
        animate={{
          scale: 1,
          rotate: [0, -10, 10, -10, 0],
        }}
        transition={{
          duration: 0.5,
          rotate: {
            duration: 0.5,
            delay: 0.5,
            ease: "easeInOut",
          },
        }}
        className="w-32 h-32 relative"
      >
        <motion.div
          className="w-full h-full flex items-center justify-center"
          initial={{ y: -50 }}
          animate={{ y: [0, -10, 0] }}
          transition={{
            y: {
              duration: 1,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            },
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-24 h-24 text-purple-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </motion.div>
      </motion.div>

      <motion.h1
        className="text-4xl font-bold mt-12 text-white font-saint-carell text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Login Required
      </motion.h1>

      <motion.p
        className="mt-4 text-gray-300 text-lg text-center max-w-md px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        This area is locked and requires authentication. Please log in to access
        the content.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <Link
          to="/login"
          className="mt-8 px-10 py-4 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-violet-600 transition-all duration-300 flex items-center justify-center text-lg shadow-lg"
        >
          Login
        </Link>
      </motion.div>
    </div>
  );
};

export default PleaseLogin;
