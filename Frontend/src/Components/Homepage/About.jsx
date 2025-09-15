import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import samyak from "../../assets/samyak.JPG";
import AnimatedTitle from "./AnimatedTitle";

// import CurvedLoop from "../ui/CurvedLoop";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  useGSAP(() => {
    const clipAnimation = gsap.timeline({
      scrollTrigger: {
        trigger: "#clip",
        start: "center center",
        end: "+=800 center",
        scrub: 0.5,
        pin: true,
        pinSpacing: true,
      },
    });

    clipAnimation.to(".mask-clip-path", {
      width: "100vw",
      height: "100vh",
      borderRadius: 0,
    });
  });

  return (
    <div id="about" className="min-h-screen bg-black w-screen">
      {/* <CurvedLoop 
  marqueeText="SAMYAK  SAMYAK"
  speed={1}
  curveAmount={200}
  interactive={false}
  className={"size-4"}
/> */}
      <div className="relative mb-8 mt-36 flex flex-col items-center gap-5">
        {/* <ScrollVelocity
  texts={['SAMYAK']} 
  velocity={100} 
  numCopies={100}
  className="custom-scroll-text font-bold "
/> */}
        <p className="font-general text-sm uppercase md:text-[16px]">
          Welcome to SAMYAK
        </p>

        <AnimatedTitle
          title="A Nati<b>o<b/>nal Level  <br /> Techno Management Fest "
          containerClass="mt-5 !text-white text-center"
        />

        <div className="about-subtext">
          <p className="text-white">
            KL University's 2025 techno-management fest
          </p>
          <p className="text-gray-500">
            features diverse events and workshops, fostering collaboration,
            enhancing skills, and celebrating a 13-year legacy of student
            camaraderie
          </p>
        </div>
      </div>

      <div className="h-dvh w-screen" id="clip">
        <div className="mask-clip-path about-image">
          <img
            src="/img/TV.png"
            alt="Background"
            className="absolute left-0 top-0 size-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default About;
