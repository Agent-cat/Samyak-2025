import { useState } from "react";
import About from "../Components/Homepage/About";
import Contact from "../Components/Homepage/Contact";
import Features from "../Components/Homepage/Features";

import Landing from "../Components/Homepage/Landing";
import Story from "../Components/Homepage/Story";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import "remixicon/fonts/remixicon.css";

const Home = () => {
  const [showSplash, setShowSplash] = useState(true);

  useGSAP(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        setShowSplash(false);
      },
    });

    tl.to(".vi-mask-group", {
      rotate: 10,
      duration: 2,
      ease: "Power4.easeInOut",
      transformOrigin: "50% 50%",
    }).to(".vi-mask-group", {
      scale: 10,
      duration: 2,
      delay: -1.8,
      ease: "Expo.easeInOut",
      transformOrigin: "50% 50%",
      opacity: 0,
    });
  }, []);

  return (
    <>
      {showSplash ? (
        <div className="svg flex items-center text-center justify-center fixed top-0 left-0 z-[100] w-full h-screen overflow-hidden bg-[#000]">
          <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
            <defs>
              <mask id="viMask">
                <rect width="100%" height="100%" fill="black" />
                <g className="vi-mask-group">
                  <text
                    x="50%"
                    y="50%"
                    fontSize="150"
                    textAnchor="middle"
                    fill="white"
                    dominantBaseline="middle"
                    fontFamily="pricedown"
                    className="text-[pricedown]"
                  >
                    SAMYAK
                  </text>
                </g>
              </mask>
            </defs>
            <image
              href="./sky.png"
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid slice"
              mask="url(#viMask)"
            />
          </svg>
        </div>
      ) : (
        <main className="relative overflow-x-hidden min-h-screen cursor-none w-screen ">
          <Landing />
          <About />
          <Features />
          <Story />
          {/* <Contact /> */}
        </main>
      )}
    </>
  );
};

export default Home;
