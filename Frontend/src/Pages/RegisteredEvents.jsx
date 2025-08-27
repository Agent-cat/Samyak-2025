import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoLocationSharp,
  IoCalendarClear,
  IoTime,
  IoChevronDown,
  IoChevronUp,
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const RegisteredEvents = () => {
  const url = import.meta.env.VITE_API_URL;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list"); // "list" or "timetable"
  const [showConfirmUnregister, setShowConfirmUnregister] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  const fetchRegisteredEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${url}/api/events/registered`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch registered events");
      }

      const data = await response.json();
      console.log("Fetched events:", data); // Debug log
      setEvents(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegisteredEvents();
  }, []);

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group events by date for timetable view
  const groupedEvents = useMemo(() => {
    const groups = {};
    filteredEvents.forEach((event) => {
      const date = event.details.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(event);
    });
    return groups;
  }, [filteredEvents]);

  const handleUnregister = async (event) => {
    console.log("Unregistering event:", event); // Debug log
    setSelectedEvent(event);
    setShowConfirmUnregister(true);
  };

  const confirmUnregister = async () => {
    try {
      console.log("Selected event for unregister:", selectedEvent);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${url}/api/events/${selectedEvent.categoryId}/events/${selectedEvent.eventId}/unregister`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        setError(data.message);
        return;
      }

      // Remove the event from the local state
      setEvents(events.filter((e) => e.eventId !== selectedEvent.eventId));
      setShowConfirmUnregister(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error("Unregister error:", error);
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full"
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
    <div className="min-h-screen bg-black text-white p-8">
      <div className="pt-12"></div>
      <div className="max-w-6xl mx-auto">
        {/* Confirmation Modal */}
        {showConfirmUnregister && selectedEvent && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-xl max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-purple-400 mb-4">
                Confirm Unregistration
              </h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to unregister from {selectedEvent.title}?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={confirmUnregister}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-300"
                >
                  Unregister
                </button>
                <button
                  onClick={() => {
                    setShowConfirmUnregister(false);
                    setSelectedEvent(null);
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-bold text-purple-400 mb-8 text-center"
        >
          Registered Events
        </motion.h1>

        <div className="mb-8">
          <input
            type="text"
            placeholder="Search events by title or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md mx-auto block px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-purple-400"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg ${
                viewMode === "list"
                  ? "bg-purple-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode("timetable")}
              className={`px-4 py-2 rounded-lg ${
                viewMode === "timetable"
                  ? "bg-purple-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Timetable View
            </button>
          </div>
        </div>

        {viewMode === "list" ? (
          // List View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredEvents.map((event) => (
                <motion.div
                  key={event.eventId}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5 }}
                  className="bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-purple-400/10 transition-all duration-300"
                >
                  <div className="relative h-48 group">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-0 left-0 bg-purple-400 text-white px-3 py-1 m-2 rounded-full text-sm">
                      {event.categoryName}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-purple-400 mb-2">
                      {event.title}
                    </h3>
                    <div
                      className="cursor-pointer"
                      onClick={() =>
                        setExpandedEvent(
                          expandedEvent === event.eventId ? null : event.eventId
                        )
                      }
                    >
                      <div className="flex justify-between items-center mb-2">
                        <p
                          className={`text-gray-400 ${
                            expandedEvent === event.eventId
                              ? ""
                              : "line-clamp-2"
                          }`}
                        >
                          {event.details.description}
                        </p>
                        {expandedEvent === event.eventId ? (
                          <IoChevronUp className="text-purple-400" />
                        ) : (
                          <IoChevronDown className="text-purple-400" />
                        )}
                      </div>
                    </div>
                    <div className="space-y-3 mt-4">
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-2 text-sm text-gray-400"
                      >
                        <IoLocationSharp className="text-purple-400" />
                        <span>{event.details.venue}</span>
                      </motion.div>
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-2 text-sm text-gray-400"
                      >
                        <IoCalendarClear className="text-purple-400" />
                        <span>{event.details.date}</span>
                      </motion.div>
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-2 text-sm text-gray-400"
                      >
                        <IoTime className="text-purple-400" />
                        <span>{event.details.time}</span>
                      </motion.div>
                      <button
                        onClick={() => handleUnregister(event)}
                        className="w-full mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-300"
                      >
                        Unregister
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          // Timetable View
          <div className="overflow-x-auto">
            <table className="w-full bg-gray-900 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-purple-500 text-white">
                  <th className="px-6 py-3 text-left font-semibold">Date</th>
                  <th className="px-6 py-3 text-left font-semibold">Time</th>
                  <th className="px-6 py-3 text-left font-semibold">Event</th>
                  <th className="px-6 py-3 text-left font-semibold">Category</th>
                  <th className="px-6 py-3 text-left font-semibold">Venue</th>
                  <th className="px-6 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedEvents)
                  .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
                  .map(([date, events]) => (
                    <React.Fragment key={date}>
                      <tr className="bg-purple-900/30">
                        <td colSpan="6" className="px-6 py-3 text-purple-400 font-semibold">
                          {new Date(date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </td>
                      </tr>
                      {events
                        .sort((a, b) => {
                          const timeA = a.details.time.split(':').map(Number);
                          const timeB = b.details.time.split(':').map(Number);
                          return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
                        })
                        .map((event, index) => (
                          <motion.tr
                            key={event.eventId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="border-b border-gray-800 hover:bg-gray-800/50"
                          >
                            <td className="px-6 py-4 text-gray-300">
                              {event.details.date}
                            </td>
                            <td className="px-6 py-4 text-gray-300">
                              <div className="flex items-center gap-2">
                                <IoTime className="text-purple-400" />
                                {event.details.time}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <h4 className="font-semibold text-purple-400">
                                  {event.title}
                                </h4>
                                <p className="text-sm text-gray-400 line-clamp-2 mt-1">
                                  {event.details.description}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="bg-purple-400/20 text-purple-400 px-3 py-1 rounded-full text-sm">
                                {event.categoryName}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-gray-300">
                                <IoLocationSharp className="text-purple-400" />
                                {event.details.venue}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleUnregister(event)}
                                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-300 text-sm flex items-center gap-2"
                              >
                                <span>Unregister</span>
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                    </React.Fragment>
                  ))}
                {Object.keys(groupedEvents).length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                      No events found for the selected filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisteredEvents;
