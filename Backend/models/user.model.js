import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["user", "admin","hod","manager"],
      default: "user",
    },
    password: {
      type: String,
      required: true,
    },
    college: {
      type: String,
      required: true,
    },
    collegeId: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    transactionId: {
      type: String,
    },
    paymentProof: {
      type: String,
    },
    profileImage: {
      type: String,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    registeredEvents: {
      type: [String],
      default: [],
    },
    paymentId: String,
    paymentScreenshot: String,
    state: {
      type: String,
    },
    address: {
      type: String,
    },
    registrationData: {
      type: {
        originalPassword: String,
        college: String,
        collegeId: String,
        fullName: String,
      },
      required: false,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^\+?[\d\s-]{10,15}$/.test(v);
        },
        message: props => `${props.value} is not a valid phone number!`
      }
    },
    paymentDetails: {
      orderId: String,
      amount: String,
      status: {
        type: String,
        enum: ['initiated', 'completed', 'failed'],
        default: 'initiated'
      },
      transactionId: String,
      transactionDate: Date
    },
    country: {
      type: String,
      required: true,
    },
    hasEntered: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
