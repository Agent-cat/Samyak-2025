import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { BentoTilt } from "./BentoTilt"; 

// Helper component for modern, minimalist icons
const Icon = ({ path, className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

// Utility function to format titles like "Samyak" -> "S<b>a</b>myak"
const formatSpecialTitle = (title) => {
  if (!title) return "";
  return title.replace(/^(\w)(\w*)/, (match, first, rest) => `${first}<b>${rest}</b>`);
};

// --- Reusable Components for Cleaner Code ---

const EventButton = ({ onClick, children, className, disabled = false }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    disabled={disabled}
    className={`mt-4 px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black ${className}`}
  >
    {children}
  </button>
);

const ParticipantMeter = ({ current, limit }) => {
  const percentage = limit > 0 ? (current / limit) * 100 : 0;
  return (
    <div className="w-full md:w-48">
      <div className="flex justify-between items-center text-xs font-mono mb-1">
        <span className="text-gray-400">Participants</span>
        <span className="text-white font-bold">{current}/{limit}</span>
      </div>
      <div className="w-full bg-black/50 border border-white/[0.1] rounded-full h-2 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-700 ease-out" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};


const Events = () => {
  const url = import.meta.env.VITE_API_URL;
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();
  const [showSuccessPopup, setShowSuccessPopup] = useState({ show: false, message: "" });
  const [apiError, setApiError] = useState(null);
  const [formError, setFormError] = useState(null);

  const container = useRef();
  const popupsRef = useRef(null);

  // Prevent background scroll when popup is open
  useEffect(() => {
    document.body.style.overflow = (showRegisterPopup || showSuccessPopup.show) ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [showRegisterPopup, showSuccessPopup.show]);

  // Fetch events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${url}/api/events`);
        setEvents(response.data);
        setFilteredEvents(response.data); // Initialize with all events
      } catch (error) {
        console.error("Error fetching events:", error);
        setApiError("Failed to load events. Please try again later.");
      }
    };
    fetchEvents();
  }, [url]);

  // Effect for filtering logic based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredEvents(events); // If search is empty, show all events
      return;
    }

    const lowercasedTerm = searchTerm.toLowerCase();
    const result = events.map(category => ({
      ...category,
      Events: category.Events.filter(event =>
        event.title.toLowerCase().includes(lowercasedTerm) ||
        event.details.description.toLowerCase().includes(lowercasedTerm)
      ),
    })).filter(category => category.Events.length > 0);
    
    setFilteredEvents(result);
  }, [searchTerm, events]);

  // GSAP animations
  useGSAP(() => {
    gsap.fromTo(".animate-in", 
      { opacity: 0, y: 50, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out', stagger: 0.1, delay: 0.2 }
    );
    if (showRegisterPopup || showSuccessPopup.show) {
      gsap.fromTo(popupsRef.current, { opacity: 0, scale: 0.95, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power3.out' });
    }
  }, { scope: container, dependencies: [events, showRegisterPopup, showSuccessPopup.show] });

  // --- Event Handlers ---
  const handleToggleEvent = (eventId) => setExpandedEvent(expandedEvent === eventId ? null : eventId);
  const handleRegisterClick = (category, event) => {
    setSelectedEvent({ ...event, categoryId: category._id });
    setShowRegisterPopup(true);
  };

  const handleUnregisterClick = async (category, event) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      await fetch(
        `${url}/api/events/${category._id}/events/${event._id}/unregister`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      const response = await axios.get(`${url}/api/events`);
      setEvents(response.data);
      setShowSuccessPopup({ show: true, message: "Successfully unregistered from the event!" });
    } catch (err) {
      setFormError("Failed to unregister. Please try again.");
    }
  };

  const handleRegistrationSubmit = async () => {
    if (!acceptedTerms) {
      setFormError("You must accept the terms and conditions to register.");
      gsap.fromTo(popupsRef.current, { x: 0 }, { x: -10, duration: 0.05, yoyo: true, repeat: 5, ease: 'power2.inOut' });
      return;
    }
    setFormError(null);
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const response = await fetch(
        `${url}/api/events/${selectedEvent.categoryId}/events/${selectedEvent._id}/register`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to register.");
      
      setShowRegisterPopup(false);
      setAcceptedTerms(false);
      setSelectedEvent(null);
      setShowSuccessPopup({ show: true, message: "You have successfully registered for the event!" });
      const eventsResponse = await axios.get(`${url}/api/events`);
      setEvents(eventsResponse.data);
    } catch (err) {
      setFormError(err.message);
    }
  };
  
  // --- Popup Components ---
  const SuccessPopup = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div ref={popupsRef} className="bg-[#131315] border border-white/[0.1] p-8 rounded-2xl max-w-md w-full text-center shadow-2xl shadow-cyan-500/10">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-500/20 mb-4 border-2 border-green-500/50">
           <Icon path="M4.5 12.75l6 6 9-13.5" className="h-8 w-8 text-green-400"/>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2 special-font" dangerouslySetInnerHTML={{ __html: formatSpecialTitle("Success!") }}></h3>
        <p className="text-gray-300 mb-6">{showSuccessPopup.message}</p>
        <button
          onClick={() => setShowSuccessPopup({ show: false, message: "" })}
          className="w-full bg-cyan-500 text-black px-6 py-3 rounded-lg font-bold hover:bg-cyan-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#131315]"
        >
          Close
        </button>
      </div>
    </div>
  );
  const RegisterPopup = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div ref={popupsRef} className="bg-[#131315] border border-white/[0.1] p-6 sm:p-8 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl shadow-cyan-500/10">
        <h3 className="text-2xl font-bold text-cyan-400 mb-1 special-font" dangerouslySetInnerHTML={{ __html: formatSpecialTitle(`Register for ${selectedEvent?.title}`) }}></h3>
        <p className="text-gray-400 mb-6">Review the terms before confirming.</p>
        <div className="flex-grow overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          <div className="bg-black/50 p-4 rounded-lg text-gray-300 text-sm border border-white/[0.1]">
            <h4 className="font-bold text-white mb-2">Terms & Conditions:</h4>
            <ul className="list-disc pl-5 space-y-2">
              {selectedEvent?.termsandconditions?.split('.').filter(term => term.trim()).map((term, index) => (
                <li key={index} className="marker:text-cyan-400">{term.trim()}</li>
              )) || <li>Terms will be displayed here.</li>}
            </ul>
          </div>
           <label className="flex items-center gap-3 text-white cursor-none mt-4 select-none p-2 rounded-md hover:bg-white/5 transition-colors duration-200">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="appearance-none h-5 w-5 rounded-sm bg-black border-2 border-gray-600 checked:bg-cyan-500 checked:border-cyan-400 transition duration-200 focus:ring-2 focus:ring-cyan-500/50 focus:outline-none"
            />
            I have read and accept the terms and conditions.
          </label>
        </div>
        {formError && <div className="mt-4 p-3 bg-red-900/50 border border-red-500/30 rounded-lg text-red-300 text-sm">{formError}</div>}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/[0.1] mt-6">
           <button onClick={handleRegistrationSubmit} disabled={!acceptedTerms} className="flex-1 px-6 py-3 bg-cyan-500 text-black rounded-lg font-bold transition-all duration-300 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/80 focus:ring-offset-2 focus:ring-offset-[#131315]">Confirm Registration</button>
           <button onClick={() => { setShowRegisterPopup(false); setFormError(null); setAcceptedTerms(false); }} className="flex-1 sm:flex-initial px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">Cancel</button>
        </div>
      </div>
    </div>
  );

  return (
    <div ref={container} className="min-h-screen bg-black text-gray-200 font-sans overflow-x-hidden">
  
      <div className="flex justify-center items-center pt-24 pb-12 sm:pt-32 sm:pb-16 animate-in">
        <h1 className="text-5xl md:text-7xl font-bold text-white special-font" dangerouslySetInnerHTML={{ __html: formatSpecialTitle("EVENTS") }}></h1>
      </div>

      {/* --- SEARCH BAR SECTION --- */}
      <div className="max-w-xl mx-auto px-4 mb-12 animate-in">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search all events by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#131315] border border-white/[0.1] rounded-full py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Icon path="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </div>
        </div>
      </div>
     
      <main className="max-w-4xl mx-auto px-4">
        {apiError ? (
          <div className="text-red-400 text-center p-8 bg-[#131315] rounded-lg">{apiError}</div>
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map((category, categoryIndex) => (
            <div key={category._id}>
                {categoryIndex > 0 && <hr className="w-1/2 mx-auto border-t-0 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent h-[1px] my-16" />}
                <div className="mb-16 animate-in">
                  <div className="mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-cyan-400 special-font" dangerouslySetInnerHTML={{ __html: formatSpecialTitle(category.categoryName) }}/>
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/[0.08]"></div>
                    <div className="space-y-8">
                      {category.Events?.map((event) => (
                          <div key={event._id} className="relative flex items-start ml-4 sm:ml-8 group">
                            <div className="absolute -left-8 -ml-[1.1rem] mt-3 z-10">
                                 <div className="w-3 h-3 bg-cyan-400 rounded-full transition-all duration-300 group-hover:scale-125 group-hover:shadow-[0_0_15px_rgba(56,189,248,0.7)] animate-pulse group-hover:animate-none"></div>
                            </div>
                            <BentoTilt className="w-full">
                               <div
                                className="bg-[#131315] rounded-2xl p-4 sm:p-6 w-full cursor-none transition-all duration-300 border border-white/[0.1] hover:border-cyan-400/70 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1 hover:bg-[#1c1c1f]"
                                onClick={() => handleToggleEvent(event._id)}
                              >
                                <div className="flex justify-between items-center">
                                  <h3 className="text-lg sm:text-xl font-bold text-white special-font" dangerouslySetInnerHTML={{ __html: formatSpecialTitle(event.title) }}></h3>
                                  <div className={`transform transition-transform duration-500 ease-out text-cyan-400 ${expandedEvent === event._id ? "rotate-180" : ""}`}>
                                    <Icon path="M19.5 8.25l-7.5 7.5-7.5-7.5" className="w-6 h-6"/>
                                  </div>
                                </div>
                                 <div className={`grid transition-all duration-700 ease-in-out ${expandedEvent === event._id ? 'grid-rows-[1fr] opacity-100 pt-6' : 'grid-rows-[0fr] opacity-0'}`}>
                                   <div className="overflow-hidden">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                                      <div className="relative w-full h-48 md:h-full rounded-lg overflow-hidden border border-white/[0.1]">
                                        <img src={event.image} alt={event.title} className="w-full h-full object-cover"/>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                      </div>
                                      <div className="md:col-span-2 space-y-4">
                                          <div className="space-y-3 text-gray-300 leading-relaxed">
                                              <p>{event.details.description}</p>
                                              <div className="flex items-center gap-3"><Icon path="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /><span>{event.details.venue}</span></div>
                                              <div className="flex items-center gap-3"><Icon path="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" /><span>{new Date(event.details.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                                              <div className="flex items-center gap-3"><Icon path="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /><span>{event.details.startTime} - {event.details.endTime}</span></div>
                                          </div>
                                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-2">
                                            <ParticipantMeter current={event.registeredStudents.length} limit={event.participantLimit} />
                                             {event.registeredStudents.includes(localStorage.getItem("userId")) ? (
                                                <EventButton onClick={() => handleUnregisterClick(category, event)} className="bg-red-600 text-white hover:bg-red-500">Unregister</EventButton>
                                              ) : event.registeredStudents.length >= event.participantLimit ? (
                                                <EventButton disabled className="bg-gray-700 text-gray-400 cursor-not-allowed">Event Full</EventButton>
                                              ) : (
                                                <EventButton onClick={() => handleRegisterClick(category, event)} className="bg-cyan-500 text-black hover:bg-cyan-400">Register Now</EventButton>
                                              )}
                                          </div>
                                      </div>
                                    </div>
                                   </div>
                                </div>
                              </div>
                            </BentoTilt>
                          </div>
                      ))}
                    </div>
                  </div>
                </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 animate-in">
            <h3 className="text-2xl font-bold text-gray-400 special-font" dangerouslySetInnerHTML={{ __html: formatSpecialTitle("No Events Found") }}></h3>
            <p className="text-gray-500 mt-2">Try adjusting your search terms.</p>
          </div>
        )}
      </main>

      {showRegisterPopup && <RegisterPopup />}
      {showSuccessPopup.show && <SuccessPopup />}
    </div>
  );
};

export default Events;
