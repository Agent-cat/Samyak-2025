
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const PleaseLogin = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black backdrop-blur-lg relative overflow-hidden">
      {/* Animated background blobs */}
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
        className="w-32 h-32 relative z-10"
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
            className="w-24 h-24 text-white"
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
        className="text-4xl font-bold mt-12 text-white font-saint-carell text-center tracking-widest uppercase z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Access Denied
      </motion.h1>

      <motion.p
        className="mt-4 text-white/60 text-lg text-center max-w-md px-4 font-sans z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        This area is restricted. Please log in to your account to view this content.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        className="z-10"
      >
        <Link
          to="/login"
          className="mt-8 px-10 py-4 bg-white/20 text-white rounded-lg font-mono hover:bg-white/30 transition-all duration-300 flex items-center justify-center text-lg shadow-lg"
        >
          Login
        </Link>
      </motion.div>
    </div>
  );
};

export default PleaseLogin;
