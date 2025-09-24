import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoLocationSharp,
  IoCalendarClear,
  IoTime,
  IoSearch,
  IoList,
  IoGrid,
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";


const IconWrapper = ({ children, className }) => (
  <div className={`text-white ${className}`}>{children}</div>
);


const ConfirmationModal = ({ event, onConfirm, onCancel }) => {
  if (!event) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-gray-900/50 border border-white/20 p-8 rounded-2xl max-w-md w-full shadow-2xl shadow-gray-800"
      >
        <h3 className="text-2xl font-bold text-white mb-4">
          Confirm Unregistration
        </h3>
        <p className="text-gray-300 mb-8">
          Are you sure you want to unregister from{" "}
          <strong className="text-white">{event.title}</strong>?
        </p>
        <div className="flex gap-4">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-red-700 transition-all duration-300"
          >
            Unregister
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-700 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Event Card for List View
const EventCard = ({ event, onUnregister, isExpanded, onExpand }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className="bg-gray-900/50 border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:border-white/30 transition-all duration-300"
  >
    <div className="relative h-48 group">
      <img
        src={event.image}
        alt={event.title}
        className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
        {event.categoryName}
      </div>
    </div>
    <div className="p-5">
      <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
      <div className="cursor-pointer" onClick={onExpand}>
        <motion.p
          animate={{ height: isExpanded ? "auto" : "40px" }} // Limit to 2 lines (~40px) when not expanded
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="text-gray-400 text-sm overflow-hidden mb-4"
        >
          {event.details.description}
        </motion.p>
      </div>
      <div className="space-y-3 border-t border-white/10 pt-4">
        <div className="flex items-center gap-3 text-sm text-gray-300">
          <IconWrapper>
            <IoCalendarClear />
          </IconWrapper>
          <span>{new Date(event.details.date).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-300">
          <IconWrapper>
            <IoTime />
          </IconWrapper>
          <span>{event.details.time}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-300">
          <IconWrapper>
            <IoLocationSharp />
          </IconWrapper>
          <span>{event.details.venue}</span>
        </div>
      </div>
      <button
        onClick={() => onUnregister(event)}
        className="w-full mt-5 bg-red-600/20 border border-red-500/50 text-red-300 px-4 py-2 rounded-lg hover:bg-red-600/40 hover:text-white transition duration-300 text-sm font-semibold"
      >
        Unregister
      </button>
    </div>
  </motion.div>
);

// Timeline View Component
const TimelineView = ({ groupedEvents, onUnregister }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      visible: { transition: { staggerChildren: 0.1 } },
    }}
    className="max-w-4xl mx-auto"
  >
    {Object.entries(groupedEvents)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
      .map(([date, eventsOnDate]) => (
        <motion.div
          key={date}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          className="relative pl-8 py-6"
        >
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white/20"></div>
          <div className="absolute left-[-9px] top-9 w-5 h-5 bg-white rounded-full border-4 border-black"></div>
          <h3 className="text-xl font-semibold text-white mb-6">
            {new Date(date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </h3>
          <div className="space-y-4">
            {eventsOnDate
              .sort((a, b) => a.details.time.localeCompare(b.details.time))
              .map((event) => (
                <motion.div
                  key={event.eventId}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  className="bg-gray-900/50 p-4 rounded-xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="flex-1">
                    <span className="text-xs bg-gray-700 text-white px-2 py-0.5 rounded-full font-medium mb-2 inline-block">
                      {event.categoryName}
                    </span>
                    <h4 className="font-bold text-white">{event.title}</h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400 mt-1">
                      <span className="flex items-center gap-1.5"><IoTime /> {event.details.time}</span>
                      <span className="flex items-center gap-1.5"><IoLocationSharp /> {event.details.venue}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onUnregister(event)}
                    className="bg-red-600/20 border border-red-500/50 text-red-300 px-3 py-1.5 rounded-md hover:bg-red-600/40 hover:text-white transition duration-300 text-xs font-semibold"
                  >
                    Unregister
                  </button>
                </motion.div>
              ))}
          </div>
        </motion.div>
      ))}
  </motion.div>
);


// --- Main RegisteredEvents Component ---

const RegisteredEvents = () => {
  const url = import.meta.env.VITE_API_URL;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list"); // "list" or "timeline"
  const [showConfirmUnregister, setShowConfirmUnregister] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const response = await fetch(`${url}/api/events/registered`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch registered events");
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRegisteredEvents();
  }, [url, navigate]);

  const filteredEvents = useMemo(() =>
    events.filter(
      (event) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    ), [events, searchTerm]
  );

  const groupedEvents = useMemo(() => {
    return filteredEvents.reduce((acc, event) => {
      const date = event.details.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(event);
      return acc;
    }, {});
  }, [filteredEvents]);

  const handleUnregisterClick = (event) => {
    setSelectedEvent(event);
    setShowConfirmUnregister(true);
  };

  const confirmUnregister = async () => {
    if (!selectedEvent) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await fetch(
        `${url}/api/events/${selectedEvent.categoryId}/events/${selectedEvent.eventId}/unregister`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Unregistration failed");
      }
      setEvents(events.filter((e) => e.eventId !== selectedEvent.eventId));
      setShowConfirmUnregister(false);
      setSelectedEvent(null);
    } catch (err) {
      setError(err.message);
      // Keep the modal open to show the error if desired, or handle it differently
    }
  };
  
  // Render loading and error states
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl text-red-400 bg-red-900/20 p-4 rounded-lg"
        >
          Error: {error}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 relative">
      {/* Background grid - subtle, black and white version */}
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      
      <div className="pt-20"></div> {/* Spacing for fixed headers/nav */}
      <div className="max-w-7xl mx-auto relative z-10">
        <AnimatePresence>
          {showConfirmUnregister && (
            <ConfirmationModal
              event={selectedEvent}
              onConfirm={confirmUnregister}
              onCancel={() => setShowConfirmUnregister(false)}
            />
          )}
        </AnimatePresence>
        
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl sm:text-5xl font-bold text-white mb-10 text-center"
        >
          My Schedule
        </motion.h1>

        {/* Controls Panel */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <div className="relative w-full max-w-sm">
            <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search events or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-lg bg-gray-900/50 text-white border border-white/20 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/50 transition-all"
            />
          </div>
          <div className="flex gap-2 bg-gray-900/50 border border-white/20 p-1 rounded-lg">
            {["list", "timeline"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`relative px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                  viewMode === mode ? "text-black" : "text-gray-400 hover:text-white"
                }`}
              >
                {viewMode === mode && (
                  <motion.div
                    layoutId="viewModeHighlight"
                    className="absolute inset-0 bg-white rounded-md"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10 capitalize flex items-center gap-2">
                  {mode === 'list' ? <IoGrid /> : <IoList />}
                  {mode}
                </span>
              </button>
            ))}
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {filteredEvents.length > 0 ? (
              viewMode === "list" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredEvents.map((event) => (
                    <EventCard
                      key={event.eventId}
                      event={event}
                      onUnregister={handleUnregisterClick}
                      isExpanded={expandedEvent === event.eventId}
                      onExpand={() => setExpandedEvent(expandedEvent === event.eventId ? null : event.eventId)}
                    />
                  ))}
                </div>
              ) : (
                <TimelineView
                  groupedEvents={groupedEvents}
                  onUnregister={handleUnregisterClick}
                />
              )
            ) : (
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
              >
                <p className="text-gray-400">
                  {events.length === 0 
                    ? "You haven't registered for any events yet."
                    : "No events match your search."}
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RegisteredEvents;
