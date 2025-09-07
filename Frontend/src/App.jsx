import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Components/Navbar";
import NRoutes from "./Routes/NRoutes";
import Footer from "./Components/Footer";
import { useLenis } from "./hooks/useLenis";
import { MotionConfig } from "framer-motion";
import TargetCursor from "./Components/Homepage/TargetCursor";

const App = () => {
  const location = useLocation();
  useLenis();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen">
        <TargetCursor spinDuration={4} hideDefaultCursor={true} />

        <div className="select-none">
          <Navbar />
          <NRoutes />
          <Footer />
        </div>
      </div>
    </MotionConfig>
  );
};

export default App;
