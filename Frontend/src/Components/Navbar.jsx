import clsx from "clsx";
import gsap from "gsap";
import { useWindowScroll } from "react-use";
import { useEffect, useRef, useState, useMemo } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { NavItems, adminNavItems } from "../Constants/Constants";
import klLogo from "../assets/kl.png";
import {
  getUser,
  removeToken,
  removeUser,
  setUser as persistUser,
  getToken,
} from "../utils/auth";

const Navbar = ({ isAudioPlaying, setIsAudioPlaying, audioElementRef }) => {
  const [user, setUser] = useState(getUser());
  const url = import.meta.env.VITE_API_URL;
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const linksContainerRef = useRef(null);
  const [useMobileNav, setUseMobileNav] = useState(false);
  const token = getToken();

  const ProfileDropdown = () => (
    <div className="relative" ref={profileRef}>
      <button
        onClick={() => setIsProfileOpen(!isProfileOpen)}
        className="flex items-center gap-3 text-white hover:text-gray-200 transition-all duration-200 hover:scale-105"
      >
        <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-white/20 shadow-lg">
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt={user?.fullName || "User"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className={`absolute inset-0 bg-black flex items-center justify-center font-bold text-white text-lg ${
              user?.profileImage ? "hidden" : "flex"
            }`}
          >
            {user?.fullName?.charAt(0)?.toUpperCase() || "?"}
          </div>
        </div>
        <div className="flex flex-col items-start">
          <span className="font-semibold text-sm">
            {user?.fullName || "User"}
          </span>
          <span className="text-xs text-gray-300">{user?.role || "User"}</span>
        </div>
      </button>

      {isProfileOpen && (
        <div className="absolute right-0 z-50 mt-3 w-72 rounded-xl border border-white/10 bg-black/80 py-2 shadow-2xl backdrop-blur-lg">
          <div className="border-b border-white/10 px-6 py-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-white/20 shadow-lg">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user?.fullName || "User"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`absolute inset-0 bg-black flex items-center justify-center font-bold text-white text-lg ${
                    user?.profileImage ? "hidden" : "flex"
                  }`}
                >
                  {user?.fullName?.charAt(0)?.toUpperCase() || "?"}
                </div>
              </div>
              <div>
                <p className="text-lg font-semibold text-white">
                  {user?.fullName}
                </p>
                <p className="text-sm text-gray-300">{user?.email}</p>
              </div>
            </div>
          </div>
          <div className="border-b border-white/10 px-6 py-4">
            <p className="flex justify-between text-sm text-gray-300">
              <span>College:</span>
              <span className="text-white">{user?.college}</span>
            </p>
            <p className="mt-2 flex justify-between text-sm text-gray-300">
              <span>ID:</span>
              <span className="text-white">{user?.collegeId}</span>
            </p>
            <p className="mt-2 flex justify-between text-sm text-gray-300">
              <span>Payment Status:</span>
              <span
                className={clsx("font-semibold", {
                  "text-green-500": user?.paymentStatus === "approved",
                  "text-yellow-500": user?.paymentStatus !== "approved",
                })}
              >
                {user?.paymentStatus || "N/A"}
              </span>
            </p>
          </div>
          <div className="px-4 py-3">
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-black py-2.5 font-medium text-white transition-all duration-300 hover:bg-white hover:text-black"
            >
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const MobileProfile = () => (
    <div className="mt-6 border-t border-white/10 pt-6">
      <div className="mb-6 flex items-center gap-4">
        <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-white/20 shadow-lg">
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt={user?.fullName || "User"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className={`absolute inset-0 bg-black flex items-center justify-center font-bold text-white text-xl ${
              user?.profileImage ? "hidden" : "flex"
            }`}
          >
            {user?.fullName?.charAt(0)?.toUpperCase() || "?"}
          </div>
        </div>
        <div className="flex flex-col">
          <p className="text-lg font-semibold text-white">
            {user?.fullName || "User"}
          </p>
          <p className="text-sm text-gray-300">{user?.email}</p>
          <p className="text-xs text-purple-300 font-medium">
            {user?.role || "User"}
          </p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-black py-3 font-medium text-white transition-all duration-300 hover:bg-white hover:text-black"
      >
        <span>Logout</span>
      </button>
    </div>
  );

  const isAdmin = user?.role === "admin";
  const isPrivileged = ["admin", "hod", "manager"].includes(user?.role);
  const navigationLinks = isAdmin ? [...NavItems, adminNavItems] : NavItems;
  const extendedLinks = useMemo(() => {
    if (!isPrivileged) return navigationLinks;
    return [...navigationLinks, { title: "Events Panel", to: "/events-panel" }];
  }, [navigationLinks, isPrivileged]);

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

  // Keep user profile fresh (including paymentStatus and role) from secure /me
  useEffect(() => {
    const fetchAndSyncUser = async () => {
      try {
        if (!url || !token) return;
        const res = await fetch(`${url}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const latest = await res.json();
        const merged = { ...user, ...latest };
        if (JSON.stringify(merged) !== JSON.stringify(user)) {
          persistUser(merged);
          setUser(merged);
        }
      } catch (e) {
        // ignore
      }
    };
    fetchAndSyncUser();
    const id = setInterval(fetchAndSyncUser, 15000);
    return () => clearInterval(id);
  }, [token, url]);

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

  // Auto-switch to hamburger if nav links overflow available width
  useEffect(() => {
    const container = linksContainerRef.current;
    if (!container) return;

    const evaluateOverflow = () => {
      // Force block display temporarily to measure children
      const previousDisplay = container.style.display;
      if (getComputedStyle(container).display === "none") {
        container.style.display = "block";
      }
      const hasOverflow = container.scrollWidth > container.clientWidth;
      // Also consider very long link lists by summing children widths
      let childrenTotalWidth = 0;
      container.childNodes.forEach((node) => {
        if (node.getBoundingClientRect) {
          const rect = node.getBoundingClientRect();
          childrenTotalWidth += rect.width;
        }
      });
      const containerWidth = container.getBoundingClientRect().width;
      const isOverflowing = hasOverflow || childrenTotalWidth > containerWidth;
      setUseMobileNav(isOverflowing);
      container.style.display = previousDisplay;
    };

    const resizeObserver = new ResizeObserver(() => evaluateOverflow());
    resizeObserver.observe(container);
    window.addEventListener("resize", evaluateOverflow);
    evaluateOverflow();
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", evaluateOverflow);
    };
  }, [extendedLinks]);

  const handleLogout = () => {
    removeToken();
    removeUser();
    setUser(null);
    setIsProfileOpen(false);
    setIsOpen(false);
    navigate("/login");
  };

  const navContainerRef = useRef(null);
  const { y: currentScrollY } = useWindowScroll();
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Function to toggle the audio state
  const toggleAudioIndicator = () => {
    if (audioElementRef.current) {
      const newAudioState = !isAudioPlaying;
      setIsAudioPlaying(newAudioState);
      localStorage.setItem(
        "audio_preference",
        newAudioState ? "enabled" : "disabled"
      );
    }
  };

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
  }, [currentScrollY, lastScrollY]);

  useEffect(() => {
    gsap.to(navContainerRef.current, {
      y: isNavVisible ? 0 : -120,
      duration: 0.3,
      ease: "power2.out",
    });
  }, [isNavVisible]);

  return (
    <div className="overflow-x-hidden">
      <div
        ref={navContainerRef}
        className="fixed inset-x-0 top-4 z-50 h-16 transition-all duration-700 sm:inset-x-6"
      >
        <header className="absolute top-1/2 w-full -translate-y-1/2">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex pl-8 items-center justify-center gap-3"
            >
              <h1 className="ml-8 text-white font-bold hidden md:flex md:text-2xl">
                SAMYAK
              </h1>
              <img
                className="w-16 h-auto"
                src="/img/samyak.svg"
                alt="Samyak Logo"
              />
              <img className="w-20 h-auto" src={klLogo} alt="KL Logo" />
            </Link>
            <nav className="flex size-full items-center justify-center p-4 text-2xl font-bold">
              <div className="flex h-full items-center">
                <div
                  ref={linksContainerRef}
                  className={clsx({
                    hidden: useMobileNav,
                    "md:block": !useMobileNav,
                  })}
                >
                  {extendedLinks.map((item, index) => (
                    <NavLink
                      to={item.to}
                      key={index}
                      className="nav-hover-btn cursor-target px-4 py-2"
                    >
                      {item.title}
                    </NavLink>
                  ))}
                </div>
                <button
                  onClick={toggleAudioIndicator}
                  className="ml-10 flex cursor-pointer items-center space-x-0.5"
                >
                  {[1, 2, 3, 4].map((bar) => (
                    <div
                      key={bar}
                      className={clsx("indicator-line", {
                        active: isAudioPlaying,
                      })}
                      style={{ animationDelay: `${bar * 0.1}s` }}
                    />
                  ))}
                </button>
              </div>
            </nav>

            <div className="flex items-center gap-4">
              <div className="hidden lg:block">
                {user ? (
                  <ProfileDropdown />
                ) : (
                  <div className="flex gap-4">
                    <NavLink
                      to="/login"
                      className="cursor-target rounded-md bg-white px-6 py-2 font-bold text-black transition-colors hover:bg-gray-200"
                    >
                      Login
                    </NavLink>
                    <NavLink
                      to="/register"
                      className="cursor-target rounded-md border-2 border-white bg-transparent mr-4 px-6 py-2 font-bold text-white transition-all hover:text-red-500"
                    >
                      Register
                    </NavLink>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                  "relative z-50 h-10 w-12 items-center justify-center rounded-lg border border-white/10 bg-black/30 text-white transition-all duration-300 hover:bg-black/50 focus:outline-none",
                  useMobileNav ? "flex" : "hidden"
                )}
              >
                <div className="relative flex h-4 w-5 flex-col justify-between">
                  <span
                    className={`block h-0.5 rounded-full bg-white transition-all duration-300 ${
                      isOpen ? "w-5 translate-y-1.5 rotate-45" : "w-5"
                    }`}
                  ></span>
                  <span
                    className={`block h-0.5 rounded-full bg-white transition-all duration-300 ${
                      isOpen ? "w-5 opacity-0" : "ml-1 w-4"
                    }`}
                  ></span>
                  <span
                    className={`block h-0.5 rounded-full bg-white transition-all duration-300 ${
                      isOpen ? "w-5 -translate-y-1.5 -rotate-45" : "ml-2 w-3"
                    }`}
                  ></span>
                </div>
              </button>
            </div>
          </div>
        </header>
      </div>

      <div
        className={clsx(
          "fixed inset-0 right-0 top-0 z-40 h-full w-full transform backdrop-blur-xl transition-all duration-500 ease-in-out",
          {
            "translate-x-0 opacity-100": isOpen,
            "translate-x-full opacity-0": !isOpen,
            "is-open": isOpen,
          }
        )}
      >
        <div className="flex h-full w-full flex-col items-center justify-between p-8 pt-24">
          <div className="flex w-full flex-col gap-3">
            {extendedLinks.map((link, index) => (
              <NavLink
                key={link.title}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    "menu-item w-full rounded-xl px-6 py-4 text-center text-2xl font-semibold transition-all duration-300 ease-in-out",
                    {
                      "bg-white bg-gradient-to-r text-black shadow-lg":
                        isActive,
                      "text-white hover:bg-white/10": !isActive,
                    }
                  )
                }
                style={{ "--delay": `${index * 0.1}s` }}
              >
                {link.title}
              </NavLink>
            ))}
          </div>

          <div className="w-full">
            {user ? (
              <MobileProfile />
            ) : (
              <div className="mt-4 flex w-full flex-col gap-4">
                <NavLink
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="cursor-target rounded-xl bg-white px-6 py-3 text-center text-lg font-medium text-black transition-all hover:bg-gray-200"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border-2 border-white bg-transparent px-6 py-3 text-center text-lg font-medium text-white transition-all hover:bg-white hover:text-black"
                >
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
