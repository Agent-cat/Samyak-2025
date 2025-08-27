import React, { useState, useEffect } from "react";
import poster1 from "../assets/2025.jpg";
import axios from "axios";

import { useNavigate } from "react-router-dom";

const Events = () => {

  const url = import.meta.env.VITE_API_URL;
  const [events, setEvents] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Prevent background scroll when popup is open
  useEffect(() => {
    if (showRegisterPopup || showSuccessPopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showRegisterPopup, showSuccessPopup]);

  const [error, setError] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState({
    loading: false,
    error: null,
    success: false,
  });

  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        `${url}/api/events`
      );
      const data = response.data;
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to load events");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCategoryClick = (chartIndex, catIndex) => {
    const categoryId = `${chartIndex}-${catIndex}`;
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleRegisterClick = (categoryId, event) => {
    setSelectedEvent({ ...event, categoryId });
    setShowRegisterPopup(true);
  };

  const handleUnregisterClick = async (categoryId, event) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${url}/api/events/${categoryId}/events/${event._id}/unregister`,
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

      // Update local state
      const updatedEvents = events.map((category) => {
        if (category._id === categoryId) {
          const updatedEvents = category.Events.map((e) => {
            if (e._id === event._id) {
              return {
                ...e,
                registeredStudents: e.registeredStudents.filter(
                  (id) => id !== localStorage.getItem("userId")
                ),
              };
            }
            return e;
          });
          return { ...category, Events: updatedEvents };
        }
        return category;
      });
      setEvents(updatedEvents);
      setShowSuccessPopup(true);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRegistrationSubmit = async () => {
    if (!acceptedTerms) {
      setError("Please accept the terms and conditions");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${url}/api/events/${selectedEvent.categoryId}/events/${selectedEvent._id}/register`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.conflictingEvent) {
          setError(`Time Conflict: You are already registered for "${data.conflictingEvent.title}" at ${data.conflictingEvent.time} on ${data.conflictingEvent.date}`);
        } else {
          setError(data.message || "Failed to register for event");
        }
        return;
      }

      setShowRegisterPopup(false);
      setShowSuccessPopup(true);
      setError(null);

      // Update registration status
      setRegistrationStatus(prev => ({
        ...prev,
        [selectedEvent._id]: true
      }));

    } catch (error) {
      setError("An error occurred while registering for the event");
    }
  };

  const SuccessPopup = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-xl max-w-md w-full mx-4">
        <h3 className="text-2xl font-bold text-green-400 mb-4">Success!</h3>
        <p className="text-gray-300 mb-6">Successfully registered for event!</p>
        <button
          onClick={() => setShowSuccessPopup(false)}
          className="w-full bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-all duration-300"
        >
          Close
        </button>
      </div>
    </div>
  );

  const RegisterPopup = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-purple-400 mb-4">
          Register for {selectedEvent?.title}
        </h3>


        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-2">
            Terms and Conditions:
          </h4>
          <div className="bg-gray-700 p-4 rounded-md mb-4 h-auto overflow-y-auto text-gray-300 text-sm">
            {selectedEvent?.termsandconditions ? (
              <ul className="list-decimal pl-4 space-y-2">
                {selectedEvent.termsandconditions.split('.').filter(term => term.trim()).map((term, index) => (
                  <li key={index}>{term.trim()}</li>
                ))}
              </ul>
            ) : (
              <ul className="list-decimal pl-4 space-y-2">
                <li>By registering for this event, you agree to follow all event guidelines and rules.</li>
                <li>Participants must arrive at least 30 minutes before the event start time.</li>
                <li>All participants must carry valid identification.</li>
                <li>The decision of the judges/organizers will be final and binding.</li>
                <li>Any form of misbehavior will result in immediate disqualification.</li>
              </ul>
            )}
          </div>
          <label className="flex items-center gap-2 text-white cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
            />
            I accept the terms and conditions
          </label>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-100">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleRegistrationSubmit}
            disabled={!acceptedTerms}
            className={`flex-1 bg-purple-500 text-white px-6 py-2 rounded-md transition-all duration-300 
              ${!acceptedTerms
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-purple-600"
              }`}
          >
            Confirm Registration
          </button>
          <button
            onClick={() => {
              setShowRegisterPopup(false);
              setSelectedEvent(null);
              setAcceptedTerms(false);
              setError(null);
            }}
            className="px-6 py-2 border border-gray-500 text-gray-300 rounded-md hover:bg-gray-700 transition-all duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const renderEventDetails = (event) => (
    <div>
      <h3>{event.title}</h3>
      <p>{event.details.description}</p>
      <p>Venue: {event.details.venue}</p>
      <p>Date: {event.details.date}</p>
      <p>Start Time: {event.details.startTime}</p>
      <p>End Time: {event.details.endTime}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="flex justify-center items-center pt-14">
        <h1 className="text-4xl font-bold text-purple-400">Events</h1>
      </div>
      <div className="max-w-6xl mx-auto">
        {error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : (
          events.map((chart, chartIndex) => (
            <div key={chartIndex} className="mb-12">
              <div className="border-b-2 border-purple-500 mb-6">
                <h2 className="text-2xl font-bold text-purple-400 mb-4">
                  {chart.categoryName}
                </h2>
              </div>

              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-purple-500"></div>

                <div className="space-y-8">
                  {chart.Events &&
                    chart.Events.map((event, eventIndex) => (
                      <div key={eventIndex} className="flex items-start ml-8">
                        <div className="absolute left-4 -ml-6 mt-2">
                          <div className="w-4 h-4 bg-purple-500 rounded-full relative">
                            <div className="absolute w-4 h-4 bg-purple-500 rounded-full animate-ping opacity-75"></div>
                          </div>
                        </div>

                        <div
                          className={`bg-gray-800 rounded-lg p-4 w-full cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:bg-gray-700 ${expandedCategory === `${chartIndex}-${eventIndex}`
                            ? "ring-2 ring-purple-500"
                            : ""
                            }`}
                          onClick={() =>
                            handleCategoryClick(chartIndex, eventIndex)
                          }
                        >
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-purple-300">
                              {event.title}
                            </h3>
                            <div
                              className={`transform transition-transform duration-300 ${expandedCategory ===
                                `${chartIndex}-${eventIndex}`
                                ? "rotate-180"
                                : ""
                                }`}
                            >
                              ▼
                            </div>
                          </div>

                          <div
                            className={`transition-all duration-500 ease-in-out ${expandedCategory === `${chartIndex}-${eventIndex}`
                              ? "max-h-[800px] opacity-100 mt-4"
                              : "max-h-0 opacity-0 overflow-hidden"
                              }`}
                          >
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                              <div className="w-full md:w-1/3">
                                <img
                                  src={event.image}
                                  alt={event.title}
                                  className="w-full h-48 object-cover rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                                />
                              </div>
                              <div className="flex-1 space-y-4">
                                <div className="flex flex-col space-y-4">
                                  <h3 className="text-xl font-semibold text-purple-400">
                                    {event.title}
                                  </h3>
                                  <div className="text-gray-300">
                                    {renderEventDetails(event)}
                                  </div>
                                  <p>
                                    <span className="font-semibold">Participants:</span>{" "}
                                    {event.registeredStudents.length} / {event.participantLimit}
                                  </p>
                                </div>
                                {event.registeredStudents.includes(
                                  localStorage.getItem("userId")
                                ) ? (
                                  <button
                                    onClick={() => handleUnregisterClick(chart._id, event)}
                                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-300"
                                  >
                                    Unregister
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleRegisterClick(chart._id, event)}
                                    className={`px-4 py-2 rounded-md transition duration-300 ${event.registeredStudents.length >= event.participantLimit
                                      ? "bg-gray-500 cursor-not-allowed"
                                      : "bg-purple-500 hover:bg-purple-600 text-white"
                                      }`}
                                    disabled={event.registeredStudents.length >= event.participantLimit}
                                  >
                                    {event.registeredStudents.length >= event.participantLimit
                                      ? "Event Full"
                                      : "Register"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {showRegisterPopup && <RegisterPopup />}
      {showSuccessPopup && <SuccessPopup />}
    </div>
  );
};

export default Events;
