import redisClient from "../redisClient.js";

// Simple Redis-backed queue using RPUSH/BLPOP
// Queue name
const EMAIL_QUEUE_KEY = process.env.EMAIL_QUEUE_KEY || "queue:emails";

export const enqueueCertificateEmail = async (payload) => {
  // payload: { toEmail, fullName, college, collegeId, eventTitle }
  try {
    const job = JSON.stringify({ type: "certificate", payload, enqueuedAt: Date.now() });
    await redisClient.rpush(EMAIL_QUEUE_KEY, job);
  } catch (err) {
    console.error("Failed to enqueue email job:", err);
  }
};

export const getEmailQueueKey = () => EMAIL_QUEUE_KEY;

export default enqueueCertificateEmail;


