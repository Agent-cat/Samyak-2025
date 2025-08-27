import Event from "../models/events.model.js";

export const createEvent = async (req, res) => {
  try {
    const event = new Event(req.body);
    const savedEvent = await event.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate({
      path: "Events.registeredStudents",
      select: "fullName email college collegeId",
    });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "Events.registeredStudents",
      "fullName college collegeId email termsandconditions"
    );
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate(
      "Events.registeredStudents",
      "fullName college collegeId email termsandconditions"
    );
    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const registerForEvent = async (req, res) => {
  try {
    const { categoryId, eventId } = req.params;
    const userId = req.user._id;

    // Find the category
    const category = await Event.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Find the specific event in the category
    const event = category.Events.find((e) => e._id.toString() === eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user is already registered
    if (event.registeredStudents.includes(userId)) {
      return res
        .status(400)
        .json({ message: "Already registered for this event" });
    }

    // Check if event has reached participant limit
    if (event.registeredStudents.length >= event.participantLimit) {
      return res
        .status(400)
        .json({ message: "Event has reached maximum participants limit" });
    }

    // Get all categories to check for time conflicts
    const allCategories = await Event.find();
    const eventDate = event.details.date;
    const eventTime = event.details.time;

    // Check for time conflicts with other registered events
    for (const cat of allCategories) {
      for (const evt of cat.Events) {
        if (evt.registeredStudents.includes(userId)) {
          const evtStart = evt.details.startTime;
          const evtEnd = evt.details.endTime;
          if (evt.details.date === eventDate &&
            ((evtStart < event.details.endTime && evtEnd > event.details.startTime))) {
            return res.status(400).json({
              message: "Time conflict: You are already registered for another event at this time",
              conflictingEvent: {
                title: evt.title,
                date: evt.details.date,
                startTime: evt.details.startTime,
                endTime: evt.details.endTime
              }
            });
          }
        }
      }
    }

    // Add user to registered students
    event.registeredStudents.push(userId);
    await category.save();

    res.status(200).json({ message: "Successfully registered for event" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRegisteredEvents = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all categories that have events with this user registered
    const categories = await Event.find({
      "Events.registeredStudents": userId,
    });

    // Format the response to include only registered events
    const registeredEvents = categories.flatMap((category) =>
      category.Events.filter((event) =>
        event.registeredStudents.includes(userId)
      ).map((event) => ({
        eventId: event._id,
        categoryId: category._id,
        categoryName: category.categoryName,
        title: event.title,
        details: event.details,
        image: event.image,
        date: event.details.date,
        time: event.details.time,
        venue: event.details.venue,
      }))
    );

    console.log("Found registered events:", registeredEvents); // Debug log
    res.status(200).json(registeredEvents);
  } catch (error) {
    console.error("Error in getRegisteredEvents:", error);
    res.status(500).json({ message: error.message });
  }
};

export const unregisterFromEvent = async (req, res) => {
  try {
    const { categoryId, eventId } = req.params;
    const userId = req.user._id;

    // Find the category
    const category = await Event.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Find the specific event in the category
    const event = category.Events.find((e) => e._id.toString() === eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user is registered
    if (!event.registeredStudents.includes(userId)) {
      return res
        .status(400)
        .json({ message: "Not registered for this event" });
    }

    // Remove user from registered students
    event.registeredStudents = event.registeredStudents.filter(
      (id) => id.toString() !== userId.toString()
    );

    await category.save();

    res.status(200).json({ message: "Successfully unregistered from event" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createEventInCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Event.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Get max eventId and increment by 1
    const maxEventId = Math.max(...category.Events.map((e) => e.eventId), 0);
    const newEventId = maxEventId + 1;

    category.Events.push({
      title: req.body.title,
      eventId: newEventId,
      details: req.body.details,
      image: req.body.image,
      termsandconditions: req.body.termsandconditions,
      registeredStudents: [],
      participantLimit: req.body.participantLimit || 100, // Default to 100 if not provided
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateEventInCategory = async (req, res) => {
  try {
    const { categoryId, eventId } = req.params;
    const category = await Event.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const event = category.Events.find((e) => e._id.toString() === eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    Object.assign(event, {
      title: req.body.title,
      details: req.body.details,
      image: req.body.image,
      termsandconditions: req.body.termsandconditions,
      participantLimit: req.body.participantLimit, // Ensure this is updated
    });

    await category.save();
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;

    if (!categoryName) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existingCategory = await Event.findOne({ categoryName });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const newCategory = new Event({
      categoryName,
      Events: [],
    });

    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const deletedCategory = await Event.findByIdAndDelete(categoryId);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const deleteEventInCategory = async (req, res) => {
  try {
    const { categoryId, eventId } = req.params;

    const category = await Event.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const eventIndex = category.Events.findIndex(
      (event) => event._id.toString() === eventId
    );
    if (eventIndex === -1) {
      return res.status(404).json({ message: "Event not found" });
    }

    category.Events.splice(eventIndex, 1);
    await category.save();

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
