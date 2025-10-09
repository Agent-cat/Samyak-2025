import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

const ChiefGuestsPopup = ({
  open,
  onClose,
  members = [],
  title = "Chief Guests",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setCurrentIndex(0);
  }, [open]);

  const total = members.length;

  const paginate = useCallback(
    (direction) => {
      if (total === 0) return;
      const next = (currentIndex + direction + total) % total;
      setCurrentIndex(next);
    },
    [currentIndex, total]
  );

  const handleDragEnd = (event, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    const swipe = Math.abs(offset) * Math.sign(offset);
    const threshold = 80; // pixels
    const velocityThreshold = 300; // px/s
    if (swipe > threshold || velocity > velocityThreshold) {
      paginate(-1);
    } else if (swipe < -threshold || velocity < -velocityThreshold) {
      paginate(1);
    }
    setDragX(0);
  };

  const cardVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
      rotateY: direction > 0 ? 45 : -45,
    }),
    center: {
      zIndex: 3,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: { 
        duration: 0.6, 
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 100,
        damping: 15
      },
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? 45 : -45,
      transition: { 
        duration: 0.4, 
        ease: [0.25, 0.46, 0.45, 0.94] 
      },
    }),
  };

  const leftIndex = total ? (currentIndex - 1 + total) % total : 0;
  const rightIndex = total ? (currentIndex + 1) % total : 0;

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >

        {/* Carousel Container */}
        <div ref={containerRef} className="relative">
          <div className="relative h-[500px] md:h-[550px] overflow-visible flex items-center justify-center">
            {/* Left side card */}
            {total > 1 && (
              <motion.div 
                className="absolute -left-16 md:-left-56 w-[240px] h-[380px] md:w-[280px] md:h-[420px] rounded-2xl overflow-hidden border border-white/20 shadow-2xl opacity-60 grayscale hover:opacity-80 transition-all duration-300"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 0.6 }}
                transition={{ delay: 0.2 }}
              >
                <img src={members[leftIndex]?.image} alt="left" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                {/* Dynamic title */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/20">
                    {members[leftIndex]?.title || "Chief Guest"}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Center card */}
            <AnimatePresence custom={dragX} initial={false} mode="popLayout">
              {members.length > 0 && (
                <motion.div
                  key={members[currentIndex]?.id || currentIndex}
                  className="relative z-10 mx-auto w-[320px] h-[480px] md:w-[380px] md:h-[520px] rounded-3xl overflow-hidden border border-white/30 shadow-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm"
                  custom={dragX}
                  variants={cardVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDrag={(_, info) => setDragX(info.point.x)}
                  onDragEnd={handleDragEnd}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div className="relative w-full h-full">
                    {/* Dynamic title */}
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40">
                      <span className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/20">
                        {members[currentIndex]?.title || "Chief Guest"}
                      </span>
                    </div>

                    {/* Close button - positioned at top of center card */}
                    <motion.button
                      aria-label="Close"
                      onClick={onClose}
                      className="absolute top-4 right-4 z-50 rounded-full p-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-all duration-200 hover:scale-110 group"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white group-hover:text-red-400 transition-colors">
                        <path fillRule="evenodd" d="M6.225 4.811a1 1 0 011.414 0L12 9.172l4.361-4.361a1 1 0 111.414 1.414L13.414 10.586l4.361 4.361a1 1 0 01-1.414 1.414L12 12l-4.361 4.361a1 1 0 01-1.414-1.414l4.361-4.361-4.361-4.361a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </motion.button>

                    <img
                      src={members[currentIndex]?.image}
                      alt={members[currentIndex]?.name || "Guest"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    
                    {/* Content overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <h4 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                          {members[currentIndex]?.name}
                        </h4>
                        <p className="text-lg text-white/80 font-medium">
                          {members[currentIndex]?.role}
                        </p>
                        <div className="mt-3 w-12 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                      </motion.div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-4 left-4 w-3 h-3 bg-white/20 rounded-full"></div>
                    <div className="absolute top-8 left-8 w-2 h-2 bg-purple-400/60 rounded-full"></div>
                    <div className="absolute top-12 left-6 w-1 h-1 bg-pink-400/60 rounded-full"></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Right side card */}
            {total > 1 && (
              <motion.div 
                className="absolute -right-16 md:-right-56 w-[240px] h-[380px] md:w-[280px] md:h-[420px] rounded-2xl overflow-hidden border border-white/20 shadow-2xl opacity-60 grayscale hover:opacity-80 transition-all duration-300"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 0.6 }}
                transition={{ delay: 0.2 }}
              >
                <img src={members[rightIndex]?.image} alt="right" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                {/* Dynamic title */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/20">
                    {members[rightIndex]?.title || "Chief Guest"}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Navigation Arrows */}
            {members.length > 1 && (
              <>
                <motion.button
                  onClick={() => paginate(-1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm w-12 h-12 flex items-center justify-center border border-white/20 hover:border-white/40 transition-all duration-200 hover:scale-110 group"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white group-hover:text-purple-300 transition-colors">
                    <path fillRule="evenodd" d="M15.78 5.22a.75.75 0 010 1.06L10.06 12l5.72 5.72a.75.75 0 11-1.06 1.06l-6.25-6.25a.75.75 0 010-1.06l6.25-6.25a.75.75 0 011.06 0z" clipRule="evenodd" />
                  </svg>
                </motion.button>
                <motion.button
                  onClick={() => paginate(1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm w-12 h-12 flex items-center justify-center border border-white/20 hover:border-white/40 transition-all duration-200 hover:scale-110 group"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white group-hover:text-purple-300 transition-colors">
                    <path fillRule="evenodd" d="M8.22 18.78a.75.75 0 010-1.06L13.94 12 8.22 6.28a.75.75 0 111.06-1.06l6.25 6.25a.75.75 0 010 1.06l-6.25 6.25a.75.75 0 01-1.06 0z" clipRule="evenodd" />
                  </svg>
                </motion.button>
              </>
            )}
          </div>

          {/* Enhanced Dots */}
          {members.length > 1 && (
            <div className="mt-8 flex justify-center gap-3">
              {members.map((_, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative w-3 h-3 rounded-full transition-all duration-300 ${
                    idx === currentIndex 
                      ? "bg-gradient-to-r from-purple-400 to-pink-400 shadow-lg shadow-purple-500/50" 
                      : "bg-white/40 hover:bg-white/70 hover:scale-110"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {idx === currentIndex && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
                      layoutId="activeDot"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          )}

          {/* Progress indicator */}
          {members.length > 1 && (
            <div className="mt-4 text-center">
              <span className="text-sm text-white/80 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                {currentIndex + 1} of {total}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChiefGuestsPopup;


