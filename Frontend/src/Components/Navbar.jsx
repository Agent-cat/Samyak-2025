import clsx from "clsx";
import gsap from "gsap";
import { useWindowScroll } from "react-use";
import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { NavItems, adminNavItems } from "../Constants/Constants";
import { getUser, removeToken, removeUser } from "../utils/auth";

const Navbar = () => {
  const [user, setUser] = useState(getUser());
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  const ProfileDropdown = () => (
    <div className="relative" ref={profileRef}>
      <button
        onClick={() => setIsProfileOpen(!isProfileOpen)}
        className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg text-white font-bold">
          {user?.fullName?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <span className="font-medium">{user?.fullName || "User"}</span>
      </button>

      {isProfileOpen && (
        <div className="absolute right-0 mt-3 w-72 bg-black/80 backdrop-blur-lg rounded-xl shadow-2xl py-2 z-50 border border-white/10">
          <div className="px-6 py-4 border-b border-white/10">
            <p className="text-lg font-semibold text-white">{user?.fullName}</p>
            <p className="text-sm text-gray-300">{user?.email}</p>
          </div>
          <div className="px-6 py-4 border-b border-white/10">
            <p className="text-sm text-gray-300 flex justify-between">
              <span>College:</span>
              <span className="text-white">{user?.college}</span>
            </p>
            <p className="text-sm text-gray-300 flex justify-between mt-2">
              <span>ID:</span>
              <span className="text-white">{user?.collegeId}</span>
            </p>
            {user?.college !== "kluniversity" && (
              <p className="text-sm text-gray-300 flex justify-between mt-2">
                <span>Payment Status:</span>
                <span
                  className={clsx("font-semibold", {
                    "text-green-500": user?.paymentStatus === "approved",
                    "text-yellow-500": user?.paymentStatus !== "approved",
                  })}
                >
                  {user?.paymentStatus}
                </span>
              </p>
            )}
          </div>
          <div className="px-4 py-3">
            <button
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-purple-500 to-violet-500 text-white py-2.5 rounded-lg font-medium hover:from-purple-600 hover:to-violet-600 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const MobileProfile = () => (
    <div className="border-t border-white/10 pt-6 mt-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg font-bold">
          {user?.fullName?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div>
          <p className="text-white font-semibold text-lg">{user?.fullName || "User"}</p>
          <p className="text-gray-300 text-sm">{user?.email}</p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="w-full bg-gradient-to-r from-purple-500 to-violet-500 text-white py-3 rounded-lg font-medium hover:from-purple-600 hover:to-violet-600 transition-all duration-300 flex items-center justify-center gap-2"
      >
        <span>Logout</span>
      </button>
    </div>
  );

  const isAdmin = user?.role === "admin";
  const navigationLinks = isAdmin ? [...NavItems, adminNavItems] : NavItems;

  useEffect(() => {
    const handleStorageChange = () => setUser(getUser());
    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(() => {
      const currentUser = getUser();
      if (JSON.stringify(currentUser) !== JSON.stringify(user)) {
        setUser(currentUser);
      }
    }, 500);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
  }, [isOpen]);

  const handleLogout = () => {
    removeToken();
    removeUser();
    setUser(null);
    setIsProfileOpen(false);
    setIsOpen(false);
    navigate("/login");
  };

  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioElementRef = useRef(null);
  const navContainerRef = useRef(null);
  const { y: currentScrollY } = useWindowScroll();
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const toggleAudioIndicator = () => {
    setIsAudioPlaying((prev) => !prev);
  };

  useEffect(() => {
    if (isAudioPlaying) {
      audioElementRef.current.play().catch(() => {});
    } else {
      audioElementRef.current.pause();
    }
  }, [isAudioPlaying]);

  useEffect(() => {
    if (currentScrollY <= 10) {
      setIsNavVisible(true);
      if (navContainerRef.current) {
        navContainerRef.current.classList.remove("floating-nav");
      }
      setLastScrollY(0);
      return;
    }
    if (navContainerRef.current) {
      navContainerRef.current.classList.add("floating-nav");
    }
    if (currentScrollY > lastScrollY) {
      setIsNavVisible(false);
    } else {
      setIsNavVisible(true);
    }
    setLastScrollY(currentScrollY);
  }, [currentScrollY]);

  useEffect(() => {
    gsap.to(navContainerRef.current, {
      y: isNavVisible ? 0 : -120,
      duration: 0.3,
      ease: "power2.out",
    });
  }, [isNavVisible]);

  return (
    // FIX: Added a wrapper div with overflow-x-hidden to prevent horizontal scroll
    <div className="overflow-x-hidden">
      <div
        ref={navContainerRef}
        className="fixed inset-x-0 top-4 z-50 h-16 border-none transition-all duration-700 sm:inset-x-6"
      >
        <header className="absolute top-1/2 w-full -translate-y-1/2">
          <div className="flex items-center justify-between">
            <nav className="flex size-full font-bold text-2xl items-center justify-center p-4">
              <div className="flex h-full items-center">
                <div className="hidden md:block">
                  {navigationLinks.map((item, index) => (
                    <NavLink to={item.to} key={index} className="nav-hover-btn px-4 py-2 cursor-target">
                      {item.title}
                    </NavLink>
                  ))}
                </div>
                <button onClick={toggleAudioIndicator} className="ml-10 flex items-center space-x-0.5">
                  <audio ref={audioElementRef} className="hidden" src="/audio/loop.mp3" loop />
                  {[1, 2, 3, 4].map((bar) => (
                    <div key={bar} className={clsx("indicator-line", { active: isAudioPlaying })} style={{ animationDelay: `${bar * 0.1}s` }} />
                  ))}
                </button>
              </div>
            </nav>

            <div className="flex items-center gap-4">
              <div className="hidden lg:block">
                {user ? <ProfileDropdown /> : (
                  <div className="flex gap-4">
                    <NavLink to="/login" className="bg-white text-black px-6 py-2 rounded-md hover:bg-gray-200 transition-colors font-medium">
                      Login
                    </NavLink>
                    <NavLink to="/register" className="bg-transparent text-white border-2 border-white px-6 py-2 rounded-md hover:bg-white hover:text-black transition-all font-medium">
                      Register
                    </NavLink>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden text-white focus:outline-none z-50 relative w-12 h-10 rounded-lg bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-black/50 transition-all duration-300"
              >
                <div className="w-5 h-4 flex flex-col justify-between relative">
                  <span className={`block h-0.5 bg-white transform transition-all duration-300 rounded-full ${isOpen ? "rotate-45 translate-y-1.5 w-5" : "w-5"}`}></span>
                  <span className={`block h-0.5 bg-white transition-all duration-300 rounded-full ${isOpen ? "opacity-0 w-5" : "w-4 ml-1"}`}></span>
                  <span className={`block h-0.5 bg-white transform transition-all duration-300 rounded-full ${isOpen ? "-rotate-45 -translate-y-1.5 w-5" : "w-3 ml-2"}`}></span>
                </div>
              </button>
            </div>
          </div>
        </header>
      </div>
      
      <div
        className={clsx(
          "lg:hidden fixed top-0 right-0 h-full w-full bg-black/70 backdrop-blur-xl transform transition-all duration-500 ease-in-out z-40",
          {
            "translate-x-0 opacity-100": isOpen,
            "translate-x-full opacity-0": !isOpen,
            "is-open": isOpen,
          }
        )}
      >
        <div className="flex flex-col items-center justify-between p-8 pt-24 w-full h-full">
          <div className="w-full flex flex-col gap-4">
            {navigationLinks.map((link, index) => (
              <NavLink
                key={link.title}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    "menu-item px-6 py-4 rounded-xl transition-all duration-300 ease-in-out text-2xl w-full text-center font-semibold",
                    {
                      "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg": isActive,
                      "text-white hover:bg-white/10": !isActive,
                    }
                  )
                }
                style={{ '--delay': `${index * 0.1}s` }}
              >
                {link.title}
              </NavLink>
            ))}
          </div>

          <div className="w-full">
            {user ? (
              <MobileProfile />
            ) : (
              <div className="flex flex-col gap-4 w-full mt-4">
                <NavLink to="/login" onClick={() => setIsOpen(false)} className="bg-white text-black px-6 py-3 rounded-xl hover:bg-gray-200 transition-all font-medium text-center text-lg">
                  Login
                </NavLink>
                <NavLink to="/register" onClick={() => setIsOpen(false)} className="bg-transparent text-white border-2 border-white px-6 py-3 rounded-xl hover:bg-white hover:text-black transition-all font-medium text-center text-lg">
                  Register
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
