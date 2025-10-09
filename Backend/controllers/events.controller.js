import Event from "../models/events.model.js";
import User from "../models/user.model.js";
import redisClient from "../redisClient.js"; 


const CACHE_KEY = "all_events";
const CACHE_DURATION = 300; 


const clearEventsCache = async () => {
  try {
    // Clear all cache keys related to events
    const keys = await redisClient.keys(`${CACHE_KEY}*`);
    if (keys.length > 0) {
      await redisClient.del(...keys);
      console.log(`Cleared ${keys.length} event cache keys`);
    }
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Create cache key with pagination
    const paginatedCacheKey = `${CACHE_KEY}_page_${page}_limit_${limit}`;
    
    // Check for cached paginated results
    const cachedEvents = await redisClient.get(paginatedCacheKey);
    if (cachedEvents) {
      console.log(`Serving paginated events from Redis cache (page ${page}).`);
      return res.status(200).json(JSON.parse(cachedEvents));
    }

    console.log(`Fetching paginated events from database (page ${page}, limit ${limit}).`);
    
    // Get total count for pagination info
    const totalCategories = await Event.countDocuments();
    
    // Fetch paginated events with optimized query
    const events = await Event.find()
      .skip(skip)
      .limit(limit)
      .populate([
        {
          path: "Events.registeredStudents",
          select: "fullName email college collegeId",
          options: { limit: 10 } // Limit populated students for performance
        },
        {
          path: "subcategories.Events.registeredStudents",
          select: "fullName email college collegeId",
          options: { limit: 10 } // Limit populated students for performance
        }
      ])
      .lean() // Use lean() for better performance
      .sort({ categoryName: 1 }); // Sort by category name for consistent ordering

    // Calculate pagination info
    const totalPages = Math.ceil(totalCategories / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const response = {
      events,
      pagination: {
        currentPage: page,
        totalPages,
        totalCategories,
        hasNextPage,
        hasPrevPage,
        limit
      }
    };

    // Cache paginated results
    await redisClient.setex(paginatedCacheKey, CACHE_DURATION, JSON.stringify(response));

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all events without pagination (for admin use)
export const getAllEventsAdmin = async (req, res) => {
  try {
    const cachedEvents = await redisClient.get(CACHE_KEY);
    if (cachedEvents) {
      console.log("Serving all events from Redis cache.");
      return res.status(200).json(JSON.parse(cachedEvents));
    }

    console.log("Fetching all events from database.");
    const events = await Event.find().populate([
      {
        path: "Events.registeredStudents",
        select: "fullName email college collegeId",
      },
      {
        path: "subcategories.Events.registeredStudents",
        select: "fullName email college collegeId",
      }
    ]);

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

    // Enforce payment approval rules
    const user = await User.findById(userId).select("college paymentStatus isApproved email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.isApproved) {
      return res.status(403).json({ message: "Your account is not approved yet." });
    }
    if (user.paymentStatus !== "approved") {
      const isKLEmail = typeof user.email === "string" && user.email.toLowerCase().endsWith("@kluniversity.in");
      const msg = isKLEmail
        ? "Please pay the event fee in ERP to complete your registration."
        : "Your registration payment is pending approval.";
      return res.status(403).json({ message: msg });
    }

    
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
      $or: [
        { "Events.registeredStudents": userId },
        { "subcategories.Events.registeredStudents": userId }
      ]
    });


    const newEventDate = event.details.date;
    const newEventStart = event.details.startTime;
    const newEventEnd = event.details.endTime;
    for (const cat of registeredEvents) {
      // Check direct events
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
      
      // Check subcategory events
      for (const subcat of cat.subcategories || []) {
        for (const registeredEvent of subcat.Events) {
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
      eventType: req.body.eventType,
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

// Subcategory functions
export const createSubcategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { subcategoryName } = req.body;

    if (!subcategoryName) {
      return res.status(400).json({ message: "Subcategory name is required" });
    }

    const category = await Event.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if subcategory already exists
    const existingSubcategory = category.subcategories.find(
      (sub) => sub.subcategoryName === subcategoryName
    );
    if (existingSubcategory) {
      return res.status(400).json({ message: "Subcategory already exists" });
    }

    category.subcategories.push({
      subcategoryName,
      Events: [],
    });

    await category.save();
    await clearEventsCache();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteSubcategory = async (req, res) => {
  try {
    const { categoryId, subcategoryId } = req.params;

    const category = await Event.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const subcategoryIndex = category.subcategories.findIndex(
      (sub) => sub._id.toString() === subcategoryId
    );
    if (subcategoryIndex === -1) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    category.subcategories.splice(subcategoryIndex, 1);
    await category.save();

    await clearEventsCache();
    res.status(200).json({ message: "Subcategory deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Subcategory event functions
export const createEventInSubcategory = async (req, res) => {
  try {
    const { categoryId, subcategoryId } = req.params;
    const category = await Event.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const subcategory = category.subcategories.find(
      (sub) => sub._id.toString() === subcategoryId
    );
    if (!subcategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    const maxEventId = Math.max(...subcategory.Events.map((e) => e.eventId), 0);
    const newEventId = maxEventId + 1;

    subcategory.Events.push({
      title: req.body.title,
      eventId: newEventId,
      details: req.body.details,
      image: req.body.image,
      termsandconditions: req.body.termsandconditions,
      registeredStudents: [],
      participantLimit: req.body.participantLimit || 100,
    });

    await category.save();
    await clearEventsCache();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateEventInSubcategory = async (req, res) => {
  try {
    const { categoryId, subcategoryId, eventId } = req.params;
    const category = await Event.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const subcategory = category.subcategories.find(
      (sub) => sub._id.toString() === subcategoryId
    );
    if (!subcategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    const event = subcategory.Events.find((e) => e._id.toString() === eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    Object.assign(event, {
      title: req.body.title,
      details: req.body.details,
      image: req.body.image,
      termsandconditions: req.body.termsandconditions,
      participantLimit: req.body.participantLimit,
      eventType: req.body.eventType,
    });

    await category.save();
    await clearEventsCache();
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteEventInSubcategory = async (req, res) => {
  try {
    const { categoryId, subcategoryId, eventId } = req.params;

    const category = await Event.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const subcategory = category.subcategories.find(
      (sub) => sub._id.toString() === subcategoryId
    );
    if (!subcategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    const eventIndex = subcategory.Events.findIndex(
      (event) => event._id.toString() === eventId
    );
    if (eventIndex === -1) {
      return res.status(404).json({ message: "Event not found" });
    }

    subcategory.Events.splice(eventIndex, 1);
    await category.save();

    await clearEventsCache();
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const registerForSubcategoryEvent = async (req, res) => {
  try {
    const { categoryId, subcategoryId, eventId } = req.params;
    const userId = req.user._id;

    // Enforce payment approval rules
    const user = await User.findById(userId).select("college paymentStatus isApproved email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.isApproved) {
      return res.status(403).json({ message: "Your account is not approved yet." });
    }
    if (user.paymentStatus !== "approved") {
      const isKLEmail = typeof user.email === "string" && user.email.toLowerCase().endsWith("@kluniversity.in");
      const msg = isKLEmail
        ? "Please pay the event fee in ERP to complete your registration."
        : "Your registration payment is pending approval.";
      return res.status(403).json({ message: msg });
    }

    const category = await Event.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const subcategory = category.subcategories.find(
      (sub) => sub._id.toString() === subcategoryId
    );
    if (!subcategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    const event = subcategory.Events.find((e) => e._id.toString() === eventId);
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

    // Check for time conflicts (same logic as regular events)
    const registeredEvents = await Event.find({
      $or: [
        { "Events.registeredStudents": userId },
        { "subcategories.Events.registeredStudents": userId }
      ]
    });

    const newEventDate = event.details.date;
    const newEventStart = event.details.startTime;
    const newEventEnd = event.details.endTime;

    for (const cat of registeredEvents) {
      // Check direct events
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

      // Check subcategory events
      for (const sub of cat.subcategories) {
        for (const registeredEvent of sub.Events) {
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
    }

    event.registeredStudents.push(userId);
    await category.save();

    await clearEventsCache();
    res.status(200).json({ message: "Successfully registered for event" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unregisterFromSubcategoryEvent = async (req, res) => {
  try {
    const { categoryId, subcategoryId, eventId } = req.params;
    const userId = req.user._id;

    const category = await Event.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const subcategory = category.subcategories.find(
      (sub) => sub._id.toString() === subcategoryId
    );
    if (!subcategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    const event = subcategory.Events.find((e) => e._id.toString() === eventId);
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

    await clearEventsCache();
    res.status(200).json({ message: "Successfully unregistered from event" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
