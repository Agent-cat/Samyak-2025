import Event from "../models/events.model.js";
import redisClient from "../redisClient.js"; 


const CACHE_KEY = "all_events";
const CACHE_DURATION = 300; 


const clearEventsCache = async () => {
  try {
    await redisClient.del(CACHE_KEY);
    console.log("cleared");
  } catch (error) {
    console.error("Error clearing events cache:", error);
  }
};

export const createEvent = async (req, res) => {
  try {
    const event = new Event(req.body);
    const savedEvent = await event.save();
    await clearEventsCache(); 
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    
    const cachedEvents = await redisClient.get(CACHE_KEY);
    if (cachedEvents) {
      console.log("Serving events from Redis cache.");
      return res.status(200).json(JSON.parse(cachedEvents));
    }

    
    console.log("Fetching events from database.");
    const events = await Event.find().populate({
      path: "Events.registeredStudents",
      select: "fullName email college collegeId",
    });

    
    await redisClient.setex(CACHE_KEY, CACHE_DURATION, JSON.stringify(events));

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
    await clearEventsCache(); 
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
    await clearEventsCache();
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const registerForEvent = async (req, res) => {
  try {
    const { categoryId, eventId } = req.params;
    const userId = req.user._id;

    
    const category = await Event.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    
    const event = category.Events.find((e) => e._id.toString() === eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    
    if (event.registeredStudents.includes(userId)) {
      return res
        .status(400)
        .json({ message: "Already registered for this event" });
    }

    if (event.registeredStudents.length >= event.participantLimit) {
      return res
        .status(400)
        .json({ message: "Event has reached maximum participants limit" });
    }

 
    const registeredEvents = await Event.find({
      "Events.registeredStudents": userId,
    });


    const newEventDate = event.details.date;
    const newEventStart = event.details.startTime;
    const newEventEnd = event.details.endTime;
    for (const cat of registeredEvents) {
      for (const registeredEvent of cat.Events) {
        if (registeredEvent.registeredStudents.includes(userId)) {
          const registeredEventDate = registeredEvent.details.date;
          const registeredEventStart = registeredEvent.details.startTime;
          const registeredEventEnd = registeredEvent.details.endTime;

          if (
            registeredEventDate === newEventDate &&
            (newEventStart < registeredEventEnd && newEventEnd > registeredEventStart)
          ) {
            return res.status(400).json({
              message: "Time conflict: You are already registered for another event at this time",
              conflictingEvent: {
                title: registeredEvent.title,
                date: registeredEventDate,
                startTime: registeredEventStart,
                endTime: registeredEventEnd,
              }
            });
          }
        }
      }
    }

    event.registeredStudents.push(userId);
    await category.save();

    await clearEventsCache(); 
    res.status(200).json({ message: "Successfully registered for event" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRegisteredEvents = async (req, res) => {
  try {
    const userId = req.user._id;

    const categories = await Event.find({
      "Events.registeredStudents": userId,
    });

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

    console.log("Found registered events:", registeredEvents);
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

    const category = await Event.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const event = category.Events.find((e) => e._id.toString() === eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!event.registeredStudents.includes(userId)) {
      return res
        .status(400)
        .json({ message: "Not registered for this event" });
    }

    event.registeredStudents = event.registeredStudents.filter(
      (id) => id.toString() !== userId.toString()
    );

    await category.save();

    await clearEventsCache(); // Invalidate cache on unregister
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

    const maxEventId = Math.max(...category.Events.map((e) => e.eventId), 0);
    const newEventId = maxEventId + 1;

    category.Events.push({
      title: req.body.title,
      eventId: newEventId,
      details: req.body.details,
      image: req.body.image,
      termsandconditions: req.body.termsandconditions,
      registeredStudents: [],
      participantLimit: req.body.participantLimit || 100,
    });

    await category.save();
    await clearEventsCache(); // Invalidate cache on create
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
      participantLimit: req.body.participantLimit,
    });

    await category.save();
    await clearEventsCache(); // Invalidate cache on update
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
    await clearEventsCache(); // Invalidate cache on create
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

    await clearEventsCache(); // Invalidate cache on delete
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

    await clearEventsCache(); // Invalidate cache on delete
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
