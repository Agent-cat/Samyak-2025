import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as XLSX from "xlsx";

const EventsPanel = () => {
  const url = import.meta.env.VITE_API_URL;
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ categoryName: "" });
  const [subcategoryForm, setSubcategoryForm] = useState({
    subcategoryName: "",
  });
  const [showRegisteredStudents, setShowRegisteredStudents] = useState(false);
  const [selectedEventStudents, setSelectedEventStudents] = useState(null);
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
  const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
  const [notification, setNotification] = useState({
    open: false,
    type: "info",
    message: "",
  });
  const [confirmState, setConfirmState] = useState({
    open: false,
    message: "",
    onConfirm: null,
  });
  const [quickCategoryId, setQuickCategoryId] = useState(null);
  const categoryRefs = useRef({});

  const fetchEvents = useCallback(async () => {
    try {
      // Use admin endpoint to get all events for admin panel
      const response = await fetch(`${url}/api/events/admin/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
      setNotification({
        open: true,
        type: "error",
        message: "Failed to fetch events. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showEventModal || showCategoryModal || showSubcategoryModal || showRegisteredStudents) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showEventModal, showCategoryModal, showSubcategoryModal, showRegisteredStudents]);

  const closeEventModal = useCallback(() => {
    setShowEventModal(false);
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
  }, []);

  const openAddEvent = (categoryId, subcategoryId = null) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId(subcategoryId);
    setEditingEvent(null);
    setShowEventModal(true);
  };

  const openEditEvent = (category, event, subcategory = null) => {
    setSelectedCategoryId(category._id);
    setSelectedSubcategoryId(subcategory ? subcategory._id : null);
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
  };

  const handleEventImageChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!/^image\/(jpeg|jpg|png|webp)$/.test(file.type)) {
      setNotification({
        open: true,
        type: "error",
        message: "Only JPG, JPEG, PNG or WEBP images are allowed.",
      });
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setNotification({
        open: true,
        type: "error",
        message: "Image size should not exceed 2MB.",
      });
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
      if (!res.ok) throw new Error(data.error || "Failed to upload image");
      setEventForm((prev) => ({ ...prev, image: data.url }));
    } catch (err) {
      setNotification({
        open: true,
        type: "error",
        message: err.message || "Failed to upload image",
      });
    }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!eventForm.title.trim()) {
      setNotification({
        open: true,
        type: "error",
        message: "Event title is required.",
      });
      return;
    }
    if (!eventForm.description.trim()) {
      setNotification({
        open: true,
        type: "error",
        message: "Event description is required.",
      });
      return;
    }
    if (!eventForm.venue.trim()) {
      setNotification({
        open: true,
        type: "error",
        message: "Event venue is required.",
      });
      return;
    }
    if (!eventForm.date) {
      setNotification({
        open: true,
        type: "error",
        message: "Event date is required.",
      });
      return;
    }
    if (!eventForm.startTime) {
      setNotification({
        open: true,
        type: "error",
        message: "Start time is required.",
      });
      return;
    }
    if (!eventForm.endTime) {
      setNotification({
        open: true,
        type: "error",
        message: "End time is required.",
      });
      return;
    }
    if (!eventForm.participantLimit || eventForm.participantLimit <= 0) {
      setNotification({
        open: true,
        type: "error",
        message: "Please enter a valid participant limit.",
      });
      return;
    }
    if (!eventForm.termsandconditions.trim()) {
      setNotification({
        open: true,
        type: "error",
        message: "Terms and conditions are required.",
      });
      return;
    }

    try {
      const payload = {
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
      if (selectedSubcategoryId) {
        // Subcategory event
        response = await fetch(
          editingEvent
            ? `${url}/api/events/${selectedCategoryId}/subcategory/${selectedSubcategoryId}/events/${editingEvent._id}`
            : `${url}/api/events/${selectedCategoryId}/subcategory/${selectedSubcategoryId}/events`,
          {
            method: editingEvent ? "PUT" : "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(payload),
          }
        );
      } else {
        // Regular category event
        response = await fetch(
          editingEvent
            ? `${url}/api/events/${selectedCategoryId}/events/${editingEvent._id}`
            : `${url}/api/events/${selectedCategoryId}/events`,
          {
            method: editingEvent ? "PUT" : "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(payload),
          }
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to save event");
      }

      await fetchEvents();
      closeEventModal();
      setNotification({
        open: true,
        type: "success",
        message: editingEvent
          ? "Event updated successfully"
          : "Event created successfully",
      });
    } catch (err) {
      console.error(err);
      setNotification({
        open: true,
        type: "error",
        message: err.message || "Failed to save event. Please try again.",
      });
    }
  };

  const handleDeleteEvent = async (
    categoryId,
    eventId,
    subcategoryId = null
  ) => {
    setConfirmState({
      open: true,
      message: "Are you sure you want to delete this event?",
      onConfirm: async () => {
        try {
          let response;
          if (subcategoryId) {
            // Subcategory event
            response = await fetch(
              `${url}/api/events/${categoryId}/subcategory/${subcategoryId}/events/${eventId}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
          } else {
            // Direct category event
            response = await fetch(
              `${url}/api/events/${categoryId}/events/${eventId}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
          }

          if (!response.ok) throw new Error("Failed to delete event");
          await fetchEvents();
          setNotification({
            open: true,
            type: "success",
            message: "Event deleted",
          });
        } catch (err) {
          console.error(err);
          setNotification({
            open: true,
            type: "error",
            message: "Failed to delete event.",
          });
        } finally {
          setConfirmState({ open: false, message: "", onConfirm: null });
        }
      },
    });
  };

  const handleAddCategory = () => {
    setCategoryForm({ categoryName: "" });
    setShowCategoryModal(true);
  };

  const handleAddSubcategory = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setSubcategoryForm({ subcategoryName: "" });
    setShowSubcategoryModal(true);
  };

  const handleSubcategorySubmit = async (e) => {
    e.preventDefault();

    if (!subcategoryForm.subcategoryName.trim()) {
      setNotification({
        open: true,
        type: "error",
        message: "Subcategory name is required.",
      });
      return;
    }

    try {
      const response = await fetch(
        `${url}/api/events/category/${selectedCategoryId}/subcategory`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(subcategoryForm),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Failed to create subcategory"
        );
      }

      await fetchEvents();
      setShowSubcategoryModal(false);
      setNotification({
        open: true,
        type: "success",
        message: "Subcategory created successfully",
      });
    } catch (err) {
      console.error(err);
      setNotification({
        open: true,
        type: "error",
        message:
          err.message || "Failed to create subcategory. Please try again.",
      });
    }
  };

  const handleDeleteSubcategory = async (categoryId, subcategoryId) => {
    setConfirmState({
      open: true,
      message: "Delete this subcategory and all its events?",
      onConfirm: async () => {
        try {
          const response = await fetch(
            `${url}/api/events/category/${categoryId}/subcategory/${subcategoryId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          if (!response.ok) throw new Error("Failed to delete subcategory");
          await fetchEvents();
          setNotification({
            open: true,
            type: "success",
            message: "Subcategory deleted",
          });
        } catch (err) {
          console.error(err);
          setNotification({
            open: true,
            type: "error",
            message: "Failed to delete subcategory.",
          });
        } finally {
          setConfirmState({ open: false, message: "", onConfirm: null });
        }
      },
    });
  };

  const handleViewRegisteredStudents = (event) => {
    setSelectedEventStudents(event);
    setShowRegisteredStudents(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();

    if (!categoryForm.categoryName.trim()) {
      setNotification({
        open: true,
        type: "error",
        message: "Category name is required.",
      });
      return;
    }

    try {
      const response = await fetch(`${url}/api/events/category`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(categoryForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Failed to create category"
        );
      }

      await fetchEvents();
      setShowCategoryModal(false);
      setNotification({
        open: true,
        type: "success",
        message: "Category created successfully",
      });
    } catch (err) {
      console.error(err);
      setNotification({
        open: true,
        type: "error",
        message: err.message || "Failed to create category. Please try again.",
      });
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    setConfirmState({
      open: true,
      message: "Delete this category and all its events?",
      onConfirm: async () => {
        try {
          const response = await fetch(
            `${url}/api/events/category/${categoryId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          if (!response.ok) throw new Error("Failed to delete category");
          await fetchEvents();
          setNotification({
            open: true,
            type: "success",
            message: "Category deleted",
          });
        } catch (err) {
          console.error(err);
          setNotification({
            open: true,
            type: "error",
            message: "Failed to delete category.",
          });
        } finally {
          setConfirmState({ open: false, message: "", onConfirm: null });
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="pt-16 sm:pt-20"></div>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-3xl font-extrabold text-white">Events Panel</h2>
          <button
            onClick={handleAddCategory}
            className="px-5 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors border border-white/10"
          >
            Add Category
          </button>
        </div>

        {/* Quick Add Toolbar */}
        {categories && categories.length > 0 && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
            <div className="md:col-span-6 flex flex-col md:flex-row gap-2">
              <select
                value={quickCategoryId || ""}
                onChange={(e) => setQuickCategoryId(e.target.value || null)}
                className="w-full md:flex-1 bg-black border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
              >
                <option value="" disabled>
                  Select category
                </option>
                {[...categories]
                  .sort((a, b) => a.categoryName.localeCompare(b.categoryName))
                  .map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.categoryName}
                    </option>
                  ))}
              </select>
              <button
                onClick={() => quickCategoryId && openAddEvent(quickCategoryId)}
                disabled={!quickCategoryId}
                className={`w-full md:w-auto px-4 py-2 rounded-lg ${
                  quickCategoryId
                    ? "bg-white text-black hover:bg-white/80"
                    : "bg-white/20 text-white/60 cursor-not-allowed"
                }`}
              >
                Add Event
              </button>
              <button
                onClick={() =>
                  quickCategoryId && handleAddSubcategory(quickCategoryId)
                }
                disabled={!quickCategoryId}
                className={`w-full md:w-auto px-4 py-2 rounded-lg ${
                  quickCategoryId
                    ? "bg-blue-600 text-white hover:bg-blue-500"
                    : "bg-blue-600/30 text-white/60 cursor-not-allowed"
                }`}
              >
                Add Subcategory
              </button>
            </div>
            <div className="md:col-span-6 flex flex-col md:flex-row gap-2 md:justify-end">
              <button
                onClick={() => {
                  if (!quickCategoryId) return;
                  const el = categoryRefs.current[quickCategoryId];
                  if (el && typeof el.scrollIntoView === "function") {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                disabled={!quickCategoryId}
                className={`w-full md:w-auto px-4 py-2 rounded-lg border ${
                  quickCategoryId
                    ? "border-white/20 text-white hover:bg-white/10"
                    : "border-white/10 text-white/60 cursor-not-allowed"
                }`}
              >
                Jump to Category
              </button>
            </div>
          </div>
        )}

        {/* Deployment Notice */}
        <div className="mb-6 p-4 bg-yellow-600/20 border border-yellow-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <div>
              <h3 className="text-yellow-400 font-semibold text-sm mb-1">
                Important Notice
              </h3>
              <p className="text-yellow-200 text-sm">
                1. Added a "Jump to Category" button for easy navigation. <br />
                2. Ensured uploaded images must be less than 2 MB in size.
                <br />
                3. If an image upload fails even under 2 MB convert it to WebP
                format.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {categories
            .sort((a, b) => a.categoryName.localeCompare(b.categoryName))
            .map((category) => (
              <div
                key={category._id}
                className="rounded-2xl border border-white/10 bg-black/60 shadow-xl"
                ref={(el) => {
                  if (el) categoryRefs.current[category._id] = el;
                }}
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                  <h3 className="text-2xl font-semibold text-white flex items-center gap-2">
                    {category.categoryName}
                    <span className="text-sm bg-white/10 text-white/80 px-2 py-0.5 rounded-full border border-white/10">
                      {(category.Events?.length || 0) +
                        (category.subcategories?.reduce(
                          (sum, sub) => sum + (sub.Events?.length || 0),
                          0
                        ) || 0)}
                    </span>
                  </h3>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <button
                      onClick={() => openAddEvent(category._id)}
                      className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white text-black hover:bg-white/80 border border-white/10"
                    >
                      Add Event
                    </button>
                    <button
                      onClick={() => handleAddSubcategory(category._id)}
                      className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500"
                    >
                      Add Subcategory
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category._id)}
                      className="w-full sm:w-auto px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500"
                    >
                      Delete Category
                    </button>
                  </div>
                </div>

                {/* Direct Events */}
                {category.Events && category.Events.length > 0 && (
                  <div className="p-5">
                    <h4 className="text-lg font-semibold text-white mb-4">
                      Direct Events
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.Events.sort((a, b) =>
                        a.title.localeCompare(b.title)
                      ).map((event) => (
                        <div
                          key={event._id}
                          className="rounded-xl border border-white/10 bg-black/80 overflow-hidden"
                        >
                          {event.image && (
                            <img
                              src={event.image}
                              alt={event.title}
                              className="w-full h-44 object-cover"
                            />
                          )}
                          <div className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <h4 className="text-lg font-bold text-white">
                                {event.title}
                              </h4>
                              <div className="flex flex-col gap-1 items-end">
                                <span
                                  className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded border ${
                                    event.eventType === "technical"
                                      ? "bg-blue-600/20 text-blue-400 border-blue-500/30"
                                      : "bg-green-600/20 text-green-400 border-green-500/30"
                                  }`}
                                >
                                  {event.eventType === "technical"
                                    ? "Technical"
                                    : "Non-Technical"}
                                </span>
                                <span className="text-[10px] uppercase tracking-wider bg-white/10 text-white px-2 py-1 rounded border border-white/10">
                                  Limit: {event.participantLimit}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-white/70 line-clamp-3">
                              {event.details.description}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
                              <div>
                                <p className="text-white">Venue</p>
                                <p className="text-white/60">
                                  {event.details.venue}
                                </p>
                              </div>
                              <div>
                                <p className="text-white">Date</p>
                                <p className="text-white/60">
                                  {event.details.date}
                                </p>
                              </div>
                              <div>
                                <p className="text-white">Start</p>
                                <p className="text-white/60">
                                  {event.details.startTime}
                                </p>
                              </div>
                              <div>
                                <p className="text-white">End</p>
                                <p className="text-white/60">
                                  {event.details.endTime}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 pt-1">
                              <button
                              onClick={() => handleViewRegisteredStudents(event)}
                              className="px-3 py-2 rounded-md bg-black text-white border border-white/65 hover:bg-white hover:text-black text-xs"
                            >
                              Registrations ({event.registeredStudents?.length || 0})
                            </button>
                              <button
                                onClick={() => openEditEvent(category, event)}
                                className="flex-1 px-3 py-2 rounded-md bg-white text-black hover:bg-white/80"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteEvent(category._id, event._id)
                                }
                                className="flex-1 px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-500"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subcategories */}
                {category.subcategories &&
                  category.subcategories.length > 0 && (
                    <div className="p-5">
                      <h4 className="text-lg font-semibold text-white mb-4">
                        Subcategories
                      </h4>
                      <div className="space-y-6">
                        {category.subcategories
                          .sort((a, b) =>
                            a.subcategoryName.localeCompare(b.subcategoryName)
                          )
                          .map((subcategory) => (
                            <div
                              key={subcategory._id}
                              className="border border-white/10 rounded-xl p-4"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <h5 className="text-lg font-semibold text-white">
                                  {subcategory.subcategoryName}
                                </h5>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      openAddEvent(
                                        category._id,
                                        subcategory._id
                                      )
                                    }
                                    className="px-3 py-1 rounded-md bg-white text-black hover:bg-white/80 text-sm"
                                  >
                                    Add Event
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteSubcategory(
                                        category._id,
                                        subcategory._id
                                      )
                                    }
                                    className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-500 text-sm"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {subcategory.Events.sort((a, b) =>
                                  a.title.localeCompare(b.title)
                                ).map((event) => (
                                  <div
                                    key={event._id}
                                    className="rounded-xl border border-white/10 bg-black/80 overflow-hidden"
                                  >
                                    {event.image && (
                                      <img
                                        src={event.image}
                                        alt={event.title}
                                        className="w-full h-44 object-cover"
                                      />
                                    )}
                                    <div className="p-4 space-y-3">
                                      <div className="flex items-start justify-between gap-3">
                                        <h4 className="text-lg font-bold text-white">
                                          {event.title}
                                        </h4>
                                        <div className="flex flex-col gap-1 items-end">
                                          <span
                                            className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded border ${
                                              event.eventType === "technical"
                                                ? "bg-blue-600/20 text-blue-400 border-blue-500/30"
                                                : "bg-green-600/20 text-green-400 border-green-500/30"
                                            }`}
                                          >
                                            {event.eventType === "technical"
                                              ? "Technical"
                                              : "Non-Technical"}
                                          </span>
                                          <span className="text-[10px] uppercase tracking-wider bg-white/10 text-white px-2 py-1 rounded border border-white/10">
                                            Limit: {event.participantLimit}
                                          </span>
                                        </div>
                                      </div>
                                      <p className="text-sm text-white/70 line-clamp-3">
                                        {event.details.description}
                                      </p>
                                      <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
                                        <div>
                                          <p className="text-white">Venue</p>
                                          <p className="text-white/60">
                                            {event.details.venue}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-white">Date</p>
                                          <p className="text-white/60">
                                            {event.details.date}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-white">Start</p>
                                          <p className="text-white/60">
                                            {event.details.startTime}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-white">End</p>
                                          <p className="text-white/60">
                                            {event.details.endTime}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex gap-2 pt-1">
                                        <button   
                                    onClick={() => handleViewRegisteredStudents(event)}
                                    className="px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-500 text-xs"
                                  >
                                    Students ({event.registeredStudents?.length || 0})
                                  </button>
                                        <button
                                          onClick={() =>
                                            openEditEvent(
                                              category,
                                              event,
                                              subcategory
                                            )
                                          }
                                          className="flex-1 px-3 py-2 rounded-md bg-white text-black hover:bg-white/80"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDeleteEvent(
                                              category._id,
                                              event._id,
                                              subcategory._id
                                            )
                                          }
                                          className="flex-1 px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-500"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {subcategory.Events.length === 0 && (
                                  <p className="col-span-full text-center text-white/60">
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
                  (!category.subcategories ||
                    category.subcategories.length === 0) && (
                    <div className="p-5">
                      <p className="text-center text-white/60">
                        No events or subcategories in this category.
                      </p>
                    </div>
                  )}
              </div>
            ))}
        </div>
      </div>

      {showCategoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          style={{ overflow: "hidden" }}
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="w-full max-w-md rounded-2xl bg-black border border-white/10 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-white/10 flex-shrink-0">
              <h3 className="text-xl font-semibold text-white">Add Category</h3>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm mb-1 text-white">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={categoryForm.categoryName}
                    onChange={(e) =>
                      setCategoryForm({ categoryName: e.target.value })
                    }
                    required
                    className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    placeholder="e.g. Coding"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-red-600 py-2 hover:bg-red-500 text-white"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="flex-1 rounded-lg bg-white py-2 text-black hover:bg-white/80"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showSubcategoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          style={{ overflow: "hidden" }}
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="w-full max-w-md rounded-2xl bg-black border border-white/10 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-white/10 flex-shrink-0">
              <h3 className="text-xl font-semibold text-white">
                Add Subcategory
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <form
                onSubmit={handleSubcategorySubmit}
                className="p-6 space-y-4"
              >
                <div>
                  <label className="block text-sm mb-1 text-white">
                    Subcategory Name
                  </label>
                  <input
                    type="text"
                    value={subcategoryForm.subcategoryName}
                    onChange={(e) =>
                      setSubcategoryForm({ subcategoryName: e.target.value })
                    }
                    required
                    className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    placeholder="e.g. Web Development"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-red-600 py-2 hover:bg-red-500 text-white"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSubcategoryModal(false)}
                    className="flex-1 rounded-lg bg-white py-2 text-black hover:bg-white/80"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showRegisteredStudents && selectedEventStudents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" style={{ overflow: "hidden" }} onWheel={(e) => e.stopPropagation()}>
          <div className="w-full max-w-4xl rounded-2xl bg-black border border-white/10 my-6 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-semibold text-white">
                  Registered Students - {selectedEventStudents.title}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      try {
                        const students = selectedEventStudents.registeredStudents || [];
                        const exportData = students.map((s) => ({
                          "Full Name": s.fullName,
                          Email: s.email,
                          College: s.college,
                          "College ID": s.collegeId,
                          Event: selectedEventStudents.title,
                        }));
                        const ws = XLSX.utils.json_to_sheet(exportData);
                        const wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, "Registrations");
                        const fileName = `${selectedEventStudents.title}_registrations_${new Date().toISOString().split("T")[0]}.xlsx`;
                        XLSX.writeFile(wb, fileName);
                      } catch (err) {
                        console.error(err);
                        alert("Failed to export. Please try again.");
                      }
                    }}
                    className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-500 text-sm"
                  >
                    Export to Excel
                  </button>
                  <button
                    onClick={() => setShowRegisteredStudents(false)}
                    className="px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {selectedEventStudents.registeredStudents && selectedEventStudents.registeredStudents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedEventStudents.registeredStudents.map((student) => (
                    <div key={student._id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="text-white font-semibold">{student.fullName}</h4>
                      <p className="text-white/70 text-sm">{student.email}</p>
                      <p className="text-white/70 text-sm">{student.college}</p>
                      <p className="text-white/70 text-sm">ID: {student.collegeId}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-white/60">No students registered for this event yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showEventModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          style={{ overflow: "hidden" }}
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="w-full max-w-2xl rounded-2xl bg-black border border-white/10 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-white/10 flex-shrink-0">
              <h3 className="text-xl font-semibold text-white">
                {editingEvent ? "Edit Event" : "Add Event"}
                {selectedSubcategoryId && " (Subcategory)"}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <form onSubmit={handleEventSubmit} className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-4 border border-white/10 rounded-xl p-4">
                  <div className="space-y-2">
                    <label className=" text-sm text-white flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4 text-white"
                      >
                        <path d="M3 6a3 3 0 013-3h6a3 3 0 013 3v1h3a1 1 0 110 2h-3v6a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm12 1V6a1 1 0 00-1-1H6a1 1 0 00-1 1v1h10z" />
                      </svg>
                      Title
                    </label>
                    <input
                      type="text"
                      value={eventForm.title}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, title: e.target.value })
                      }
                      required
                      className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                      placeholder="Event title"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className=" text-sm text-white flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4 text-white"
                      >
                        <path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
                      </svg>
                      Venue
                    </label>
                    <input
                      type="text"
                      value={eventForm.venue}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, venue: e.target.value })
                      }
                      required
                      className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                      placeholder="Venue name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className=" text-sm text-white flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4 text-white"
                      >
                        <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
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
                      required
                      className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="technical">Technical</option>
                      <option value="non-technical">Non-Technical</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className=" text-sm text-white flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4 text-white"
                      >
                        <path d="M7 2a1 1 0 011 1v1h8V3a1 1 0 112 0v1h1a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h1V3a1 1 0 112 0v1zm13 6H4v10h16V8z" />
                      </svg>
                      Date
                    </label>
                    <input
                      type="date"
                      value={eventForm.date}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, date: e.target.value })
                      }
                      required
                      className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className=" text-sm text-white flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4 text-white"
                        >
                          <path d="M12 1a11 11 0 1011 11A11.013 11.013 0 0012 1zm.75 11.25V6.5a.75.75 0 00-1.5 0v6a.75.75 0 00.44.68l4 2a.75.75 0 10.66-1.34z" />
                        </svg>
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={eventForm.startTime}
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            startTime: e.target.value,
                          })
                        }
                        required
                        className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className=" text-sm text-white flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4 text-white"
                        >
                          <path d="M12 1a11 11 0 1011 11A11.013 11.013 0 0012 1z" />
                          <path d="M13 12.75V6.5a1 1 0 10-2 0v6.75a1 1 0 00.55.89l4.5 2.25a1 1 0 10.9-1.78z" />
                        </svg>
                        End Time
                      </label>
                      <input
                        type="time"
                        value={eventForm.endTime}
                        onChange={(e) =>
                          setEventForm({
                            ...eventForm,
                            endTime: e.target.value,
                          })
                        }
                        required
                        className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Description & Image */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border border-white/10 rounded-xl p-4 space-y-2">
                    <label className="block text-sm text-white">
                      Description
                    </label>
                    <textarea
                      value={eventForm.description}
                      onChange={(e) =>
                        setEventForm({
                          ...eventForm,
                          description: e.target.value,
                        })
                      }
                      required
                      className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-white min-h-[120px] focus:outline-none focus:border-red-500"
                      placeholder="Describe the event"
                    />
                  </div>
                  <div className="border border-white/10 rounded-xl p-4">
                    <label className="block text-sm text-white mb-2">
                      Event Image
                    </label>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleEventImageChange}
                      className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-white"
                    />
                    <p className="text-xs text-white/60 mt-2">
                      Max size 2MB. Formats: JPG, JPEG, PNG, WEBP.
                    </p>
                    {eventForm.image && (
                      <img
                        src={eventForm.image}
                        alt="preview"
                        className="mt-3 w-full max-w-xs h-40 object-cover rounded border border-white/20"
                      />
                    )}
                  </div>
                </div>

                {/* Limits & Terms */}
                <div className="grid md:grid-cols-2 gap-4 border border-white/10 rounded-xl p-4">
                  <div className="space-y-2">
                    <label className="block text-sm text-white">
                      Participant Limit
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
                      required
                      className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm text-white">
                      Terms & Conditions
                    </label>
                    <textarea
                      value={eventForm.termsandconditions}
                      onChange={(e) =>
                        setEventForm({
                          ...eventForm,
                          termsandconditions: e.target.value,
                        })
                      }
                      required
                      className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-white min-h-[120px] focus:outline-none focus:border-red-500"
                      placeholder="Basic rules and terms"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-red-600 py-2 hover:bg-red-500 text-white"
                  >
                    {editingEvent ? "Update" : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={closeEventModal}
                    className="flex-1 rounded-lg bg-white py-2 text-black hover:bg-white/80"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {notification.open && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div
            className={`min-w-[280px] max-w-md px-4 py-3 rounded-xl border backdrop-blur-sm ${
              notification.type === "success"
                ? "bg-white text-black border-white/20"
                : notification.type === "error"
                ? "bg-red-600 text-white border-white/20"
                : "bg-black/80 text-white border-white/20"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm">{notification.message}</p>
              <button
                onClick={() =>
                  setNotification({ open: false, type: "info", message: "" })
                }
                className="text-sm opacity-80 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmState.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="w-full max-w-sm rounded-2xl bg-black p-6 border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-2">Confirm</h4>
            <p className="text-white/80 mb-4 text-sm">{confirmState.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const fn = confirmState.onConfirm;
                  if (fn) fn();
                }}
                className="flex-1 rounded-lg bg-red-600 py-2 text-white hover:bg-red-500"
              >
                Yes, Continue
              </button>
              <button
                onClick={() =>
                  setConfirmState({ open: false, message: "", onConfirm: null })
                }
                className="flex-1 rounded-lg bg-white py-2 text-black hover:bg-white/80"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPanel;
