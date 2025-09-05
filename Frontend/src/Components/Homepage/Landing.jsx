import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import Navbar from "../Navbar";

gsap.registerPlugin(ScrollTrigger);

// The Audio Permission Popup component
const AudioPermissionPopup = ({ onEnable, onDisable }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="rounded-xl border border-white/10 bg-black/80 p-8 text-center text-white shadow-2xl">
        <h2 className="text-xl font-bold md:text-2xl">
          Would you like to enable audio?
        </h2>
        <p className="mt-2 text-sm text-gray-400 md:text-base">
          Experience the full vibe of the event with background music.
        </p>
        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={onEnable}
            className="w-28 rounded-lg bg-white px-4 py-2 font-semibold text-black transition-colors hover:bg-gray-200"
          >
            Yes
          </button>
          <button
            onClick={onDisable}
            className="w-28 rounded-lg border border-white/20 px-4 py-2 font-semibold text-white transition-colors hover:bg-white hover:text-black"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

const Landing = () => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [hasClicked, setHasClicked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadedVideos, setLoadedVideos] = useState(0);

  // New state for the audio popup and audio playback
  const [showAudioPopup, setShowAudioPopup] = useState(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef(null);

  const totalVideos = 1;
  const nextVdRef = useRef(null);

  useEffect(() => {
    // Check localStorage on initial render
    const audioPreference = localStorage.getItem("audio_preference");
    if (audioPreference !== null) {
      // If a preference exists, set the audio state and hide the popup
      setIsAudioPlaying(audioPreference === "enabled");
      setShowAudioPopup(false);
    }
  }, []); // Run only once on component mount

  // Effect to play/pause audio based on state
  useEffect(() => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isAudioPlaying]);

  useEffect(() => {
    if (loadedVideos === totalVideos - 1) {
      setLoading(false);
    }
  }, [loadedVideos, totalVideos]);

  // Audio control functions that also save to localStorage
  const handleEnableAudio = () => {
    setIsAudioPlaying(true);
    setShowAudioPopup(false);
    localStorage.setItem("audio_preference", "enabled");
  };

  const handleDisableAudio = () => {
    setIsAudioPlaying(false);
    setShowAudioPopup(false);
    localStorage.setItem("audio_preference", "disabled");
  };

  const handleMiniVdClick = () => {
    setHasClicked(true);
    setCurrentIndex((prevIndex) => (prevIndex % totalVideos) + 1);
  };

  useGSAP(
    () => {
      if (hasClicked) {
        gsap.set("#next-video", { visibility: "visible" });
        gsap.to("#next-video", {
          transformOrigin: "center center",
          scale: 1,
          width: "100%",
          height: "100%",
          duration: 1,
          ease: "power1.inOut",
          onStart: () => nextVdRef.current.play(),
        });
        gsap.from("#current-video", {
          transformOrigin: "center center",
          scale: 0,
          duration: 1.5,
          ease: "power1.inOut",
        });
      }
    },
    {
      dependencies: [currentIndex],
      revertOnUpdate: true,
    }
  );

  useGSAP(() => {
    gsap.set("#video-frame", {
      clipPath: "polygon(14% 0, 72% 0, 88% 90%, 0 95%)",
      borderRadius: "0% 0% 40% 10%",
    });
    gsap.from("#video-frame", {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      borderRadius: "0% 0% 0% 0%",
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: "#video-frame",
        start: "center center",
        end: "bottom center",
        scrub: true,
      },
    });
  });

  const getVideoSrc = (index) => `videos/hero-${index}.mp4`;

  return (
    <>
      <Navbar
        isAudioPlaying={isAudioPlaying}
        setIsAudioPlaying={setIsAudioPlaying}
        audioElementRef={audioRef}
      />

      {showAudioPopup && (
        <AudioPermissionPopup
          onEnable={handleEnableAudio}
          onDisable={handleDisableAudio}
        />
      )}

      {/* The audio element for the landing page */}
      <audio ref={audioRef} className="hidden" src="/audio/loop.mp3" loop />

      <div className="relative h-dvh w-screen overflow-x-hidden">
        {/* ... (rest of your Landing page code) ... */}
        <div
          id="video-frame"
          className="relative z-10 h-dvh w-screen overflow-hidden rounded-lg bg-black"
        >
          <div>
            <div className="mask-clip-path absolute-center absolute z-50 size-64 cursor-pointer overflow-hidden rounded-lg">
              {/* <VideoPreview> */}
              <div
                onClick={handleMiniVdClick}
                className="origin-center scale-50 opacity-0 transition-all duration-500 ease-in hover:scale-100 hover:opacity-100"
              >
                <video
                  ref={nextVdRef}
                  src={getVideoSrc((currentIndex % totalVideos) + 1)}
                  loop
                  muted
                  id="current-video"
                  className="size-64 origin-center scale-150 object-cover object-center"
                  // onLoadedData={handleVideoLoad}
                />
              </div>
              {/* </VideoPreview> */}
            </div>

            <video
              src={getVideoSrc(currentIndex)}
              autoPlay
              loop
              muted
              className="absolute left-0 top-0 size-full object-cover object-center"
              // onLoadedData={handleVideoLoad}
            />
          </div>

          <h1 className="special-font  text-white hero-heading absolute bottom-5 right-5 z-40 ">
            S<b>A</b>MYAK
          </h1>

          <div className="absolute left-0 top-0 z-40 size-full">
            <div className="mt-24 px-5 sm:px-10">
              {/* ... Other content ... */}
            </div>
          </div>
        </div>

        <h1 className="special-font hero-heading absolute bottom-5 right-5 text-black">
          S<b>A</b>MYAK
        </h1>
      </div>
    </>
  );
};

export default Landing;
