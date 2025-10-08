import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
  },
  subcategories: [
    {
      subcategoryName: {
        type: String,
        required: true,
      },
      Events: [
        {
          title: {
            type: String,
            required: true,
          },
          eventId: {
            type: Number,
            required: true,
          },
          details: {
            description: {
              type: String,
              required: true,
            },
            venue: {
              type: String,
              required: true,
            },
            date: {
              type: String,
              required: true,
            },
            startTime: {
              type: String,
              required: true,
              default: "09:00"
            },
            endTime: {
              type: String,
              required: true,
              default: "17:00"
            },
          },
          registeredStudents: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
          ],
          participantLimit: {
            type: Number,
            required: true,
            default: 100
          },
          termsandconditions: {
            type: String,
            required: true,
          },
          image: {
            type: String,
            required: true,
          },
          eventType: {
            type: String,
            required: true,
            enum: ["technical", "non-technical"],
            default: "technical"
          },
        },
      ],
    },
  ],
  // Keep backward compatibility with direct Events array
  Events: [
    {
      title: {
        type: String,
        required: true,
      },
      eventId: {
        type: Number,
        required: true,
      },
      details: {
        description: {
          type: String,
          required: true,
        },
        venue: {
          type: String,
          required: true,
        },
        date: {
          type: String,
          required: true,
        },
        startTime: {
          type: String,
          required: true,
          default: "09:00"
        },
        endTime: {
          type: String,
          required: true,
          default: "17:00"
        },
      },
      registeredStudents: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      participantLimit: {
        type: Number,
        required: true,
        default: 100
      },
      termsandconditions: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      eventType: {
        type: String,
        required: true,
        enum: ["technical", "non-technical"],
        default: "technical"
      },
    },
  ],
});

// Add indexes for better query performance
eventSchema.index({ categoryName: 1 });
eventSchema.index({ "Events.registeredStudents": 1 });
eventSchema.index({ "subcategories.Events.registeredStudents": 1 });
eventSchema.index({ "Events.eventType": 1 });
eventSchema.index({ "subcategories.Events.eventType": 1 });

export default mongoose.model("Event", eventSchema);
