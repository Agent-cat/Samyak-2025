import React, { useState, useEffect, useCallback, useMemo } from "react";
import { IoChevronDown, IoChevronUp, IoPeople, IoSchool, IoPerson, IoCheckmarkCircle, IoTime, IoCloseCircle, IoLogIn } from "react-icons/io5";
import * as XLSX from "xlsx";

const EventModal = React.memo(
  ({
    eventForm,
    setEventForm,
    handleEventSubmit,
    closeEventModal,
    editingEvent,
  }) => {
    const url = import.meta.env.VITE_API_URL;
    const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

    const handleEventImageChange = async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (!/^image\/(jpeg|jpg|png|webp)$/.test(file.type)) {
        alert("Only JPG, JPEG, PNG or WEBP images are allowed.");
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        alert("Image size should not exceed 2MB.");
        return;
      }

      try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch(`${url}/api/events/upload`, {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to upload image");
        }
        setEventForm({ ...eventForm, image: data.url });
      } catch (err) {
        alert(err.message || "Failed to upload image");
      }
    };
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
        <div className="bg-gray-800 rounded-xl w-full max-w-2xl my-8 mx-4 relative">
          <button
            onClick={closeEventModal}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <form onSubmit={handleEventSubmit} className="p-6 space-y-4">
            <h3 className="text-2xl font-bold text-purple-400 pr-8 mb-4">
              {editingEvent ? "Edit Event" : "Add New Event"}
              {selectedSubcategory && " (Subcategory)"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-purple-300 mb-2">Title</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, title: e.target.value })
                  }
                  className="w-full bg-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-purple-300 mb-2">
                  Description
                </label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, description: e.target.value })
                  }
                  className="w-full bg-gray-700 rounded-lg p-2.5 text-white h-24 resize-y min-h-[96px] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-purple-300 mb-2">Venue</label>
                  <input
                    type="text"
                    value={eventForm.venue}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, venue: e.target.value })
                    }
                    className="w-full bg-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-purple-300 mb-2">Date</label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, date: e.target.value })
                    }
                    className="w-full bg-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-purple-300 mb-2">Start Time</label>
                <input
                  type="time"
                  value={eventForm.startTime}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, startTime: e.target.value })
                  }
                  className="w-full bg-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-purple-300 mb-2">End Time</label>
                <input
                  type="time"
                  value={eventForm.endTime}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, endTime: e.target.value })
                  }
                  className="w-full bg-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-purple-300 mb-2">Event Image</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleEventImageChange}
                  className="w-full bg-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                {eventForm.image && (
                  <div className="mt-3">
                    <img
                      src={eventForm.image}
                      alt="Event"
                      className="w-40 h-40 object-cover rounded border border-gray-600"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-purple-300 mb-2">
                  Participation Limit
                </label>
                <input
                  type="number"
                  value={eventForm.participantLimit}
                  onChange={(e) =>
                    setEventForm({
                      ...eventForm,
                      participantLimit: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-purple-300 mb-2">
                  Event Type
                </label>
                <select
                  value={eventForm.eventType}
                  onChange={(e) =>
                    setEventForm({
                      ...eventForm,
                      eventType: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="technical">Technical</option>
                  <option value="non-technical">Non-Technical</option>
                </select>
              </div>

              <div>
                <label className="block text-purple-300 mb-2">
                  Terms and Conditions
                </label>
                <textarea
                  value={eventForm.termsandconditions}
                  onChange={(e) =>
                    setEventForm({
                      ...eventForm,
                      termsandconditions: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 rounded-lg p-2.5 text-white h-24 resize-y min-h-[96px] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                className="flex-1 bg-purple-500 text-white px-6 py-2.5 rounded-lg transition-all duration-300 hover:bg-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                {editingEvent ? "Update Event" : "Create Event"}
              </button>
              <button
                type="button"
                onClick={closeEventModal}
                className="flex-1 bg-gray-600 text-white px-6 py-2.5 rounded-lg transition-all duration-300 hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
);

const CategoryModal = React.memo(
  ({
    categoryForm,
    setCategoryForm,
    handleCategorySubmit,
    closeCategoryModal,
  }) => {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
        <div className="bg-gray-800 rounded-xl w-full max-w-md my-8 mx-4 relative">
          <button
            onClick={closeCategoryModal}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <form onSubmit={handleCategorySubmit} className="p-6">
            <h3 className="text-2xl font-bold text-purple-400 pr-8 mb-4">
              Add New Category
            </h3>

            <div className="mb-6">
              <label className="block text-purple-300 mb-2">
                Category Name
              </label>
              <input
                type="text"
                value={categoryForm.categoryName}
                onChange={(e) =>
                  setCategoryForm({ categoryName: e.target.value })
                }
                className="w-full bg-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                placeholder="Enter category name"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-purple-500 text-white px-6 py-2.5 rounded-lg transition-all duration-300 hover:bg-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                Create Category
              </button>
              <button
                type="button"
                onClick={closeCategoryModal}
                className="flex-1 bg-gray-600 text-white px-6 py-2.5 rounded-lg transition-all duration-300 hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
);

const EventRegistrations = ({ event, onClose }) => {
  const exportToExcel = () => {
    // Prepare the data for export
    const exportData = event.registeredStudents.map((student) => ({
      "Full Name": student.fullName,
      Email: student.email,
      College: student.college,
      "College ID": student.collegeId,
      Event: event.title,
      Category: event.category?.categoryName || "N/A",
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registrations");

    // Generate filename with event title and date
    const fileName = `${event.title}_registrations_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;

    // Save file
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-gray-800 rounded-xl w-full max-w-4xl my-8 mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-purple-400">
              Registrations for {event.title}
            </h3>

            {/* Add Export Button */}
            {event.registeredStudents &&
              event.registeredStudents.length > 0 && (
                <button
                  onClick={exportToExcel}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Export to Excel
                </button>
              )}
          </div>

          {event.registeredStudents && event.registeredStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-gray-200">
                <thead className="text-sm text-purple-400 uppercase bg-gray-700">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">College</th>
                    <th className="px-6 py-3">College ID</th>
                    <th className="px-6 py-3">Payment Screenshot</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {event.registeredStudents.map((student) => (
                    <tr
                      key={student._id}
                      className="border-b border-gray-700 hover:bg-gray-700"
                    >
                      <td className="px-6 py-4">{student.fullName}</td>
                      <td className="px-6 py-4">{student.email}</td>
                      <td className="px-6 py-4">{student.college}</td>
                      <td className="px-6 py-4">{student.collegeId}</td>
                      <td className="px-6 py-4">
                        {student.paymentScreenshot && (
                          <a
                            href={student.paymentScreenshot}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300"
                          >
                            View Payment Screenshot
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                            student.paymentStatus
                          )}`}
                        >
                          {student.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {student.paymentStatus === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleApproval(student._id, "approved")
                              }
                              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleApproval(student._id, "rejected")
                              }
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">
              No registrations yet for this event.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const getStatusBadgeColor = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-500";
    case "approved":
      return "bg-green-500";
    case "rejected":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

const AdminPanel = () => {
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("pending"); // "pending", "approved", "rejected"
  const [view, setView] = useState("dashboard");
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    venue: "",
    date: "",
    startTime: "",
    endTime: "",
    image: "",
    termsandconditions: "",
    participantLimit: "",
    eventType: "technical",
  });
  const [categoryForm, setCategoryForm] = useState({
    categoryName: "",
  });
  const [subcategoryForm, setSubcategoryForm] = useState({
    subcategoryName: "",
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [expandedEvents, setExpandedEvents] = useState(new Set());
  const [includeKL, setIncludeKL] = useState(false);
  const [xlsxFile, setXlsxFile] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);

  const closeEventModal = useCallback(() => {
    setShowEventModal(false);
    setEventForm({
      title: "",
      description: "",
      venue: "",
      date: "",
      startTime: "",
      endTime: "",
      image: "",
      termsandconditions: "",
      participantLimit: "",
      eventType: "technical",
    });
    setEditingEvent(null);
  }, []);

  const url = import.meta.env.VITE_API_URL;
  const closeCategoryModal = useCallback(() => {
    setShowCategoryModal(false);
    setCategoryForm({ categoryName: "" });
  }, []);

  useEffect(() => {
    if (view === "registrations") {
      fetchRegistrations();
    } else if (view === "events") {
      fetchEvents();
    } else if (view === "dashboard") {
      fetchStats();
    }
  }, [filter, view, includeKL]);

  // Filter registrations based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRegistrations(registrations);
    } else {
      const filtered = registrations.filter((user) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          user.fullName?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.college?.toLowerCase().includes(searchLower) ||
          user.collegeId?.toLowerCase().includes(searchLower) ||
          user.paymentId?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredRegistrations(filtered);
    }
  }, [searchTerm, registrations]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${url}/api/admin/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const qs = new URLSearchParams();
      if (filter !== "all") qs.set("status", filter);
      if (includeKL) qs.set("includeKL", "true");
      const response = await fetch(
        `${url}/api/admin/registrations${qs.toString() ? `?${qs.toString()}` : ""}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      setRegistrations(data);
    } catch (error) {
      console.error("Error fetching registrations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    if (!xlsxFile) return;
    try {
      setBulkUploading(true);
      // Read file using XLSX to extract emails
      const data = await xlsxFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheet = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheet];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      // Flatten and filter emails
      const emailsSet = new Set();
      for (const row of json) {
        for (const cell of row) {
          const text = String(cell || "").trim();
          if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
            emailsSet.add(text.toLowerCase());
          }
        }
      }
      const emails = Array.from(emailsSet);
      if (emails.length === 0) {
        alert("No emails found in the uploaded file.");
        return;
      }
      const resp = await fetch(`${url}/api/admin/registrations/bulk-approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ emails }),
      });
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || "Bulk approve failed");
      const updatedCount = result.updated?.length || 0;
      const createdCount = Array.isArray(result.created)
        ? result.created.filter((c) => c.status === "created_and_notified").length || result.created.length
        : 0;
      const skippedNonKLU = Array.isArray(result.created)
        ? result.created.filter((c) => c.status === "skipped_non_klu").length
        : 0;
      const errorsCount = result.errors?.length || 0;
      const notFoundLegacy = result.notFound?.length || 0; // backward compatibility
      alert(
        `Approved existing: ${updatedCount}\nCreated new KLU: ${createdCount}` +
        (skippedNonKLU ? `\nSkipped non-KLU: ${skippedNonKLU}` : "") +
        (errorsCount ? `\nErrors: ${errorsCount}` : "") +
        (notFoundLegacy ? `\nNot found: ${notFoundLegacy}` : "")
      );
      fetchRegistrations();
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to bulk approve");
    } finally {
      setBulkUploading(false);
    }
  };

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch(`${url}/api/events`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
      alert("Failed to fetch events. Please try again.");
    }
  }, []);

  useEffect(() => {
    // Preload stats for initial dashboard view
    fetchStats();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-green-500";
      case "rejected":
        return "text-red-500";
      default:
        return "text-yellow-500";
    }
  };

  const handleApproval = async (userId, status) => {
    try {
      const response = await fetch(`${url}/api/admin/registrations/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update registration");
      }

      // Refresh the registrations list
      fetchRegistrations();
    } catch (error) {
      console.error("Error updating registration:", error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleDeleteEvent = async (categoryId, eventId) => {
    try {
      const response = await fetch(
        `${url}/api/events/${categoryId}/events/${eventId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete event");
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleEventSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      try {
        const eventData = {
          title: eventForm.title,
          details: {
            description: eventForm.description,
            venue: eventForm.venue,
            date: eventForm.date,
            startTime: eventForm.startTime,
            endTime: eventForm.endTime,
          },
          image: eventForm.image,
          termsandconditions: eventForm.termsandconditions,
          participantLimit: eventForm.participantLimit,
          eventType: eventForm.eventType,
        };

        let response;
        if (selectedSubcategory) {
          // Subcategory event
          response = await fetch(
            editingEvent
              ? `${url}/api/events/${selectedCategory}/subcategory/${selectedSubcategory}/events/${editingEvent._id}`
              : `${url}/api/events/${selectedCategory}/subcategory/${selectedSubcategory}/events`,
            {
              method: editingEvent ? "PUT" : "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify(eventData),
            }
          );
        } else {
          // Regular category event
          response = await fetch(
            editingEvent
              ? `${url}/api/events/${selectedCategory}/events/${editingEvent._id}`
              : `${url}/api/events/${selectedCategory}/events`,
            {
              method: editingEvent ? "PUT" : "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify(eventData),
            }
          );
        }

        if (!response.ok) {
          throw new Error("Failed to save event");
        }

        await fetchEvents();
        closeEventModal();
      } catch (error) {
        console.error("Error saving event:", error);
        alert("Failed to save event. Please try again.");
      }
    },
    [eventForm, selectedCategory, editingEvent, closeEventModal]
  );

  const handleAddEvent = useCallback((categoryId, subcategoryId = null) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(subcategoryId);
    setEditingEvent(null);
    setEventForm({
      title: "",
      description: "",
      venue: "",
      date: "",
      startTime: "",
      endTime: "",
      image: "",
      termsandconditions: "",
      participantLimit: "",
      eventType: "technical",
    });
    setShowEventModal(true);
  }, []);

  const handleEditEvent = useCallback((category, event, subcategory = null) => {
    if (!category || !event) {
      console.error("Category or event data is missing");
      return;
    }

    setSelectedCategory(category._id);
    setSelectedSubcategory(subcategory ? subcategory._id : null);
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.details.description,
      venue: event.details.venue,
      date: event.details.date,
      startTime: event.details.startTime,
      endTime: event.details.endTime,
      image: event.image,
      termsandconditions: event.termsandconditions,
      participantLimit: event.participantLimit,
      eventType: event.eventType || "technical",
    });
    setShowEventModal(true);
  }, []);

  const handleAddCategory = () => {
    setCategoryForm({ categoryName: "" });
    document.body.style.overflow = "hidden";
    setShowCategoryModal(true);
  };

  const handleAddSubcategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setSubcategoryForm({ subcategoryName: "" });
    setShowSubcategoryModal(true);
  };

  const handleSubcategorySubmit = useCallback(
    async (e) => {
      e.preventDefault();

      try {
        const response = await fetch(`${url}/api/events/category/${selectedCategory}/subcategory`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(subcategoryForm),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create subcategory");
        }

        await fetchEvents();
        setShowSubcategoryModal(false);
        setSubcategoryForm({ subcategoryName: "" });
      } catch (error) {
        console.error("Error creating subcategory:", error);
        alert(error.message || "Failed to create subcategory. Please try again.");
      }
    },
    [subcategoryForm, selectedCategory, fetchEvents]
  );

  const handleDeleteSubcategory = useCallback(async (categoryId, subcategoryId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this subcategory? All events in this subcategory will be deleted."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${url}/api/events/category/${categoryId}/subcategory/${subcategoryId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete subcategory");
      }

      await fetchEvents();
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      alert("Failed to delete subcategory. Please try again.");
    }
  }, [fetchEvents]);

  const handleCategorySubmit = useCallback(
    async (e) => {
      e.preventDefault();
      console.log("Submitting category:", categoryForm); // Debug log

      try {
        const response = await fetch(`${url}/api/events/category`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(categoryForm),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create category");
        }

        const data = await response.json();
        console.log("Category created:", data); // Debug log

        await fetchEvents(); // Refresh the categories
        closeCategoryModal();
        setCategoryForm({ categoryName: "" }); // Reset form
      } catch (error) {
        console.error("Error creating category:", error);
        alert(error.message || "Failed to create category. Please try again.");
      }
    },
    [categoryForm, closeCategoryModal]
  );

  const handleUpdateCategory = useCallback(async (categoryId, newName) => {
    try {
      const response = await fetch(`${url}/api/events/category/${categoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          categoryName: newName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      await fetchEvents();
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Failed to update category. Please try again.");
    }
  }, []);

  const handleDeleteCategory = useCallback(async (categoryId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this category? All events in this category will be deleted."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${url}/api/events/category/${categoryId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      await fetchEvents();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category. Please try again.");
    }
  }, []);

  const handleViewRegistrations = (event) => {
    setSelectedEvent(event);
  };

  const toggleEventExpansion = (eventId) => {
    setExpandedEvents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const exportRegistrationsToExcel = async (status) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/admin/registrations?status=${status}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch registrations");
      }

      const registrations = await response.json();

      const exportData = registrations.map((user) => ({
        "Full Name": user.fullName,
        Email: user.email,
        College: user.college,
        "College ID": user.collegeId,
        "Payment Status": user.paymentStatus,
        "UTR ID": user.paymentId || "N/A",
        "Payment Screenshot": user.paymentScreenshot || "N/A",
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Registrations");

      const fileName = `registrations_${status}_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error("Error exporting registrations:", error);
    }
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="pt-16 sm:pt-20"></div>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <h2 className="text-3xl sm:text-4xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            Admin Dashboard
          </h2>
          <div className="flex flex-wrap gap-3 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={() => setView("dashboard")}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                view === "dashboard"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-purple-500"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setView("registrations")}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                view === "registrations"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-purple-500"
              }`}
            >
              Registrations
            </button>
            <button
              onClick={() => setView("events")}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                view === "events"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-purple-500"
              }`}
            >
              Events
            </button>
            {view === "registrations" && (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-2 bg-gray-700 rounded-lg px-3 py-2.5">
                  <label className="flex items-center gap-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={includeKL}
                      onChange={(e) => setIncludeKL(e.target.checked)}
                    />
                    Include KL
                  </label>
                </div>
                <div className="flex items-center gap-2 bg-gray-700 rounded-lg px-3 py-2.5">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setXlsxFile(e.target.files?.[0] || null)}
                    className="text-sm"
                  />
                  <button
                    disabled={!xlsxFile || bulkUploading}
                    onClick={handleBulkApprove}
                    className={`px-4 py-2 rounded-lg ${!xlsxFile || bulkUploading ? "bg-gray-500" : "bg-green-600 hover:bg-green-500"} text-white`}
                  >
                    {bulkUploading ? "Approving..." : "Bulk Approve"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {view === "dashboard" && (
          <div className="space-y-8">
            {/* Derived metrics */}
            {(() => {
              const total = stats?.users?.total ?? 0;
              const klu = stats?.users?.klu ?? 0;
              const nonKlu = stats?.users?.nonKlu ?? 0;
              const entered = stats?.users?.hasEntered ?? 0;
              const approved = stats?.users?.payment?.approved ?? 0;
              const pending = stats?.users?.payment?.pending ?? 0;
              const rejected = stats?.users?.payment?.rejected ?? 0;
              const approvedKLU = stats?.users?.payment?.approvedKLU ?? 0;
              const approvedNonKLU = stats?.users?.payment?.approvedNonKLU ?? 0;
              const pct = (n, d) => (d > 0 ? Math.round((n / d) * 100) : 0);

              return (
                <>
                  {/* Top KPIs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <DashboardCard title="Total Users" value={total} subtitle={`${klu} KLU • ${nonKlu} Non-KLU`} icon={<IoPeople />} />
                    <DashboardCard title="KLU Users" value={klu} subtitle={`${pct(klu, total)}% of total`} color="emerald" icon={<IoSchool />} />
                    <DashboardCard title="Non-KLU Users" value={nonKlu} subtitle={`${pct(nonKlu, total)}% of total`} color="teal" icon={<IoPerson />} />
                    <DashboardCard title="On-site Entered" value={entered} subtitle={`${pct(entered, total)}% of total`} color="purple" icon={<IoLogIn />} />
                  </div>

                  {/* Payment Breakdown */}
                  <div className="bg-gray-800/50 border border-purple-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-purple-300">Payment Status</h3>
                      <span className="text-sm text-gray-400">{total} users</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <DashboardCard title="Approved" value={approved} subtitle={`${pct(approved, total)}%`} color="green" compact icon={<IoCheckmarkCircle />} />
                      <DashboardCard title="Pending" value={pending} subtitle={`${pct(pending, total)}%`} color="yellow" compact icon={<IoTime />} />
                      <DashboardCard title="Rejected" value={rejected} subtitle={`${pct(rejected, total)}%`} color="red" compact icon={<IoCloseCircle />} />
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-3 rounded-full bg-gray-700 overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: `${pct(approved, total)}%` }}></div>
                      <div className="h-full bg-yellow-500" style={{ width: `${pct(pending, total)}%` }}></div>
                      <div className="h-full bg-red-500" style={{ width: `${pct(rejected, total)}%` }}></div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-300">
                      <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded bg-green-500"></span>Approved (KLU): <span className="ml-auto font-semibold">{approvedKLU}</span></div>
                      <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded bg-emerald-500"></span>Approved (Non-KLU): <span className="ml-auto font-semibold">{approvedNonKLU}</span></div>
                      <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded bg-yellow-500"></span>Pending: <span className="ml-auto font-semibold">{pending}</span></div>
                      <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded bg-red-500"></span>Rejected: <span className="ml-auto font-semibold">{rejected}</span></div>
                    </div>
                  </div>
                </>
              );
            })()}

            {/* Recent Users */}
            <div className="bg-gray-800/50 rounded-xl border border-purple-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-purple-300">Recent Users</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-gray-200">
                  <thead className="text-sm text-purple-400 uppercase bg-gray-700">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">College</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.users?.recent || []).map((u) => (
                      <tr key={u._id} className="border-b border-gray-700">
                        <td className="px-4 py-3">{u.fullName || "-"}</td>
                        <td className="px-4 py-3">{u.email}</td>
                        <td className="px-4 py-3">{u.college || "-"}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(u.paymentStatus)}`}>
                            {u.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3">{new Date(u.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                    {(!stats || (stats?.users?.recent || []).length === 0) && (
                      <tr>
                        <td className="px-4 py-6 text-center text-gray-400" colSpan={5}>No recent users</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {view === "registrations" && (
          <div className="space-y-4 mb-6">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by name, email, college, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Search Results Count */}
              {searchTerm && (
                <div className="text-sm text-gray-400">
                  {filteredRegistrations.length} result{filteredRegistrations.length !== 1 ? 's' : ''} found
                </div>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-lg ${
                  filter === "pending"
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-yellow-500"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter("approved")}
                className={`px-4 py-2 rounded-lg ${
                  filter === "approved"
                    ? "bg-green-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-green-500"
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setFilter("rejected")}
                className={`px-4 py-2 rounded-lg ${
                  filter === "rejected"
                    ? "bg-red-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-red-500"
                }`}
              >
                Rejected
              </button>
              <button
                onClick={() => exportRegistrationsToExcel(filter)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
              >
                Export to Excel
              </button>
            </div>
          </div>
        )}

        {view === "registrations" ? (
          <div className="grid gap-6">
            {filteredRegistrations.map((user) => (
              <div
                key={user._id}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-purple-700"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-xl text-purple-300 font-bold mb-1">
                        {user.fullName}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full font-medium ${getStatusBadgeColor(
                            user.paymentStatus
                          )}`}
                        >
                          {user.paymentStatus}
                        </span>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-purple-200">
                          <span className="text-purple-400">Email:</span>{" "}
                          {user.email}
                        </p>
                        <p className="text-purple-200">
                          <span className="text-purple-400">College:</span>{" "}
                          {user.college}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="text-purple-200">
                            <span className="text-purple-400">ID:</span>{" "}
                            {user.collegeId}
                          </p>
                          <button
                            onClick={() => copyToClipboard(user.collegeId)}
                            className="text-purple-400 hover:text-purple-300"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-purple-200">
                            <span className="text-purple-400">Payment ID:</span>{" "}
                            {user.paymentId || "N/A"}
                          </p>
                          {user.paymentId && (
                            <button
                              onClick={() => copyToClipboard(user.paymentId)}
                              className="text-purple-400 hover:text-purple-300"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {user.paymentStatus === "pending" && (
                    <div className="flex gap-3 w-full sm:w-auto">
                      <button
                        onClick={() => handleApproval(user._id, "approved")}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproval(user._id, "rejected")}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>

                {user.paymentScreenshot && (
                  <div className="mt-6">
                    <p className="text-purple-300 mb-3 font-medium">
                      Payment Screenshot:
                    </p>
                    <img
                      src={user.paymentScreenshot}
                      alt="Payment Proof"
                      className="w-full sm:max-w-md rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-purple-500"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            ))}

            {filteredRegistrations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-purple-300 text-lg">
                  {searchTerm 
                    ? `No registrations found matching "${searchTerm}"`
                    : `No registrations found for ${filter} status`
                  }
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            <div className="flex justify-end mb-4">
              <button
                onClick={handleAddCategory}
                className="px-6 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                Add Category
              </button>
            </div>
            {events.map((category) => (
              <div key={category._id} className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-semibold text-purple-400 flex items-center gap-2">
                    {category.categoryName}
                    <span className="text-sm bg-purple-600/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                      {(
                        (category.Events?.length || 0) +
                        (category.subcategories?.reduce(
                          (sum, sub) => sum + (sub.Events?.length || 0),
                          0
                        ) || 0)
                      )}
                    </span>
                  </h3>
                  <div className="flex gap-2">
                    <button
                      className="px-4 py-2 bg-purple-500 rounded-lg text-white hover:bg-purple-600"
                      onClick={() => handleAddEvent(category._id)}
                    >
                      Add Event
                    </button>
                    <button
                      className="px-4 py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600"
                      onClick={() => handleAddSubcategory(category._id)}
                    >
                      Add Subcategory
                    </button>
                    <button
                      className="px-4 py-2 bg-red-500 rounded-lg text-white hover:bg-red-600"
                      onClick={() => handleDeleteCategory(category._id)}
                    >
                      Delete Category
                    </button>
                  </div>
                </div>

                {/* Direct Events */}
                {category.Events && category.Events.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-purple-300 mb-4">Direct Events</h4>
                    <div className="space-y-4">
                      {category.Events.map((event) => (
                        <div
                          key={event._id}
                          className="bg-gray-800 rounded-lg overflow-hidden transition-all duration-300"
                        >
                          {/* Event Header - Always Visible */}
                          <div
                            className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-700"
                            onClick={() => toggleEventExpansion(event._id)}
                          >
                            <div className="flex items-center space-x-4">
                              <h4 className="text-xl font-semibold text-white">
                                {event.title}
                              </h4>
                              <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm">
                                Registrations:{" "}
                                {event.registeredStudents?.length || 0}
                              </span>
                            </div>
                            {expandedEvents.has(event._id) ? (
                              <IoChevronUp className="text-2xl text-purple-400" />
                            ) : (
                              <IoChevronDown className="text-2xl text-purple-400" />
                            )}
                          </div>

                          {expandedEvents.has(event._id) && (
                            <div className="p-4 border-t border-gray-700 bg-gray-750">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2">
                                  <p className="text-gray-300">
                                    <span className="font-semibold text-purple-400">
                                      Description:
                                    </span>{" "}
                                    {event.details.description}
                                  </p>
                                  <p className="text-gray-300">
                                    <span className="font-semibold text-purple-400">
                                      Venue:
                                    </span>{" "}
                                    {event.details.venue}
                                  </p>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-gray-300">
                                    <span className="font-semibold text-purple-400">
                                      Date:
                                    </span>{" "}
                                    {event.details.date}
                                  </p>
                                  <p className="text-gray-300">
                                    <span className="font-semibold text-purple-400">
                                      Start Time:
                                    </span>{" "}
                                    {event.details.startTime}
                                  </p>
                                  <p className="text-gray-300">
                                    <span className="font-semibold text-purple-400">
                                      End Time:
                                    </span>{" "}
                                    {event.details.endTime}
                                  </p>
                                </div>
                              </div>

                              <div className="flex justify-end space-x-3">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewRegistrations(event);
                                  }}
                                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors duration-200"
                                >
                                  View Registrations
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditEvent(category, event);
                                  }}
                                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteEvent(category._id, event._id);
                                  }}
                                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subcategories */}
                {category.subcategories && category.subcategories.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-purple-300 mb-4">Subcategories</h4>
                    <div className="space-y-6">
                      {category.subcategories.map((subcategory) => (
                        <div key={subcategory._id} className="bg-gray-800/50 rounded-lg p-4 border border-purple-700">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-lg font-semibold text-purple-300">
                              {subcategory.subcategoryName}
                            </h5>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAddEvent(category._id, subcategory._id)}
                                className="px-3 py-1 bg-purple-500 rounded text-white hover:bg-purple-600 text-sm"
                              >
                                Add Event
                              </button>
                              <button
                                onClick={() => handleDeleteSubcategory(category._id, subcategory._id)}
                                className="px-3 py-1 bg-red-500 rounded text-white hover:bg-red-600 text-sm"
                              >
                                Delete Subcategory
                              </button>
                            </div>
                          </div>
                          <div className="space-y-4">
                            {subcategory.Events.map((event) => (
                              <div
                                key={event._id}
                                className="bg-gray-800 rounded-lg overflow-hidden transition-all duration-300"
                              >
                                {/* Event Header - Always Visible */}
                                <div
                                  className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-700"
                                  onClick={() => toggleEventExpansion(event._id)}
                                >
                                  <div className="flex items-center space-x-4">
                                    <h4 className="text-xl font-semibold text-white">
                                      {event.title}
                                    </h4>
                                    <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm">
                                      Registrations:{" "}
                                      {event.registeredStudents?.length || 0}
                                    </span>
                                  </div>
                                  {expandedEvents.has(event._id) ? (
                                    <IoChevronUp className="text-2xl text-purple-400" />
                                  ) : (
                                    <IoChevronDown className="text-2xl text-purple-400" />
                                  )}
                                </div>

                                {expandedEvents.has(event._id) && (
                                  <div className="p-4 border-t border-gray-700 bg-gray-750">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                      <div className="space-y-2">
                                        <p className="text-gray-300">
                                          <span className="font-semibold text-purple-400">
                                            Description:
                                          </span>{" "}
                                          {event.details.description}
                                        </p>
                                        <p className="text-gray-300">
                                          <span className="font-semibold text-purple-400">
                                            Venue:
                                          </span>{" "}
                                          {event.details.venue}
                                        </p>
                                      </div>
                                      <div className="space-y-2">
                                        <p className="text-gray-300">
                                          <span className="font-semibold text-purple-400">
                                            Date:
                                          </span>{" "}
                                          {event.details.date}
                                        </p>
                                        <p className="text-gray-300">
                                          <span className="font-semibold text-purple-400">
                                            Start Time:
                                          </span>{" "}
                                          {event.details.startTime}
                                        </p>
                                        <p className="text-gray-300">
                                          <span className="font-semibold text-purple-400">
                                            End Time:
                                          </span>{" "}
                                          {event.details.endTime}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleViewRegistrations(event);
                                        }}
                                        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors duration-200"
                                      >
                                        View Registrations
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditEvent(category, event, subcategory);
                                        }}
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteEvent(category._id, event._id, subcategory._id);
                                        }}
                                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                            {subcategory.Events.length === 0 && (
                              <p className="text-center text-gray-400 py-4">
                                No events in this subcategory.
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No events message */}
                {(!category.Events || category.Events.length === 0) && 
                 (!category.subcategories || category.subcategories.length === 0) && (
                  <p className="text-center text-gray-400 py-8">
                    No events or subcategories in this category.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {showEventModal && (
        <EventModal
          eventForm={eventForm}
          setEventForm={setEventForm}
          handleEventSubmit={handleEventSubmit}
          closeEventModal={closeEventModal}
          editingEvent={editingEvent}
        />
      )}
      {showCategoryModal && (
        <CategoryModal
          categoryForm={categoryForm}
          setCategoryForm={setCategoryForm}
          handleCategorySubmit={handleCategorySubmit}
          closeCategoryModal={closeCategoryModal}
        />
      )}
      {showSubcategoryModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-gray-800 rounded-xl w-full max-w-md my-8 mx-4 relative">
            <button
              onClick={() => setShowSubcategoryModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <form onSubmit={handleSubcategorySubmit} className="p-6">
              <h3 className="text-2xl font-bold text-purple-400 pr-8 mb-4">
                Add New Subcategory
              </h3>

              <div className="mb-6">
                <label className="block text-purple-300 mb-2">
                  Subcategory Name
                </label>
                <input
                  type="text"
                  value={subcategoryForm.subcategoryName}
                  onChange={(e) =>
                    setSubcategoryForm({ subcategoryName: e.target.value })
                  }
                  className="w-full bg-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  placeholder="Enter subcategory name"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-500 text-white px-6 py-2.5 rounded-lg transition-all duration-300 hover:bg-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  Create Subcategory
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubcategoryModal(false)}
                  className="flex-1 bg-gray-600 text-white px-6 py-2.5 rounded-lg transition-all duration-300 hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {selectedEvent && (
        <EventRegistrations
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

export default AdminPanel;

const DashboardCard = ({ title, value, subtitle, color = "purple", icon, compact = false }) => {
  const colorMap = {
    purple: "from-purple-500 to-pink-500",
    green: "from-green-500 to-emerald-500",
    yellow: "from-yellow-500 to-amber-500",
    red: "from-red-500 to-rose-500",
    emerald: "from-emerald-500 to-green-500",
    teal: "from-teal-500 to-cyan-500",
  };
  const gradient = colorMap[color] || colorMap.purple;
  return (
    <div className={`bg-gray-800/50 border border-purple-700 rounded-xl ${compact ? "p-3" : "p-4"}`}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className={`text-xl ${compact ? "mt-0.5" : "mt-0.5"} text-purple-300`}>
            {icon}
          </div>
        )}
        <div className="flex-1">
          <p className="text-xs text-gray-300 mb-1">{title}</p>
          <div className={`font-extrabold bg-clip-text text-transparent bg-gradient-to-r ${gradient} ${compact ? "text-2xl" : "text-3xl"}`}>
            {value}
          </div>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};
