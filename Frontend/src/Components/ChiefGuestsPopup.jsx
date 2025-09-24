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
      x: direction > 0 ? 200 : -200,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      zIndex: 3,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 200 : -200,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
    }),
  };

  const leftIndex = total ? (currentIndex - 1 + total) % total : 0;
  const rightIndex = total ? (currentIndex + 1) % total : 0;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl rounded-2xl border border-white/10 bg-black/90 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="text-xl font-bold">{title}</h3>
          <button
            aria-label="Close"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-white/10 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M6.225 4.811a1 1 0 011.414 0L12 9.172l4.361-4.361a1 1 0 111.414 1.414L13.414 10.586l4.361 4.361a1 1 0 01-1.414 1.414L12 12l-4.361 4.361a1 1 0 01-1.414-1.414l4.361-4.361-4.361-4.361a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Carousel */}
        <div ref={containerRef} className="relative px-6 py-6">
          <div className="relative h-[420px] md:h-[460px] overflow-visible flex items-center justify-center">
            {total > 1 && (
              <div className="absolute -left-4 md:-left-10 w-[220px] h-[320px] md:w-[260px] md:h-[360px] rounded-2xl overflow-hidden border border-white/10 shadow-lg opacity-70 grayscale">
                <img src={members[leftIndex]?.image} alt="left" className="w-full h-full object-cover" />
              </div>
            )}
            <AnimatePresence custom={dragX} initial={false} mode="popLayout">
              {members.length > 0 && (
                <motion.div
                  key={members[currentIndex]?.id || currentIndex}
                  className="relative z-10 mx-auto w-[300px] h-[400px] md:w-[360px] md:h-[440px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-white/5"
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
                >
                  <img
                    src={members[currentIndex]?.image}
                    alt={members[currentIndex]?.name || "Guest"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <h4 className="text-lg font-semibold">{members[currentIndex]?.name}</h4>
                    <p className="text-sm text-white/80">{members[currentIndex]?.role}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {total > 1 && (
              <div className="absolute -right-4 md:-right-10 w-[220px] h-[320px] md:w-[260px] md:h-[360px] rounded-2xl overflow-hidden border border-white/10 shadow-lg opacity-70 grayscale">
                <img src={members[rightIndex]?.image} alt="right" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Arrows */}
            {members.length > 1 && (
              <>
                <button
                  onClick={() => paginate(-1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 w-10 h-10 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M15.78 5.22a.75.75 0 010 1.06L10.06 12l5.72 5.72a.75.75 0 11-1.06 1.06l-6.25-6.25a.75.75 0 010-1.06l6.25-6.25a.75.75 0 011.06 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => paginate(1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 w-10 h-10 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M8.22 18.78a.75.75 0 010-1.06L13.94 12 8.22 6.28a.75.75 0 111.06-1.06l6.25 6.25a.75.75 0 010 1.06l-6.25 6.25a.75.75 0 01-1.06 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Dots */}
          {members.length > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              {members.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === currentIndex ? "bg-white" : "bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChiefGuestsPopup;


